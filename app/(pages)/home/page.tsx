'use client';

import ComponentCardContact from '@/components/CardContact';
import ComponentNavbar from '@/components/Navbar';
import { ComponentNavbarSkeleton } from '@/components/NavbarSkeleton';
import CardContactSkeleton from '@/components/CardContactSkeleton';
import { useChats } from '@/hooks/useChats';
import Link from 'next/link';

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
          contacts.length == 0 ? (
            <div className="fixed h-screen w-full flex justify-center items-center top-0 -z-10 text-center left-0">
              <p>No chats yet! <Link href={'contacts'} className='font-bold'>Add some friends</Link> and start something awesome 💬✨</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <ComponentCardContact key={contact.id} profile={contact} isContact={false} />
            ))
          )
        )}
      </div>
    </div>
  );
};

export default Chats;