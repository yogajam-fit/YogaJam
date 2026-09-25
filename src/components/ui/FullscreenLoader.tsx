export function FullscreenLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <img src="/images/loader.svg" alt="Loading..." className="w-24 h-24 animate-pulse mb-6 drop-shadow-2xl" />
      <p className="text-foreground font-bold text-xl tracking-wide animate-pulse drop-shadow-md text-center px-6">
        {message}
      </p>
    </div>
  )
}
