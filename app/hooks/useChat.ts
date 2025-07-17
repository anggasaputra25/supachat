import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TMessage } from "@/app/types/message";
import { TProfile } from "@/app/types/profile";

export const useChat = (username: string) => {
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch profile, chat, and messages
  useEffect(() => {
    const fetchChatData = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) return;

      const currentUserId = authUser.user.id;

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (profileError || !currentProfile) {
        console.error('Failed to get current user profile:', profileError);
        return;
      }

      setProfile(currentProfile);

      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (recipientError || !recipient) {
        console.error('Recipient not found:', recipientError);
        return;
      }

      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${recipient.id}),and(user1_id.eq.${recipient.id},user2_id.eq.${currentUserId})`)
        .maybeSingle();

      let chat_id = existingChat?.id;

      if (!chat_id) {
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            user1_id: currentUserId,
            user2_id: recipient.id,
          })
          .select()
          .single();

        if (createError || !newChat) {
          console.log('Failed to create chat:', createError);
          return;
        }

        chat_id = newChat.id;
      }

      setChatId(chat_id);

      const { data: loadedMessages, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chat_id)
        .order('created_at', { ascending: true });

      if (msgErr) {
        console.error('Failed to load messages:', msgErr);
        return;
      }

      setMessages(
        loadedMessages.map((msg) => ({
          ...msg,
          isSender: msg.sender_id === currentUserId,
        }))
      );

      setLoading(false);
    };

    fetchChatData();
  }, [username]);

  // Realtime listener for INSERT and UPDATE
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

          // Tambahkan pesan ke state
          setMessages((prev) => [
            ...prev,
            {
              ...message,
              isSender,
            },
          ]);

          // Jika bukan pengirim, tandai sebagai sudah dibaca
          if (!isSender) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', message.id);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === message.id ? { ...msg, is_read: true } : msg
              )
            );
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
  }, [chatId, profile?.id]);

  // Tandai pesan sebagai sudah dibaca jika user buka halaman ini
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!profile?.id || !chatId || messages.length === 0) return;

      const unreadMessages = messages.filter(
        (msg) => !msg.is_read && msg.sender_id !== profile.id
      );

      if (unreadMessages.length === 0) return;

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in(
          'id',
          unreadMessages.map((msg) => msg.id)
        );

      if (error) {
        console.error('Failed to update is_read:', error);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            unreadMessages.find((um) => um.id === msg.id)
              ? { ...msg, is_read: true }
              : msg
          )
        );
      }
    };

    markMessagesAsRead();
  }, [messages, profile?.id, chatId]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setInput(e.target.value);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !profile || !chatId) return;

    setInput('');

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
      console.error('Failed to send message:', messageError);
      return;
    }
  };

  return {
    profile,
    loading,
    messages,
    input,
    textareaRef,
    handleInput,
    handleSend,
  };
};