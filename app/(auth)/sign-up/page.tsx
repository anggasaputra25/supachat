'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiSparkles } from "react-icons/hi";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SignUp = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(true);
  const [debounceUsername] = useDebounce(username, 2000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only check if username is not empty
    if (!debounceUsername) {
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
  }, [debounceUsername]);

  const generateRandomUsername = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const random = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setUsername(random);
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get all form values
      const formData = new FormData(e.currentTarget);

      // Extract values and cast them to string
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const name = formData.get("name") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      // Validate required fields
      if (!username || !email || !name || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
      }

      // Confirm password match
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // Sign up user using Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          alert("Email is already in use.");
        } else {
          alert(signUpError.message);
        }
        return;
      }

      const user = authData?.user;
      if (!user) {
        console.error("Failed to create user.");
        return;
      }

      // Insert additional user info into custom "profiles" table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,           // same UUID as in auth.users
          username,
          name,
        },
      ]);

      if (profileError) {
        console.error(profileError.message);
        return;
      }

      alert("Registration successful! Please check your Gmail inbox to verify your account.");
      router.push("/sign-in"); // redirect after success
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="font-bold text-3xl mb-5">Hello, Welcome to Supachat!</h1>
      <p className="font-medium text-neutral-400 mb-10">Have an account? <Link href={'/'} className="text-white">Sign In here!</Link></p>
      <form className="w-full max-w-sm mx-auto space-y-5" onSubmit={handleForm}>
        <div className={`flex rounded-sm bg-neutral-900 ${!usernameStatus? 'border border-red-600' : ''} ${usernameStatus && username.length > 0? 'border border-green-600' : ''}`}>
          <input
            required
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          name="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <input
          required
          name="name"
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <input
          required
          name="password"
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <input
          required
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-white bg-neutral-900 font-medium"
        />
        <button
          type="submit"
          className={`w-full text-white py-2 rounded-xl hover:bg-violet-900 transition font-bold ${loading? 'bg-gray-500 cursor-not-allowed' : 'bg-violet-800'}`}
          disabled={loading}
        >
          {loading? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignUp;