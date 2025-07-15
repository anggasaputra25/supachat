'use client';

import { useState, useRef, useEffect } from 'react';
import { IoEllipsisVertical } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';
import { TProfile } from '../types/profile';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabaseClient';

const ComponentCardContact = ({ profile }: { profile: TProfile | null }) => {
  const [myProfile, setMyProfile] = useState<TProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const storedProfile = sessionStorage.getItem('profile');
    try {
      setMyProfile(storedProfile ? JSON.parse(storedProfile) : null);
    } catch (error) {
      console.error('Failed to parse profile from sessionStorage:', error);
      setMyProfile(null);
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // HANDLE DELETE
  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Delete Contact?',
      text: `Are you sure you want to delete @${profile?.username} from your contacts?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#555',
      background: '#171717',
      color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .match({
        user_id: myProfile?.id,
        contact_id: profile?.id
      });

    if (deleteError) {
      return Swal.fire({
        icon: 'error',
        title: 'Failed to delete',
        text: 'An error occurred while deleting the contact.',
        background: '#171717',
        color: '#fff'
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: `@${profile?.username} has been removed from your contacts.`,
      background: '#171717',
      color: '#fff'
    }).then(() => {
      location.reload(); // or trigger state update instead of full reload
    });
  };

  return (
    <div className="p-3 w-1/3">
      <div className="bg-neutral-900 p-3 rounded-sm flex gap-4 relative">
        <Link 
          href={`/chat/${profile?.username}`}
          className="flex gap-4 flex-grow"
        >
          <Image
            src={profile?.avatar_url || '/images/profile.png'}
            width={80}
            height={80}
            alt={'Profile ' + profile?.username}
            className="w-20 rounded-sm"
          />
          <div className="flex flex-col justify-center w-full">
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <p className="font-medium text-neutral-400">{profile?.lastMessage ? profile?.lastMessage : '@'+profile?.username}</p>
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            className="h-fit cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // prevent parent click
              setShowMenu((prev) => !prev);
            }}
          >
            <IoEllipsisVertical />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-neutral-800 border border-neutral-700 rounded-sm shadow-lg w-40 z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-neutral-700">View Profile</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-neutral-700">Clear Message (for me)</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-neutral-700" onClick={handleDelete}>Delete Contact</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComponentCardContact;