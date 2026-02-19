import { Info } from "lucide-react";

interface DisclaimerProps {
  context?: "footer" | "banner" | "inline";
  className?: string;
  message?: string;
}

export default function SystemDisclaimer({ context = "footer", className = "", message }: DisclaimerProps) {
  if (context === "banner") {
    return (
      <div className={`px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl ${className}`}>
        <div className="flex items-start gap-3">
          <Info size={16} className="text-cyan-400/60 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/50 leading-relaxed">
            <span className="font-bold text-white/60">System Note:</span>{" "}
            {message || "This interface displays enterprise SME banking workflows. State resets on page refresh."}
          </p>
        </div>
      </div>
    );
  }

  if (context === "inline") {
    return (
      <p className={`text-[10px] text-white/40 flex items-center gap-1.5 ${className}`}>
        <Info size={12} className="shrink-0 text-white/30" />
        {message || "Data shown for reference purposes."}
      </p>
    );
  }

  // Footer context (default)
  return (
    <div className={`text-center py-2 ${className}`}>
      <p className="text-[10px] text-white/40">
        {message || "Data shown for reference purposes."}
      </p>
    </div>
  );
}
