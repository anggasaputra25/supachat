const CardContactSkeleton = () => {
  return (
    <div className="py-2 md:p-3 w-full md:w-1/2 lg:w-1/3 animate-pulse">
      <div className="bg-neutral-900 p-3 rounded-sm flex gap-4 relative">
        <div className="w-20 h-20 min-w-20 bg-neutral-700 rounded-sm" />

        <div className="flex flex-col justify-center w-full gap-2">
          <div className="h-5 bg-neutral-700 rounded w-3/4" />
          <div className="h-4 bg-neutral-700 rounded w-1/2" />
        </div>

        <div className="h-6 w-6 bg-neutral-700 rounded absolute right-3 top-3" />
      </div>
    </div>
  );
};

export default CardContactSkeleton;
