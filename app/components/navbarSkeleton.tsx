export const ComponentNavbarSkeleton = () => {
  return (
    <nav className="flex py-5 px-5 items-center justify-between animate-pulse">
      <div className="h-8 w-40 bg-neutral-800 rounded-md" />
      <div className="flex gap-4">
        <div className="h-10 w-10 bg-neutral-800 rounded-md" />
        <div className="h-10 w-10 bg-neutral-800 rounded-md" />
      </div>
    </nav>
  );
};