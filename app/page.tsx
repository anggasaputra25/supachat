import Link from "next/link";

const Home = () => {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-4">
      <h1 className="text-5xl font-bold">Supachat</h1>
      <p>Real-Time Chat App with Supabase</p>
      <Link href='/home' className="border py-2 px-4 rounded-sm font-medium hover:bg-white hover:text-black transition-colors duration-100 ease-in">Get Started for Free!</Link>
    </div>
  )
}

export default Home;