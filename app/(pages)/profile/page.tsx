'use client'
import LogoutButton from "@/app/components/LogoutButton";
import ComponentNavbar from "@/app/components/Navbar";
import { ComponentNavbarSkeleton } from "@/app/components/NavbarSkeleton";
import { useChats } from "@/app/hooks/useChats";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiSparkles } from "react-icons/hi";
import Swal from "sweetalert2";
import { useDebounce } from "use-debounce";

const Profile = () => {
  const { profile, loading } = useChats();
  const [usernameStr, setUsernameStr] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(true);
  const [debounceUsername] = useDebounce(usernameStr, 2000);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setUsernameStr(profile?.username);
      setPreviewUrl(profile?.avatar_url || '');
    }
  }, [profile])

  useEffect(() => {
    // Only check if username is not empty
    if (!debounceUsername) {
      setUsernameStatus(true);
      return;
    }

    if (profile?.username == debounceUsername) {
      setUsernameStatus(true);
      return;
    }

    const checkUsername = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", debounceUsername)
        .single(); // only expecting one result

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        setUsernameStatus(false); // fallback: mark as taken if error occurs
        return;
      }

      // If no data returned, username is available
      setUsernameStatus(!data);
    };

    checkUsername();
  }, [debounceUsername, profile?.username]);

  const generateRandomUsername = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const random = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setUsernameStr(random);
  };

  // HANDLE IMAGE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[a-z0-9_]+$/.test(usernameStr)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Username can only contain lowercase letters, numbers, and underscores (no spaces or capital letters).',
        showConfirmButton: false,
        timer: 3000,
        background: '#171717',
        color: '#fff',
      });
      return;
    }
    if (usernameStr.length < 6) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Username must be at least 6 characters long.',
        showConfirmButton: false,
        timer: 3000,
        background: '#171717',
        color: '#fff',
      });
      return;
    }
    setLoadingSubmit(true)
    const formData = new FormData(e.currentTarget);

    try {
      // Check username
      const { data, error: errorUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", usernameStr)
        .single(); // only expecting one result

      if (errorUser && errorUser.code !== "PGRST116") {
        console.error("Error checking username:", errorUser);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to check username',
          showConfirmButton: false,
          timer: 3000,
          background: '#171717',
          color: '#fff',
        });
        setUsernameStatus(false); // fallback: mark as taken if error occurs
        return;
      }

      // If no data returned, username is available
      setUsernameStatus(!data);

      if (profile?.username == usernameStr) {
        setUsernameStatus(true);
      }

      if (!usernameStatus) {
        return;
      }

      const imageFile = formData.get('image_profile') as File;
      const username = formData.get('username') as string;
      const name = formData.get('name') as string;

      let avatar_url = profile?.avatar_url ?? null;

      if (imageFile && imageFile.size > 0 && profile?.id) {
        const filePath = `avatar/${profile.id}`;

        const { error: uploadError } = await supabase.storage
          .from('supachat')
          .upload(filePath, imageFile, {
            upsert: true, // Overwrite existing file
            contentType: imageFile.type,
          });

        if (uploadError) {
          console.error('Upload failed:', uploadError.message);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Failed to upload image',
            showConfirmButton: false,
            timer: 3000,
            background: '#171717',
            color: '#fff',
          });
          return;
        }

        avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/supachat/${filePath}?t=${Date.now()}`;
      }

      // Update profile in Supabase
      const { data: dataProfile, error } = await supabase
        .from('profiles')
        .update({
          username,
          name,
          avatar_url,
        })
        .eq('id', profile?.id)
        .select()
        .single();

      sessionStorage.setItem('profile', JSON.stringify(dataProfile));

      if (error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to update profile',
          showConfirmButton: false,
          timer: 3000,
          background: '#171717',
          color: '#fff',
        });
        return;
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Profile updated successfully!',
        showConfirmButton: false,
        timer: 3000,
        background: '#171717',
        color: '#fff',
      });
    } catch (error) {
      if (error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to update profile',
          showConfirmButton: false,
          timer: 3000,
          background: '#171717',
          color: '#fff',
        });
        return;
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      {loading ? (
        <ComponentNavbarSkeleton />
      ) : (
        <ComponentNavbar profile={profile} inPage={2} />
      )}

      <div className="flex flex-col justify-center items-center min-h-screen fixed -z-10 top-0 w-full gap-2 px-3 lg:px-0">
        <form className="w-full max-w-sm mx-auto space-y-3 flex flex-col items-center" onSubmit={handleSubmit}>
          <Image
            src={previewUrl || profile?.avatar_url || '/images/profile.png'}
            width={100}
            height={100}
            alt={`Profile ${profile?.username || ''}`}
            className="w-50 h-50 object-cover rounded-sm mx-auto"
          />
          <label>
            <p className="bg-neutral-900 p-3 rounded-sm cursor-pointer hover:bg-neutral-950 inline-block text-white">Choose an Photo</p>
            <input
              name="image_profile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className={`flex rounded-sm w-full bg-neutral-900 ${!usernameStatus ? 'border border-red-600' : ''} ${usernameStatus && usernameStr.length > 0 ? 'border border-green-600' : ''}`}>
            <input
              required
              // minLength={6}
              name="username"
              type="text"
              value={usernameStr}
              onChange={(e) => setUsernameStr(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
            />
            <button
              type="button"
              onClick={generateRandomUsername}
              className="py-2 px-4"
              title="Generate random username">
              <HiSparkles className="w-4 h-4" />
            </button>
          </div>
          {!usernameStatus && <p className="text-sm text-red-600">* Username already exists</p>}
          <input
            required
            defaultValue={profile?.name}
            name="name"
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
          />
          <button
            type="submit"
            className={`w-full text-white py-2 rounded-xl transition font-bold ${(loadingSubmit) ? 'bg-gray-500 cursor-not-allowed' : 'bg-violet-800 hover:bg-violet-900 cursor-pointer'}`}
            disabled={loadingSubmit}
          >
            {loadingSubmit
              ? 'Saving...'
              : 'Save'
            }
          </button>
        </form>
        <div className="flex items-center w-full max-w-sm gap-3">
          <div className="bg-neutral-400 h-0.5 w-full"></div>
          <p className="text-neutral-400">or</p>
          <div className="bg-neutral-400 h-0.5 w-full"></div>
        </div>
        <div className="flex w-full max-w-sm gap-2">
          <Link href={'reset-password'}
            className={`w-full text-center text-black py-2 rounded-xl bg-slate-50 hover:bg-slate-200 transition font-bold cursor-pointer`}
          >
            Change Password
          </Link>
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

export default Profile;