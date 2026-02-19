// src/utils/searchNavigator.ts

export function searchNavigate(
  id: string, 
  setActive: (view: string) => void, 
  transactionSetterRef: React.MutableRefObject<((view: string) => void) | null>, 
  serviceSetterRef: React.MutableRefObject<((view: string) => void) | null>, 
  beneficiarySetterRef: React.MutableRefObject<((view: string) => void) | null>
) {
  console.log('🔍 Search Navigate:', id);
  
  switch (id) {

    // ===== DASHBOARD LEVEL =====
    case "reports":
      setActive("reports");
      break;

    // ===== INVOICES & OUTSTANDING =====
    case "invoice":
    case "invoices":
    case "gst":
    case "outstanding":
      setActive("reports");
      // Note: Reports menu will need internal routing to invoices view
      break;

    // ===== AUTO-RECONCILIATION RULES =====
    case "recon":
    case "reconrules":
    case "autoreconcile":
    case "matchingrules":
    case "reconciliationlogic":
      setActive("reconciliation");
      // Note: Reconciliation hub will show auto-rules option
      break;

    case "service":
    case "servicerequest":
      setActive("service");
      break;

    case "beneficiary":
      setActive("beneficiary");
      break;

    case "timeline":
      setActive("timeline");
      break;

    case "activity":
      setActive("activity-log");
      break;

    case "collections":
      setActive("collections");
      break;

    case "vam":
      setActive("vam");
      break;

    case "reconciliation":
      setActive("reconciliation");
      break;

    // ===== ADMIN & INSIGHTS =====
    case "admin-insight":
    case "admininsight":
    case "admin":
    case "governance":
    case "usermanagement":
    case "permissionmatrix":
    case "approvalrules":
    case "devicesecurity":
    case "auditcompliance":
    case "businessprofiles":
      setActive("admin-insight");
      break;

    case "risk-dashboard":
    case "riskdashboard":
    case "risk":
      setActive("risk-dashboard");
      break;

    case "notifications":
      setActive("notifications");
      break;

    // ===== CASH OS SCREENS =====
    // Collections
    case "collect":
    case "collectmoney":
    case "banglaqr":
    case "paymentlinks":
    case "t0settlement":
      setActive("collect");
      break;

    case "receivables-intelligence":
    case "receivables":
    case "ardashboard":
    case "overduecustomers":
    case "autonudge":
      setActive("receivables-intelligence");
      break;

    // Payments
    case "outflow-controls":
    case "outflowcontrols":
    case "scheduledpayments":
    case "paymentdelay":
      setActive("outflow-controls");
      break;

    case "payables-intelligence":
    case "payablesintelligence":
    case "optimalpaydate":
    case "penaltyvsfloat":
      setActive("payables-intelligence");
      break;

    case "credit-backstop":
    case "creditbackstop":
    case "odcc":
    case "overdraft":
      setActive("credit-backstop");
      break;

    // Reconcile
    case "sweep-park":
    case "sweeppark":
    case "autosweep":
    case "reversesweep":
      setActive("sweep-park");
      break;

    case "cash-locks":
    case "cashlocks":
    case "nodebitwindows":
    case "outflowcaps":
      setActive("cash-locks");
      break;

    // Insights
    case "smart-alerts":
    case "smartalerts":
    case "behavioralnudges":
    case "cfodecisions":
      setActive("smart-alerts");
      break;

    case "cash-intelligence":
    case "cashintelligence":
    case "cashrunway":
    case "minsafebalance":
      setActive("cash-intelligence");
      break;

    // Accounts
    case "cash-buckets":
    case "cashbuckets":
    case "payrollbucket":
    case "taxbucket":
      setActive("cash-buckets");
      break;

    case "tax-vault":
    case "taxvault":
    case "gstparking":
    case "tdsaccumulation":
      setActive("tax-vault");
      break;

    // Settings
    case "account-control-tower":
    case "accountcontroltower":
    case "multiaccountview":
    case "externalaccounts":
      setActive("account-control-tower");
      break;

    case "benefits-incentives":
    case "benefitsincentives":
    case "feewaivers":
    case "freepayroll":
      setActive("benefits-incentives");
      break;

    // ===== INSIGHTS HUB =====
    case "insights":
      setActive("insights");
      break;

    // ===== SETTINGS HUB =====
    case "settings":
      setActive("settings");
      break;

    // ===== TRANSACTION LIMITS =====
    case "limits":
    case "transactionlimits":
    case "rolelimits":
    case "escalation":
      setActive("limits");
      break;

    // ===== BENEFICIARY GOVERNANCE =====
    case "beneficiarygovernance":
    case "beneficiaryapproval":
    case "beneficiaryrisk":
      setActive("beneficiary");
      setTimeout(() => {
        console.log('🎯 Setting BENEFICIARY GOVERNANCE view, setter exists:', !!beneficiarySetterRef.current);
        if (beneficiarySetterRef.current) {
          beneficiarySetterRef.current("governance");
        }
      }, 150);
      break;

    // ===== APPROVALS =====
    case "approvals":
      setActive("approvals");
      break;

    // ===== TRANSACTIONS =====
    case "mfs":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting MFS view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("mfs");
        }
      }, 150);
      break;

    case "own":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting OWN view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("own");
        }
      }, 150);
      break;

    case "thirdparty":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting THIRDPARTY view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("thirdparty");
        }
      }, 150);
      break;

    case "directdebit":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting DIRECTDEBIT view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("directdebit");
        }
      }, 150);
      break;

    case "bill":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting BILL view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("bill");
        }
      }, 150);
      break;

    case "npsb":
    case "interbanktransfer":
    case "banktobank":
      setActive("transaction");
      setTimeout(() => {
        console.log('🎯 Setting NPSB view, setter exists:', !!transactionSetterRef.current);
        if (transactionSetterRef.current) {
          transactionSetterRef.current("npsb");
        }
      }, 150);
      break;

    // ===== SERVICES =====
    case "positivepay":
      setActive("service");
      setTimeout(() => {
        console.log('🎯 Setting POSITIVEPAY view, setter exists:', !!serviceSetterRef.current);
        if (serviceSetterRef.current) {
          serviceSetterRef.current("ppMenu");
        }
      }, 150);
      break;

    case "cheque":
      setActive("service");
      setTimeout(() => {
        console.log('🎯 Setting CHEQUE view, setter exists:', !!serviceSetterRef.current);
        if (serviceSetterRef.current) {
          serviceSetterRef.current("cheque");
        }
      }, 150);
      break;

    // ===== BENEFICIARY =====
    case "addbrac":
      setActive("beneficiary");
      setTimeout(() => {
        console.log('🎯 Setting ADDBRAC view, setter exists:', !!beneficiarySetterRef.current);
        if (beneficiarySetterRef.current) {
          beneficiarySetterRef.current("brac");
        }
      }, 150);
      break;

    case "addother":
      setActive("beneficiary");
      setTimeout(() => {
        console.log('🎯 Setting ADDOTHER view, setter exists:', !!beneficiarySetterRef.current);
        if (beneficiarySetterRef.current) {
          beneficiarySetterRef.current("other");
        }
      }, 150);
      break;

    case "ppbeneficiary":
      setActive("beneficiary");
      setTimeout(() => {
        console.log('🎯 Setting PPBENEFICIARY view, setter exists:', !!beneficiarySetterRef.current);
        if (beneficiarySetterRef.current) {
          beneficiarySetterRef.current("pp");
        }
      }, 150);
      break;

    // ===== USER MANAGEMENT =====
    case "rolemanagement":
      setActive("service");
      setTimeout(() => {
        console.log('🎯 Setting USER MANAGEMENT view, setter exists:', !!serviceSetterRef.current);
        if (serviceSetterRef.current) {
          serviceSetterRef.current("users");
        }
      }, 150);
      break;

    default:
      setActive("dashboard");
  }
}