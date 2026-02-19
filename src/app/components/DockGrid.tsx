import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Send,
  Wallet,
  CheckSquare,
  GitCompare,
  Clock,
  Activity,
  ShieldAlert,
  Settings2,
  BarChart3,
  Layers,
  CreditCard,
  DollarSign,
  ShieldCheck
} from "lucide-react";

interface DockGridProps {
  active: string;
  onSelect: (id: string) => void;
}

export default function DockGrid({ active, onSelect }: DockGridProps) {
  // 🔹 ROW 1 — CORE MONEY MOVEMENT (IMMUTABLE)
  const navItemsRow1 = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "collect", label: "Collect", icon: Wallet },
    { id: "transaction", label: "Transfer", icon: ArrowRightLeft },
    { id: "beneficiary", label: "Pay", icon: Send },
    { id: "approvals", label: "Approve", icon: CheckSquare },
  ];

  // 🔹 ROW 2 — CONTROL, COMPLIANCE & VISIBILITY (IMMUTABLE)
  const navItemsRow2 = [
    { id: "reconciliation", label: "Reconcile", icon: GitCompare },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "activity-log", label: "Activity", icon: Activity },
    { id: "limits", label: "Limits", icon: ShieldAlert },
  ];

  // 🔹 ROW 3 — INSIGHTS & CONTROLS (WITH CAPACITY)
  const navItemsRow3 = [
    { id: "insights", label: "Insights", icon: Layers },
    { id: "risk-dashboard", label: "Risk", icon: ShieldAlert },
    { id: "collections", label: "VAM", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings2 },
    { id: "admin-insight", label: "Admin", icon: ShieldCheck },
  ];

  const renderNavButton = (item: any) => {
    if (!item) return <div key={Math.random()} className="w-[60px]" />; // Empty slot

    const isActive = active === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`
          relative 
          group
          flex flex-col items-center justify-center 
          w-[60px] h-full
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] 
          active:scale-75
        `}
      >
        {/* Icon Container with Inner Rim Lighting */}
        <div 
          className={`
            p-2.5 rounded-2xl 
            transition-all duration-500
            ${isActive 
              ? "bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border border-white/5" 
              : "bg-transparent border border-transparent group-hover:bg-white/5"}
          `}
        >
          <Icon 
            size={24} 
            strokeWidth={isActive ? 2.5 : 1.5}
            className={`
              transition-colors duration-300
              ${isActive 
                ? "text-[#EDBA12] drop-shadow-[0_0_8px_rgba(237,186,18,0.5)]" 
                : "text-white/40 group-hover:text-white/80"}
            `} 
          />
        </div>

        {/* Label - Only visible/highlighted when active or hovered */}
        <span 
          className={`
            mt-1 text-[9px] font-bold uppercase tracking-widest
            transition-all duration-300
            ${isActive ? "text-white opacity-100" : "text-white/30 opacity-0 group-hover:opacity-100"}
          `}
        >
          {item.label}
        </span>

        {/* Active Indicator Dot */}
        {isActive && (
          <div className="absolute -bottom-1 w-1 h-1 bg-[#EDBA12] rounded-full shadow-[0_0_5px_#EDBA12]" />
        )}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-1 py-1">
      {/* First Row */}
      <div className="w-full flex-1 flex justify-between items-center px-2">
        {navItemsRow1.map(renderNavButton)}
      </div>

      {/* Second Row */}
      <div className="w-full flex-1 flex justify-between items-center px-2">
        {navItemsRow2.map(renderNavButton)}
      </div>

      {/* Third Row */}
      <div className="w-full flex-1 flex justify-between items-center px-2">
        {navItemsRow3.map(renderNavButton)}
      </div>
    </div>
  );
}