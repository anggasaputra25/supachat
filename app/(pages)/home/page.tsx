'use client';

import ComponentCardContact from '@/app/components/CardContact';
import ComponentNavbar from '@/app/components/Navbar';
import { ComponentNavbarSkeleton } from '@/app/components/NavbarSkeleton';
import CardContactSkeleton from '@/app/components/CardContactSkeleton';
import { useChats } from '@/app/hooks/useChats';

const Chats = () => {
  const { profile, contacts, loading } = useChats();

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
            <ComponentCardContact key={contact.id} profile={contact} isContact={false} />
          ))
        )}
      </div>
    </div>
  );
};

export default Chats;