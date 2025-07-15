'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { TProfile } from '@/app/types/profile';
import ComponentCardContact from '@/app/components/CardContact';
import ComponentNavbar from '@/app/components/Navbar';
import { ComponentNavbarSkeleton } from '@/app/components/NavbarSkeleton';
import CardAddContact from '@/app/components/CardAddContact';
import CardContactSkeleton from '@/app/components/CardContactSkeleton';

const Contact = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TProfile | null>(null);
  const [contacts, setContacts] = useState<TProfile[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/sign-in');
        return;
      }

      const userId = session.user.id;
      setProfile({ id: userId } as TProfile); // minimal setup

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
          is_read
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
        setLoading(false);
        return;
      }

      const mappedContacts: TProfile[] = chatList
        .map(chat => {
          const isUser1 = chat.user1_id === userId;
          const contact = isUser1 ? chat.user2 : chat.user1;
          const lastMessage = [...(chat.messages || [])]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )[0];

          if (!contact) return null;

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
      setLoading(false);
    };

    checkUser();
  }, [router]);

  return (
    <div>
      {loading ? (
        <ComponentNavbarSkeleton />
      ) : (
        <ComponentNavbar profile={profile} inPage={0} />
      )}

      <div className="flex p-5 flex-wrap">
        {loading ? (
          <>
            <CardContactSkeleton />
            <CardContactSkeleton />
            <CardContactSkeleton />
          </>
        ) : (
          contacts.map((contact) => (
            <ComponentCardContact key={contact.id} profile={contact} />
          ))
        )}
      </div>
    </div>
  );
};

export default Contact;