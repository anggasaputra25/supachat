import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { TProfile } from '@/app/types/profile';

export const useChats = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [contacts, setContacts] = useState<TProfile[]>([]);

  const fetchContacts = async (userId: string) => {
    const { data: chatList, error } = await supabase
      .from('chats')
      .select(`
        id,
        user1_id,
        user2_id,
        created_at,
        messages (
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
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error || !chatList) {
      console.error('Failed to fetch chat list:', error);
      return;
    }

    const mappedContacts: TProfile[] = chatList
      .map(chat => {
        const isUser1 = chat.user1_id === userId;

        const user1 = Array.isArray(chat.user1) ? chat.user1[0] : chat.user1;
        const user2 = Array.isArray(chat.user2) ? chat.user2[0] : chat.user2;

        const contact = isUser1 ? user2 : user1;

        if (!contact) return null;

        const validMessages = (chat.messages || []).filter(msg => !msg.deleted_at);
        const lastMessage = validMessages
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
          id: contact.id,
          name: contact.name,
          username: contact.username,
          avatar_url: contact.avatar_url,
          lastMessage: lastMessage?.content || null,
        } as TProfile;
      })
      .filter(Boolean) as TProfile[];

    setContacts(mappedContacts);
  };

  useEffect(() => {
    const setup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/sign-in');
        return;
      }

      const userId = session.user.id;

      // Load profile
      const storedProfile = sessionStorage.getItem('profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (userProfile) {
          setProfile(userProfile);
          sessionStorage.setItem('profile', JSON.stringify(userProfile));
        } else {
          console.error('Failed to fetch profile', profileError);
        }
      }

      await fetchContacts(userId);
      setLoading(false);

      // 👇 Set up realtime listener for new messages
      const messageSub = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            const newMessage = payload.new;
            console.log('New message:', newMessage);

            // Refetch contacts on new message
            await fetchContacts(userId);
          }
        ).on(
          // 👇 Listen for soft-deletes (updates where deleted_at is set)
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            const updatedMessage = payload.new;
            console.log('Message updated (possibly deleted):', updatedMessage);
            await fetchContacts(userId);
          }
        )
        .subscribe();

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(messageSub);
      };
    };

    setup();
  }, [router]);

  return { profile, contacts, loading };
};