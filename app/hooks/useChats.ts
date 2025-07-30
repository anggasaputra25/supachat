import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { TProfile } from '@/app/types/profile';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useChats = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [contacts, setContacts] = useState<TProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs untuk menghindari cleanup issues
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  // Memoized fetchContacts dengan useCallback
  const fetchContacts = useCallback(async (userId: string) => {
    if (!userId || !isMountedRef.current) return;
    
    try {
      console.log("Fetching contacts for user:", userId);
      
      const { data: chatList, error } = await supabase
        .from('chats')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          messages!inner (
            id,
            chat_id,
            sender_id,
            content,
            created_at,
            is_read,
            deleted_at
          ),
          user1: user1_id (
            id,
            username,
            name,
            avatar_url
          ),
          user2: user2_id (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch chat list:', error);
        setError('Failed to fetch contacts');
        return;
      }

      if (!chatList || !isMountedRef.current) return;

      const mappedContacts: TProfile[] = chatList
        .map(chat => {
          const isUser1 = chat.user1_id === userId;
          
          // Handle array/object responses dari Supabase
          const user1 = Array.isArray(chat.user1) ? chat.user1[0] : chat.user1;
          const user2 = Array.isArray(chat.user2) ? chat.user2[0] : chat.user2;
          const contact = isUser1 ? user2 : user1;
          
          if (!contact) return null;

          // Filter dan sort messages dengan lebih efisien
          const validMessages = (chat.messages || [])
            .filter(msg => !msg.deleted_at)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          const lastMessage = validMessages[0];
          const unreadCount = validMessages.filter(msg => !msg.is_read && msg.sender_id !== userId).length;

          return {
            id: contact.id,
            name: contact.name,
            username: contact.username,
            avatar_url: contact.avatar_url,
            lastMessage: lastMessage?.content || null,
            unreadCount,
            lastMessageTime: lastMessage?.created_at || chat.created_at,
          } as TProfile & { lastMessageTime: string };
        })
        .filter((contact): contact is TProfile & { lastMessageTime: string } => contact !== null)
        // Sort berdasarkan pesan terakhir
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      if (isMountedRef.current) {
        setContacts(mappedContacts);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      if (isMountedRef.current) {
        setError('Failed to fetch contacts');
      }
    }
  }, []);

  // Memoized setup realtime subscription
  const setupRealtimeSubscription = useCallback(async (userId: string) => {
    if (!userId || channelRef.current) return;

    try {
      const channel = supabase
        .channel(`chat-updates-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            console.log('New message received:', payload.new);
            await fetchContacts(userId);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            const oldData = payload.old;
            const newData = payload.new;

            // Only refetch if relevant fields changed
            if (
              oldData.is_read !== newData.is_read ||
              oldData.deleted_at !== newData.deleted_at
            ) {
              console.log('Message updated:', newData);
              await fetchContacts(userId);
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      channelRef.current = channel;
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
  }, [fetchContacts]);

  // Cleanup realtime subscription
  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Main setup effect
  useEffect(() => {
    let mounted = true;
    isMountedRef.current = true;

    const setup = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/sign-in');
          return;
        }

        if (!mounted) return;

        const userId = session.user.id;
        let userProfile: TProfile | null = null;

        // Try to get profile from sessionStorage first
        const storedProfile = sessionStorage.getItem('profile');
        if (storedProfile) {
          try {
            userProfile = JSON.parse(storedProfile);
            if (mounted) {
              setProfile(userProfile);
            }
          } catch (err) {
            console.error('Error parsing stored profile:', err);
            sessionStorage.removeItem('profile');
          }
        }

        // Fetch from database if not in sessionStorage
        if (!userProfile) {
          const { data: fetchedProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (fetchedProfile && mounted) {
            userProfile = fetchedProfile;
            setProfile(userProfile);
            sessionStorage.setItem('profile', JSON.stringify(userProfile));
          } else {
            console.error('Failed to fetch profile:', profileError);
            if (mounted) {
              setError('Failed to load profile');
            }
            return;
          }
        }

        if (userProfile && mounted) {
          await fetchContacts(userProfile.id);
          await setupRealtimeSubscription(userProfile.id);
        }

      } catch (err) {
        console.error('Setup error:', err);
        if (mounted) {
          setError('Failed to initialize');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setup();

    return () => {
      mounted = false;
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, [router, fetchContacts, setupRealtimeSubscription, cleanupSubscription]);

  // Page visibility effect - refetch when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile?.id && isMountedRef.current) {
        console.log('Page visible again, refetching contacts...');
        fetchContacts(profile.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [profile?.id, fetchContacts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupSubscription();
    };
  }, [cleanupSubscription]);

  return { 
    profile, 
    contacts, 
    loading, 
    error,
    refetchContacts: profile?.id ? () => fetchContacts(profile.id) : null 
  };
};