import { TProfile } from "@/app/types/profile";
import { BiMessageSquareDetail } from "react-icons/bi";
import { GoPerson } from "react-icons/go";
import Link from "next/link";

const ComponentNavbar = ({ profile }: { profile: TProfile | null }) => {
  return (
    <nav className="flex py-5 px-5 items-center justify-between">
      <h1 className="text-3xl font-bold">{profile?.name || "User"}</h1>
      <div className="flex">
        <Link href='/' className="p-3 rounded-md bg-neutral-900 border border-neutral-800"><BiMessageSquareDetail width={100} /></Link>
        <Link href='/' className="p-3"><GoPerson width={100} /></Link>
      </div>
    </nav>
  )
}

export default ComponentNavbar;