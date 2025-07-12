'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { TProfile } from "@/app/types/profile";
import ComponentNavbar from "@/app/components/navbar";
import { ComponentNavbarSkeleton } from "@/app/components/navbarSkeleton";

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TProfile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        router.push("/");
        return;
      }

      const userId = session.user.id;

      // Fetch profile
      const storedProfile = sessionStorage.getItem("profile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (userProfile) {
          setProfile(userProfile);
          sessionStorage.setItem("profile", JSON.stringify(userProfile));
        } else {
          console.error("Failed to fetch profile", profileError);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  return (
    <div>
      {loading ? (
        <ComponentNavbarSkeleton />
      ) : (
        <ComponentNavbar profile={profile} />
      )}
    </div>
  );
};

export default Home;