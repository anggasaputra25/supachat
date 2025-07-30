'use client';

import { useState, useRef, useEffect } from 'react';
import { IoEllipsisVertical } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';
import { TProfile } from '../types/profile';
import Swal from 'sweetalert2';
import { supabase } from '@/lib/supabaseClient';
import { BiCopy } from 'react-icons/bi';

const ComponentCardContact = ({ profile, isContact }: { profile: TProfile | null, isContact: boolean }) => {
  const [myProfile, setMyProfile] = useState<TProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  // HANDLE COPY
  const handleCopy = async () => {
    if (profile?.username) {
      await navigator.clipboard.writeText(`${profile.username}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Success to copy username',
        showConfirmButton: false,
        timer: 3000,
        background: '#171717',
        color: '#fff',
      });
    }
  };

  return (
    <div className="py-2 md:p-3 w-full md:w-1/2 lg:w-1/3">
      <div className="bg-neutral-900 p-3 rounded-sm flex gap-4">
        <Link
          href={`/chat/${profile?.username}`}
          className="flex gap-4 flex-grow"
        >
          <div className="relative">
            <Image
              src={profile?.avatar_url || '/images/profile.png'}
              width={80}
              height={80}
              alt={'Profile ' + profile?.username}
              className="w-20 h-20 min-w-20 object-cover rounded-sm"
            />
            {/* {!isRead && 
              <div className="absolute bg-red-600 -top-2 -right-2 w-5 h-5 rounded-full flex justify-center items-center"></div>
            } */}
            <p className={`absolute bg-red-600 -top-2 -right-2 px-2.5 rounded-full ${isContact || profile?.unreadCount == 0 ? 'hidden' : ''}`}>{profile?.unreadCount}</p>
          </div>
          <div className="flex flex-col justify-center w-full">
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <p className="font-medium text-neutral-400" title={`${isContact ? '@' + profile?.username : profile?.lastMessage || 'Say hello ✌'}`}>
              {isContact
                ? '@' + profile?.username
                : profile?.lastMessage
                  ? (profile.lastMessage.length > 40
                    ? profile.lastMessage.slice(0, 40) + '...'
                    : profile.lastMessage)
                  : 'Say hello ✌'}
            </p>
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
              <button onClick={() => setShowProfile(true)} className="block w-full text-left px-4 py-2 hover:bg-neutral-700">View Profile</button>
              {isContact &&
                <button className="block w-full text-left px-4 py-2 hover:bg-neutral-700" onClick={handleDelete}>Delete Contact</button>
              }
            </div>
          )}
        </div>
      </div>
      {/* <div className={`fixed top-0 left-0 w-full h-screen bg-[rgba(0,0,0,0.3)] z-10 ${showProfile ? '' : 'hidden'}`} onClick={() => setShowProfile(false)}> */}
      <div
        className={`
          fixed top-0 left-0 w-full h-screen bg-[rgba(0,0,0,0.3)] z-10 flex justify-center items-center
          transition-opacity duration-300 ease-in-out
          ${showProfile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div
          className="w-full h-screen absolute top-0 left-0 -z-10"
          onClick={() => setShowProfile(false)}
        ></div>

        <div
          className={`
      bg-neutral-900 w-fit p-8 flex justify-center items-center flex-col rounded-lg
      transition-transform duration-300 ease-in-out
      ${showProfile ? 'scale-100' : 'scale-0'}
    `}
        >
          <Image
            src={profile?.avatar_url || '/images/profile.png'}
            alt='Profile Recipient'
            width={100}
            height={100}
            className='w-50 h-50 object-cover rounded-lg mb-3'
          />
          <p className='font-bold text-3xl mb-2'>{profile?.name}</p>
          <div className="flex items-center gap-0.5">
            <p>@{profile?.username}</p>
            <BiCopy className='cursor-pointer' onClick={handleCopy} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentCardContact;