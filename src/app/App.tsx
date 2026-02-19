import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { getCurrentUser } from "./mock";

// NEW — search brain
import { searchNavigate } from "./utils/searchNavigator";

// Components
import DashboardScreen from "./screens/DashboardScreen";
import TransactionScreen from "./screens/sme/TransactionScreen";
import ServiceScreen from "./screens/sme/ServiceScreen";
import ApprovalHub from "./screens/sme/approvals/ApprovalHub";
import ReconciliationHub from "./screens/sme/reconciliation/ReconciliationHub";
import TransactionLimitsHub from "./screens/sme/limits/TransactionLimitsHub";
import BeneficiaryMenu from "./screens/sme/beneficiary/BeneficiaryMenu";
import TopBar from "./components/TopBar";
import DockGrid from "./components/DockGrid";
import ProfilePicture from "./components/ProfilePicture";
import FloatingRoleSwitcher from "./components/FloatingRoleSwitcher";
import CommandSearch from "./components/CommandSearch";

// AUDIT FIX: Wire orphaned screens
import ReportsMenu from "./screens/sme/reports/ReportsMenu";
import TimelineScreen from "./screens/sme/insights/TimelineScreen";
import NotificationCenter from "./screens/sme/admin/NotificationCenter";
import EnhancedActivityLogScreen from "./screens/sme/admin/EnhancedActivityLogScreen";
import VamScreen from "./screens/sme/insights/VamScreen";
import AdminHub from "./screens/sme/admin/AdminHub";
import RiskDashboardScreen from "./screens/sme/insights/RiskDashboardScreen";
import CollectionsHub from "./screens/sme/insights/CollectionsHub";
import InsightsHub from "./screens/sme/insights/InsightsHub";
import SettingsHub from "./screens/sme/settings/SettingsHub";

// NEW CASH OS SCREENS
import CollectHub from "./screens/sme/collections/CollectHub";
import { type CollectPrefill } from "./screens/sme/collections/CollectHub";
import ReceivablesIntelligenceScreen from "./screens/sme/collections/ReceivablesIntelligenceScreen";
import OutflowControlsScreen from "./screens/sme/payments/OutflowControlsScreen";
import PayablesIntelligenceScreen from "./screens/sme/payments/PayablesIntelligenceScreen";
import CreditBackstopScreen from "./screens/sme/payments/CreditBackstopScreen";
import SweepParkScreen from "./screens/sme/reconcile/SweepParkScreen";
import CashLocksScreen from "./screens/sme/reconcile/CashLocksScreen";
import SmartAlertsScreen from "./screens/sme/insights/SmartAlertsScreen";
import CashIntelligenceScreen from "./screens/sme/insights/CashIntelligenceScreen";
import CashBucketsScreen from "./screens/sme/accounts/CashBucketsScreen";
import TaxVaultScreen from "./screens/sme/accounts/TaxVaultScreen";
import AccountControlTowerScreen from "./screens/sme/settings/AccountControlTowerScreen";
import BenefitsIncentivesScreen from "./screens/sme/settings/BenefitsIncentivesScreen";

// Premium Stiff Spring Physics
const TACTILE_SPRING = { type: "spring", stiffness: 600, damping: 35 };

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [homeTab, setHomeTab] = useState("Accounts");
  const [roleRefresh, setRoleRefresh] = useState(0);
  const [collectPrefill, setCollectPrefill] = useState<CollectPrefill | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // USE REFS instead of state for setters
  const transactionSetterRef = useRef<((view: string) => void) | null>(null);
  const serviceSetterRef = useRef<((view: string) => void) | null>(null);
  const beneficiarySetterRef = useRef<((view: string) => void) | null>(null);

  // Close search when navigation happens
  const handleSearchNavigate = (id: string) => {
    setSearchOpen(false);
    searchNavigate(
      id,
      setActive,
      transactionSetterRef,
      serviceSetterRef,
      beneficiarySetterRef
    );
  };

  function render() {
    switch (active) {

      // WIRED
      case "transaction":
        return (
          <TransactionScreen
            onBack={() => setActive("dashboard")}
            setTransactionView={(setter) => {
              transactionSetterRef.current = setter;
            }}
          />
        );

      // WIRED
      case "service":
      case "service-request":
        return (
          <ServiceScreen
            onBack={() => setActive("dashboard")}
            setServiceView={(setter) => {
              serviceSetterRef.current = setter;
            }}
          />
        );

      // NEW: Approvals
      case "approvals": {
        const currentUser = getCurrentUser();
        return (
          <ApprovalHub
            onBack={() => setActive("dashboard")}
            currentUser={{
              userId: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
            }}
          />
        );
      }

      // NEW: Reconciliation
      case "reconciliation": {
        const currentUser = getCurrentUser();
        return (
          <ReconciliationHub
            onBack={() => setActive("dashboard")}
            currentUser={{
              userId: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
            }}
          />
        );
      }

      // NEW: Transaction Limits
      case "limits": {
        return (
          <TransactionLimitsHub
            onBack={() => setActive("dashboard")}
          />
        );
      }

      // NEW: Beneficiary Governance
      case "beneficiary": {
        return (
          <BeneficiaryMenu
            onBack={() => setActive("dashboard")}
            setBeneficiaryView={(setter) => {
              beneficiarySetterRef.current = setter;
            }}
          />
        );
      }

      // AUDIT FIX: Wire orphaned screens
      case "reports":
        return (
          <ReportsMenu
            onBack={() => setActive("dashboard")}
          />
        );
      case "timeline":
        return (
          <TimelineScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "notifications":
        return (
          <NotificationCenter
            onBack={() => setActive("dashboard")}
          />
        );
      case "activity-log":
        return (
          <EnhancedActivityLogScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "vam":
        return (
          <VamScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "admin-insight":
        return (
          <AdminHub
            onBack={() => setActive("dashboard")}
          />
        );
      case "risk-dashboard":
        return (
          <RiskDashboardScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "collections":
        return (
          <CollectionsHub
            onBack={() => setActive("dashboard")}
          />
        );
      case "insights":
        return (
          <InsightsHub
            onBack={() => setActive("dashboard")}
            onNavigate={(screen) => setActive(screen)}
          />
        );
      case "settings":
        return (
          <SettingsHub
            onBack={() => setActive("dashboard")}
            onNavigate={(screen) => setActive(screen)}
          />
        );

      // CASH OS SCREENS
      case "collect":
        return (
          <CollectHub
            onBack={() => { setActive("dashboard"); setCollectPrefill(null); }}
            initialPrefill={collectPrefill}
            onNavigateToReceivables={() => { setCollectPrefill(null); setActive("receivables-intelligence"); }}
          />
        );
      case "receivables-intelligence":
        return (
          <ReceivablesIntelligenceScreen
            onBack={() => setActive("dashboard")}
            onNavigate={(screen) => setActive(screen)}
            onCollectViaQR={(invoiceRef, amount, customerName) => {
              setCollectPrefill({ view: "bangla-qr", invoiceRef, amount, customerName });
              setActive("collect");
            }}
            onCollectViaLink={(invoiceRef, amount, customerName) => {
              setCollectPrefill({ view: "payment-links", invoiceRef, amount, customerName });
              setActive("collect");
            }}
          />
        );
      case "outflow-controls":
        return (
          <OutflowControlsScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "payables-intelligence":
        return (
          <PayablesIntelligenceScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "credit-backstop":
        return (
          <CreditBackstopScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "sweep-park":
        return (
          <SweepParkScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "cash-locks":
        return (
          <CashLocksScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "smart-alerts":
        return (
          <SmartAlertsScreen
            onBack={() => setActive("insights")}
          />
        );
      case "cash-intelligence":
        return (
          <CashIntelligenceScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "cash-buckets":
        return (
          <CashBucketsScreen
            onBack={() => setActive("settings")}
          />
        );
      case "tax-vault":
        return (
          <TaxVaultScreen
            onBack={() => setActive("dashboard")}
          />
        );
      case "account-control-tower":
        return (
          <AccountControlTowerScreen
            onBack={() => setActive("settings")}
          />
        );
      case "benefits-incentives":
        return (
          <BenefitsIncentivesScreen
            onBack={() => setActive("dashboard")}
          />
        );

      default:
        return (
          <div className="flex flex-col">
            
            <div className="px-6 pt-6 mb-6 flex items-center gap-4">
              <div className="relative">
                <ProfilePicture />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] pointer-events-none" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">Welcome</p>
                <h2 className="text-white text-xl font-bold tracking-tight">Hazi Traders</h2>
              </div>
            </div>

            <div className="px-6 mb-8">
              <div className="relative flex items-center justify-between p-1 bg-black/20 backdrop-blur-3xl rounded-[24px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                {["Accounts", "FDR/DPS", "Credit Card", "Loans"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHomeTab(tab)}
                    className="relative flex-1 py-3 z-10 outline-none"
                  >
                    {homeTab === tab && (
                      <motion.div
                        layoutId="homeTabIndicator"
                        transition={TACTILE_SPRING}
                        className="absolute inset-0 bg-white rounded-[20px] shadow-xl"
                      />
                    )}
                    <span className={`relative z-20 text-[10px] font-black uppercase tracking-tight transition-colors duration-300 ${homeTab === tab ? "text-[#002D52]" : "text-white/40"}`}>
                      {tab}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <DashboardScreen activeTab={homeTab} onNavigate={setActive} />
          </div>
        );
    }
  }

  const isDashboard = active === "dashboard";
  const showDock = isDashboard && homeTab !== "Credit Card";

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-[#F7F7FC] font-sans selection:bg-[#EDBA12]/30">
      
      <div className="relative w-[390px] h-[844px] bg-[#002D52] rounded-[55px] border-[12px] border-[#121212] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#002D52] via-[#00427A] to-[#002D52]" />
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#EDBA12]/15 blur-[90px] rounded-full animate-pulse" />
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* PASS SEARCH NAVIGATOR TO TOPBAR */}
        <div className="absolute top-0 w-full z-50 backdrop-blur-xl bg-[#002D52]/40 border-b border-white/10">
          <TopBar
            onSearchOpen={() => setSearchOpen(true)}
            onNotificationClick={() => setActive("notifications")}
            userId="usr_002"
          />
        </div>

        <div
          className={`absolute inset-0 pt-[70px] ${showDock ? "pb-[160px]" : "pb-0"} overflow-y-auto bg-transparent`}
          style={{ 
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="relative z-10">
              {render()}
          </div>
        </div>

        {showDock && (
          <div className="absolute bottom-8 left-5 right-5 z-50">
            <div className="relative rounded-[30px] bg-[#002D52]/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-1">
              <DockGrid onSelect={setActive} active={active} />
            </div>
          </div>
        )}

        {/* ── SEARCH OVERLAY — phone-contained, absolute to this container ── */}
        <CommandSearch
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onNavigate={handleSearchNavigate}
        />
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
      {/* Floating Role Switcher */}
      <FloatingRoleSwitcher onRoleChange={() => setRoleRefresh(prev => prev + 1)} />
    </div>
  );
}