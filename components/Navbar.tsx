import { TProfile } from "@/types/profile";
import { BiMessageSquareDetail } from "react-icons/bi";
import { GoPerson } from "react-icons/go";
import Link from "next/link";
import { GrContactInfo } from "react-icons/gr";

const ComponentNavbar = ({ profile, inPage }: { profile: TProfile | null; inPage: number }) => {
  return (
    <nav className="flex py-5 px-5 items-center justify-between">
      <h1 className="text-3xl font-bold">{profile?.name || "User"}</h1>
      <div className="flex">
        <Link href='/home' className={`p-3 ${inPage == 0 && 'rounded-md bg-neutral-900 border border-neutral-800'}`}><BiMessageSquareDetail width={100} /></Link>
        <Link href='/contacts' className={`p-3 ${inPage == 1 && 'rounded-md bg-neutral-900 border border-neutral-800'} relative`}>
          <GrContactInfo width={100} />
        </Link>
        <Link href='/profile' className={`p-3 ${inPage == 2 && 'rounded-md bg-neutral-900 border border-neutral-800'}`}><GoPerson width={100} /></Link>
      </div>
    </nav>
  )
}

export default ComponentNavbar;