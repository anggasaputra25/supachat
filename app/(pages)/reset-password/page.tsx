'use client'
import LogoutButton from "@/app/components/LogoutButton";
import ComponentNavbar from "@/app/components/Navbar";
import { ComponentNavbarSkeleton } from "@/app/components/NavbarSkeleton";
import { useChats } from "@/app/hooks/useChats";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const { profile, loading } = useChats();
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("old_password") as string;
    const newPassword = formData.get("new_password") as string;

    try {
      // Step 1: Get current user email
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (sessionError || !user?.email) {
        throw new Error("Unable to get current user.");
      }

      // Step 2: Re-authenticate with old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Incorrect current password.",
          showConfirmButton: false,
          timer: 3000,
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      // Step 3: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Password updated successfully!",
        showConfirmButton: false,
        timer: 3000,
        background: "#171717",
        color: "#fff",
      });
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to update password.",
        showConfirmButton: false,
        timer: 3000,
        background: "#171717",
        color: "#fff",
      });
      console.error("Password update error:", error);
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
        <h1 className="text-3xl font-bold mb-2">Change Password</h1>
        <form className="w-full max-w-sm mx-auto space-y-3 flex flex-col items-center" onSubmit={handleSubmit}>
          <input
            required
            name="old_password"
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
          />
          <input
            required
            name="new_password"
            type="password"
            placeholder="New Password"
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
          <Link href={'/profile'}
            className={`w-full text-center text-black py-2 rounded-xl bg-slate-50 hover:bg-slate-200 transition font-bold cursor-pointer`}
          >
            Change Profile
          </Link>
          <LogoutButton />
        </div>
      </div>
    </>
  )
}

export default ResetPassword;