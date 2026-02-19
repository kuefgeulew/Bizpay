export default function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-xl
        border border-white/20
        shadow-[0_8px_40px_rgba(0,0,0,0.18)]
        rounded-[28px]
        overflow-hidden
        min-w-0
        ${className}
      `}
    >
      {children}
    </div>
  );
}