export function Loader() {
  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-12 text-center flex items-center justify-center min-h-[300px] w-full">
      <div className="relative w-12 h-12">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-surface-interactive"></div>
        
        {/* Animated gradient spinner */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-accent border-r-accent animate-[spin_1s_cubic-bezier(0.55,0.055,0.675,0.19)_infinite] shadow-[0_0_15px_rgba(var(--color-accent),0.4)]"></div>
      </div>
    </div>
  )
}
