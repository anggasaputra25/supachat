import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const LogoutButton = () => {
  const router = useRouter();
  const handleLogout = async () => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#555",
      confirmButtonText: "Yes, log out",
      background: "#171717",
      color: "#fff",
    });

    if (!confirmed.isConfirmed) return;
    const { error } = await supabase.auth.signOut();

    if (error) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to log out.",
        showConfirmButton: false,
        timer: 3000,
        background: "#171717",
        color: "#fff",
      });
      console.error("Logout error:", error);
    } else {
      // Optional: clear session cache
      sessionStorage.removeItem("profile");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Logged out successfully.",
        showConfirmButton: false,
        timer: 2000,
        background: "#171717",
        color: "#fff",
      });

      // Redirect to login page
      router.push("/sign-in");
    }
  };
  return (
    <button
      onClick={handleLogout}
      className={`w-full text-white py-2 rounded-xl bg-red-600 hover:bg-red-700 transition font-bold cursor-pointer`}
    >
      Logout
    </button>
  )
}

export default LogoutButton;