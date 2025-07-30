import Image from "next/image";
import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { TProfile } from "../types/profile";

const NavbarChat = ({ recipient }: { recipient: TProfile | null }) => {
    return (
        <nav className="border-b border-neutral-800 w-full py-5 px-3 md:px-8 flex justify-between items-center">
            <Link href='/home' className="border border-neutral-800 bg-neutral-900 rounded-md p-3"><IoIosArrowBack className="w-6 h-6" /></Link>
            <div className="flex gap-2 items-center">
                <Image src={recipient?.avatar_url || '/images/profile.png'} alt="Recipient" width={50} height={50} className="rounded-sm w-12 h-12 object-cover " />
                <div>
                    <h1 className="font-bold">{recipient?.name}</h1>
                    <h2 className="text-sm font-medium">@{recipient?.username}</h2>
                </div>
            </div>
        </nav>
    )
}

export default NavbarChat;