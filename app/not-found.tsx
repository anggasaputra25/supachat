import Link from "next/link";
import { IoLogoSnapchat } from "react-icons/io";

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen gap-2 px-3">
            <IoLogoSnapchat className="text-violet-600 text-9xl animate-spin" style={{ animationDuration: '10s' }} />
            <h1 className="font-bold text-3xl">Sorry, this page is not available</h1>
            <p>The link you followed may be broken, or the page may have been removed. Return to <Link href={'/home'} className="text-violet-600">Supachat</Link>.</p>
        </div>
    )
}

export default NotFound;