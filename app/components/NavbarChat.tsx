import Image from "next/image";
import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { TProfile } from "../types/profile";

const NavbarChat = ({ profile }: { profile: TProfile | null }) => {
    return (
        <nav className="border-b border-neutral-800 w-full py-5 px-8 flex justify-between items-center">
            <Link href='/home' className="border border-neutral-800 bg-neutral-900 rounded-md p-3"><IoIosArrowBack className="w-6 h-6" /></Link>
            <div className="flex gap-2 items-center">
                <Image src={profile?.avatar_url || '/images/profile.png'} alt="Profile" width={50} height={50} className="rounded-sm" />
                <div>
                    <h1 className="font-bold">{profile?.name}</h1>
                    <h2 className="text-sm font-medium">@{profile?.username}</h2>
                </div>
            </div>
        </nav>
    )
}

export default NavbarChat;