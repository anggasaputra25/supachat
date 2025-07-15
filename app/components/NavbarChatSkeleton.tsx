const NavbarChatSkeleton = () => {
  return (
    <nav className="border-b border-neutral-800 w-full py-5 px-8 flex justify-between items-center animate-pulse">
      <div className="border border-neutral-800 bg-neutral-900 rounded-md p-3 w-10 h-10" />

      <div className="flex gap-2 items-center">
        <div className="w-[50px] h-[50px] rounded-sm bg-neutral-700" />

        <div className="flex flex-col gap-1">
          <div className="w-32 h-4 bg-neutral-700 rounded" />
          <div className="w-24 h-3 bg-neutral-700 rounded" />
        </div>
      </div>
    </nav>
  );
};

export default NavbarChatSkeleton;