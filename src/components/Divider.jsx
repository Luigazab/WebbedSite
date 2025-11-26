export const Divider = () => {
  return (
    <div className="relative w-full bg-transparent">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-4 border-border border-slate-900 rounded-full" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-white text-slate-900 rounded-full px-6">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 4L24 16L36 20L24 24L20 36L16 24L4 20L16 16L20 4Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
