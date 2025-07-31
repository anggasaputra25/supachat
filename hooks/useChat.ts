'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TMessage } from "@/types/message";
import { TProfile } from "@/types/profile";
import { useRouter } from 'next/navigation';

export const useChat = (username: string) => {
  const router = useRouter();
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [recipient, setRecipient] = useState<TProfile | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize processed messages to avoid unnecessary re-renders
  const processedMessages = useMemo(() => {
    if (!profile?.id) return messages;
    
    return messages.map((msg) => ({
      ...msg,
      isSender: msg.sender_id === profile.id,
    }));
  }, [messages, profile?.id]);

  // Optimized message reading with debounce
  const markMessagesAsRead = useCallback(async (messagesToRead: TMessage[]) => {
    if (!profile?.id || !chatId || messagesToRead.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messagesToRead.map((msg) => msg.id));

      if (error) {
        console.error('Failed to update is_read:', error);
        return;
      }

      // Update local state optimistically
      setMessages((prev) =>
        prev.map((msg) =>
          messagesToRead.find((um) => um.id === msg.id)
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [profile?.id, chatId]);

  // Debounced mark as read to avoid excessive API calls
  const debouncedMarkAsRead = useCallback((unreadMessages: TMessage[]) => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      markMessagesAsRead(unreadMessages);
    }, 500);
  }, [markMessagesAsRead]);

  // Main data fetching effect
  useEffect(() => {
    const fetchChatData = async () => {
      // Cleanup previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setLoading(true);
        setError(null);

        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser?.user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        if (signal.aborted) return;

        const currentUserId = authUser.user.id;

        // Fetch current profile and recipient in parallel
        const [profileResponse, recipientResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single(),
          supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single()
        ]);

        if (signal.aborted) return;

        const { data: currentProfile, error: profileError } = profileResponse;
        const { data: recipientData, error: recipientError } = recipientResponse;

        if (profileError || !currentProfile) {
          setError('Failed to get current user profile');
          setLoading(false);
          return;
        }

        if (recipientError || !recipientData) {
          setError('Recipient not found');
          setLoading(false);
          router.push('/undefined');
          return;
        }

        setProfile(currentProfile);
        setRecipient(recipientData);

        // Find or create chat
        const { data: existingChat } = await supabase
          .from('chats')
          .select('*')
          .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${recipientData.id}),and(user1_id.eq.${recipientData.id},user2_id.eq.${currentUserId})`)
          .maybeSingle();

        if (signal.aborted) return;

        let chat_id = existingChat?.id;

        if (!chat_id) {
          const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
              user1_id: currentUserId,
              user2_id: recipientData.id,
            })
            .select()
            .single();

          if (createError || !newChat) {
            setError('Failed to create chat');
            setLoading(false);
            return;
          }

          chat_id = newChat.id;
        }

        setChatId(chat_id);

        // Load messages
        const { data: loadedMessages, error: msgErr } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat_id)
          .order('created_at', { ascending: true });

        if (signal.aborted) return;

        if (msgErr) {
          setError('Failed to load messages');
          setLoading(false);
          return;
        }

        setMessages(loadedMessages || []);

        // Mark unread messages as read after a delay
        const unreadMessages = (loadedMessages || []).filter(
          (msg) => !msg.is_read && msg.sender_id !== currentUserId
        );

        if (unreadMessages.length > 0) {
          debouncedMarkAsRead(unreadMessages);
        }

        setLoading(false);

      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching chat data:', err);
          setError('Failed to load chat data');
          setLoading(false);
        }
      }
    };

    if (username) {
      fetchChatData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [username, router, debouncedMarkAsRead]);

  // Realtime listener effect
  useEffect(() => {
    if (!chatId || !profile?.id) return;

    const channel = supabase
      .channel(`messages:chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const message = payload.new as TMessage;
          const isSender = message.sender_id === profile.id;

          // Prevent duplicate messages by checking if message already exists
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            
            return [...prev, message];
          });

          // If not sender, mark as read with debounce
          if (!isSender) {
            debouncedMarkAsRead([message]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as TMessage;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? {
                    ...msg,
                    deleted_at: updatedMessage.deleted_at,
                    is_read: updatedMessage.is_read,
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, profile?.id, debouncedMarkAsRead]);

  // Optimized input handler
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setInput(e.target.value);
  }, []);

  // Send handler without optimistic updates to avoid duplicates
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !profile || !chatId || sending) return;

    setSending(true);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: profile.id,
          content: trimmed,
          is_read: false,
        })
        .select()
        .single();

      if (messageError || !messageData) {
        setError('Failed to send message');
        setInput(trimmed); // Restore input
        return;
      }

      // Message will be added by real-time listener, no need to update state here

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }, [input, profile, chatId, sending]);

  // Handle key press for sending
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, []);

  return {
    profile,
    recipient,
    loading,
    error,
    messages: processedMessages,
    input,
    sending,
    textareaRef,
    handleInput,
    handleSend,
    handleKeyPress,
    setError, // For clearing errors
  };
};