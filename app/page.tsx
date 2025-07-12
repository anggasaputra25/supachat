'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        alert("Please fill in all fields.");
        return;
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        alert("Username or password is wrong");
        return;
      }

      const user = data.user;

      // Optional: fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("Logged in, but failed to fetch profile:", profileError.message);
      } else {
        console.log("User profile:", profile);
        sessionStorage.setItem("profile", JSON.stringify(profile));
      }


      alert("Logged in successfully!");
      router.push("/home");
    } catch (err) {
      console.error("Unexpected login error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="font-bold text-3xl mb-5">Welcome Back!</h1>
      <p className="font-medium text-neutral-400 mb-10">First time here? <Link href={'sign-up'} className="text-white">Sign Up for free!</Link></p>
      <form className="w-full max-w-sm mx-auto space-y-5" onSubmit={handleForm}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-xl font-bold transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-violet-800 hover:bg-violet-900 text-white"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="flex items-center w-full max-w-sm gap-3 my-5">
        <div className="bg-neutral-400 h-0.5 w-full"></div>
        <p className="text-neutral-400">or</p>
        <div className="bg-neutral-400 h-0.5 w-full"></div>
      </div>
      <button
        className="w-full bg-neutral-200 py-2 rounded-xl hover:bg-neutral-400 transition font-bold text-black max-w-sm flex justify-center items-center gap-2"
      >
        <Image src='/images/google_image.png' width={30} height={30} alt="google logo" />
        Sign In with Google
      </button>
    </div>
  );
}
