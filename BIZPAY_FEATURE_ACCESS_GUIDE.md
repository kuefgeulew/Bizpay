# BIZPAY FEATURE ACCESS & USAGE GUIDE

**Document Type:** As-built system reference (post-implementation)
**System Version:** Feature-complete (Post-Step 8 Freeze)
**Date:** February 18, 2026

---

## 1. System Overview

### Route Count

- **Total `case` labels in App.tsx:** 30
- **Default route:** 1 (Dashboard)
- **Total switch branches:** 31
- Note: `"service"` and `"service-request"` are two labels on a single handler (ServiceScreen). All other labels map 1:1 to a screen.

### Dock Tabs

- **Total dock icons:** 15 (3 rows of 5)
- Row 1: Home, Collect, Transfer, Pay, Approve
- Row 2: Reconcile, Reports, Timeline, Activity, Limits
- Row 3: Insights, Risk, VAM, Settings, Admin

### Role Model

Five roles exist in the system. The active role is controlled by the Floating Role Switcher (bottom-right corner, persistent across all screens). Role is read from `getCurrentUser()` at enforcement time.

| Role     | System ID  | Purpose                                     |
|----------|------------|---------------------------------------------|
| Admin    | `admin`    | Full access. Direct execution on all gates. |
| Maker    | `maker`    | Initiates transactions and requests.        |
| Checker  | `checker`  | Reviews and forwards to approver.           |
| Approver | `approver` | Final sign-off on queued items.             |
| Viewer   | `viewer`   | Read-only. All mutations blocked.           |

### Governance Enforcement Model

Every mutation surface in the system passes through a governance gate before execution. Gates return one of three outcomes:

| Outcome             | Effect                                                                 |
|----------------------|------------------------------------------------------------------------|
| `ALLOWED`           | Action executes immediately. Audit written.                            |
| `APPROVAL_REQUIRED` | Action is queued to Approval Hub. Audit written. No immediate execution.|
| `BLOCKED`           | Action is denied. GovernanceBar rendered. Audit written. No execution. |

Three gate functions exist:
- `enforceTransactionGate` -- money-moving transactions
- `enforceBeneficiaryGate` -- beneficiary lifecycle mutations
- `enforceServiceRequestGate` -- non-money-moving service requests and rule lifecycle

All gates perform: role check, permission check, limit check, daily usage check, and write to all three audit sinks.

---

## 2. Dock Tabs

---

### 2.1 Home (Dashboard)

**Route:** `default` (App.tsx switch fallthrough)
**Purpose:** Account overview, balance display, credit card activation flow.
**Access:** All roles.
**Capabilities:** Read-only observation. No transactions initiated from Dashboard.

The Dashboard renders four tab views: Accounts, FDR/DPS, Credit Card, Loans.

#### Feature: Account Balances

- **Path:** Home (default view, "Accounts" tab)
- **Who can initiate:** All roles
- **Governance:** None (read-only)
- **What it writes:** Nothing
- **What it never does:** Initiate transactions, modify balances, create records
- **Source of truth:** `AccountCard.tsx` renders from inline account data

#### Feature: Credit Card Activation Flow

- **Path:** Home → "Credit Card" tab
- **Who can initiate:** All roles (UI walkthrough only)
- **Governance:** None
- **What it writes:** Nothing (local component state only)
- **What it never does:** Issue real card commands, modify account state
- **Source of truth:** `DashboardScreen.tsx` (self-contained activation flow)

---

### 2.2 Collect

**Route:** `collect`
**Purpose:** Inbound money collection instruments.
**Access:** All roles can view. Maker/Admin can generate QR codes and payment links.
**Capabilities:** Record creation (QR codes, payment links), configuration (settlement, recurring).

#### Feature: Bangla QR

- **Path:** Dock → Collect → Bangla QR
- **Who can initiate:** All roles (generation is not governance-gated)
- **Governance:** None
- **What it writes:** Generates QR code display (ephemeral, not persisted to store)
- **What it never does:** Move money, debit accounts
- **Source of truth:** `BanglaQRScreen.tsx`

#### Feature: Payment Links

- **Path:** Dock → Collect → Payment Links
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Generates shareable link display (ephemeral)
- **What it never does:** Move money, debit accounts
- **Source of truth:** `PaymentLinksScreen.tsx`

#### Feature: Virtual Accounts (VAM access)

- **Path:** Dock → Collect → Virtual Accounts
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing (read-only view)
- **What it never does:** Create virtual accounts, move money
- **Source of truth:** `VamScreen.tsx` (shared component, also accessible via VAM dock icon)

#### Feature: Same-Day Settlement

- **Path:** Dock → Collect → Same-Day Settlement
- **Who can initiate:** All roles can view. Configuration is display-only.
- **Governance:** None
- **What it writes:** Nothing
- **What it never does:** Alter settlement timing on live transactions
- **Source of truth:** `SettlementPreferencesScreen.tsx`

#### Feature: Recurring Collections

- **Path:** Dock → Collect → Recurring Collections
- **Who can initiate:** All roles can view
- **Governance:** None
- **What it writes:** Nothing (schedule display)
- **What it never does:** Execute collections, debit third-party accounts
- **Source of truth:** `RecurringCollectionsScreen.tsx`

**Cross-link:** CollectHub accepts `initialPrefill` from Receivables Intelligence. When a user clicks "Collect via QR" or "Collect via Link" on an overdue customer in Receivables Intelligence, the system navigates to CollectHub with the invoice reference, amount, and customer name pre-filled. This is a navigation shortcut, not a duplication of functionality.

---

### 2.3 Transfer

**Route:** `transaction`
**Purpose:** All outbound money movement and payment execution.
**Access:** All roles can view menus. Execution requires Maker or Admin role via governance gates.
**Capabilities:** Execution (governed), prefill (Quick Pay).

#### Feature: Own Account Transfer (Single)

- **Path:** Dock → Transfer → Own Account → Single
- **Who can initiate:** Maker, Admin (Checker/Approver/Viewer blocked at gate)
- **Governance:** `enforceTransactionGate` with category `OWN_ACCOUNT`
- **What it writes:** Transaction record (on ALLOWED), approval queue entry (on APPROVAL_REQUIRED), audit to all three sinks
- **What it never does:** Bypass limit checks, skip audit
- **Source of truth:** `OwnAccountTransferSingle.tsx`

#### Feature: Own Account Transfer (Bulk)

- **Path:** Dock → Transfer → Own Account → Bulk
- **Who can initiate:** Maker, Admin
- **Governance:** `enforceTransactionGate` with aggregate amount
- **What it writes:** Same as single, with bulk aggregate limit applied
- **What it never does:** Process individual items without aggregate gate check
- **Source of truth:** `OwnAccountTransferBulk.tsx`

#### Feature: Third-Party Transfer

- **Path:** Dock → Transfer → Third Party
- **Who can initiate:** Maker, Admin
- **Governance:** `enforceTransactionGate` with category `THIRD_PARTY`
- **What it writes:** Transaction record (on ALLOWED), approval queue entry (on APPROVAL_REQUIRED), audit to all three sinks
- **What it never does:** Allow transfer to inactive beneficiaries
- **Source of truth:** `ThirdPartyTransferScreen.tsx`

#### Feature: Direct Debit (6 sub-screens)

- **Path:** Dock → Transfer → Direct Debit → [Own Single | Own Bulk | Third Party Single | Third Party Bulk | Cancel Approved | Cancel Mandate]
- **Who can initiate:** All roles can view forms. Execution follows screen-level governance.
- **Governance:** Screen-level form submission gates
- **What it writes:** Direct debit instruction records
- **What it never does:** Execute without form completion
- **Source of truth:** `DirectDebitMenu.tsx` and 6 sub-screens in `/directdebit/`

#### Feature: MFS Payments (bKash, Nagad, Rocket, Upay, SureCash)

- **Path:** Dock → Transfer → MFS → [Provider] → [Mode]
- **Who can initiate:** All roles can view. Execution follows per-screen gates.
- **Governance:** Per-screen enforcement
- **What it writes:** MFS transaction records
- **What it never does:** Connect to live MFS APIs
- **Source of truth:** `MfsMenu.tsx` → `MfsModeMenu.tsx`

#### Feature: Bill Payment (Electricity, WASA, Gas, Govt)

- **Path:** Dock → Transfer → Bill Payment → [Category] → [Provider]
- **Who can initiate:** All roles can view. Execution follows per-screen gates.
- **Governance:** Per-screen enforcement
- **What it writes:** Bill payment records
- **What it never does:** Connect to live utility APIs
- **Source of truth:** `BillPaymentMenu.tsx` and sub-menus under `/billpayment/`

#### Feature: Quick Pay (Prefill-Only)

- **Path:** Dock → Transfer → (horizontal scroll strip at bottom of Transfer menu)
- **Who can initiate:** All roles can tap a Quick Pay card
- **Governance:** None at selection. Governance is enforced on the destination screen.
- **What it writes:** Nothing. Quick Pay only pre-fills the target transfer screen.
- **What it never does:** Execute a payment. It navigates to Third Party / Own Account / MFS with pre-populated fields. The user must still submit on the destination screen, which is governance-gated.
- **Source of truth:** `QUICK_PAY_ENTRIES` in `/mock/quickPay.ts`, consumed by `TransactionMenuHub` in `TransactionScreen.tsx`

---

### 2.4 Pay (Beneficiary Management)

**Route:** `beneficiary`
**Purpose:** Beneficiary lifecycle management: add, edit, delete, activate, deactivate, governance workflows.
**Access:** All roles can view. Mutations require Maker or Admin role.
**Capabilities:** Execution (governed write operations).

#### Feature: Beneficiary Governance Hub

- **Path:** Dock → Pay → Beneficiary Governance
- **Who can initiate:** All roles can view. Mutations are gated.
- **Governance:** Displays approval workflows and lifecycle policies
- **What it writes:** Nothing (informational view)
- **What it never does:** Directly modify beneficiary records
- **Source of truth:** `BeneficiaryGovernanceHub.tsx`

#### Feature: Manage Beneficiaries

- **Path:** Dock → Pay → Manage Beneficiaries
- **Who can initiate:** Maker, Admin for mutations. All roles for viewing.
- **Governance:** `enforceBeneficiaryGate` per action (EDIT, DELETE, ACTIVATE, DEACTIVATE)
- **What it writes:** Beneficiary state change, approval queue entry, audit to all three sinks
- **What it never does:** Delete without governance gate, bypass cooling periods
- **Source of truth:** `ManageBeneficiary.tsx` (authoritative beneficiary list rendered from `MOCK_BENEFICIARIES`)

#### Feature: Add BRAC Bank Beneficiary

- **Path:** Dock → Pay → Add BRAC Bank Beneficiary
- **Who can initiate:** Maker, Admin
- **Governance:** `enforceBeneficiaryGate` with action `ADD`
- **What it writes:** New beneficiary record (on ALLOWED), approval queue entry (on APPROVAL_REQUIRED), audit
- **What it never does:** Add without governance check
- **Source of truth:** `AddBracBeneficiary.tsx`

#### Feature: Add Other Bank Beneficiary

- **Path:** Dock → Pay → Add Other Bank Beneficiary
- **Who can initiate:** Maker, Admin
- **Governance:** `enforceBeneficiaryGate` with action `ADD`
- **What it writes:** New beneficiary record (on ALLOWED), approval queue entry (on APPROVAL_REQUIRED), audit
- **What it never does:** Add without governance check
- **Source of truth:** `AddOtherBankBeneficiary.tsx`

#### Feature: Positive Pay (Beneficiary Context)

- **Path:** Dock → Pay → Positive Pay Register
- **Who can initiate:** Maker, Admin
- **Governance:** `enforceServiceRequestGate` with serviceType `POSITIVE_PAY`
- **What it writes:** Positive pay instruction (on ALLOWED), approval queue (on APPROVAL_REQUIRED), audit
- **What it never does:** Alter cheque clearing behavior directly
- **Source of truth:** `PositivePayBeneficiary.tsx`

---

### 2.5 Approve

**Route:** `approvals`
**Purpose:** Central approval queue for all pending governance items.
**Access:** Checker, Approver, Admin can act on items. Maker and Viewer can view queue but cannot approve/reject.
**Capabilities:** Execution (approve, reject, send back).

#### Feature: Approval Queue

- **Path:** Dock → Approve
- **Who can initiate:** All roles can view. Checker/Approver/Admin can act.
- **Governance:** Role re-validated at commit time. Terminal state enforced (no re-approval of resolved items). Idempotency enforced (double-click safe).
- **What it writes:** Approval state change (APPROVED / REJECTED / SENT_BACK), audit to all three sinks
- **What it never does:** Allow Maker to approve own submission, allow action on terminal-state items
- **Source of truth:** `ApprovalHub.tsx` → `ApprovalQueueScreen.tsx` + `ApprovalDetailScreen.tsx`. Approval records stored in `/mock/approvals.ts`.

**Types processed in approval queue:**
- Transaction approvals (own account, third party, bulk)
- Beneficiary mutation approvals (add, edit, delete, activate, deactivate)
- Service request approvals (stop cheque, dispute, support ticket, positive pay, software token, chequebook)

---

### 2.6 Reconcile

**Route:** `reconciliation`
**Purpose:** Bank reconciliation dashboard, exception management, manual matching, and auto-reconciliation rule engine.
**Access:** All roles can view. Manual matching requires Maker/Checker/Admin.
**Capabilities:** Read-only dashboards, governed manual matching, governed rule lifecycle.

#### Feature: Reconciliation Dashboard

- **Path:** Dock → Reconcile (default view)
- **Who can initiate:** All roles
- **Governance:** None (read-only)
- **What it writes:** Nothing
- **What it never does:** Auto-match, modify transaction records
- **Source of truth:** `ReconciliationDashboardScreen.tsx`

#### Feature: Exception Management

- **Path:** Dock → Reconcile → Exceptions
- **Who can initiate:** All roles can view. Resolution navigates to Manual Matching.
- **Governance:** None on viewing. Resolution is governed via Manual Matching.
- **What it writes:** Nothing (navigation only)
- **What it never does:** Auto-resolve exceptions
- **Source of truth:** `ExceptionManagementScreen.tsx`

#### Feature: Manual Matching

- **Path:** Dock → Reconcile → Manual Matching
- **Who can initiate:** Maker, Checker, Admin
- **Governance:** Role-gated at match confirmation
- **What it writes:** Match records, audit entries
- **What it never does:** Match without user confirmation
- **Source of truth:** `ManualMatchingScreen.tsx`

#### Feature: Auto-Reconciliation Rules

- **Path:** Dock → Reconcile → Auto-Recon Rules → [Overview | Detail | Create | Simulation | Exception Routing]
- **Who can initiate:** Maker, Admin for rule creation/modification. All roles for viewing.
- **Governance:** `enforceServiceRequestGate` on create, edit, enable/disable actions
- **What it writes:** Rule records (on ALLOWED), approval queue entries (on APPROVAL_REQUIRED), audit
- **What it never does:** Auto-execute matching without defined rules, bypass governance on rule lifecycle changes
- **Source of truth:** `AutoReconRulesHub.tsx` and sub-screens in `/autorules/`

#### Feature: Tax Vault (cross-link)

- **Path:** Dock → Reconcile → Tax Vault
- **Who can initiate:** All roles
- **Governance:** None (read-only)
- **What it writes:** Nothing
- **What it never does:** Move tax-parked funds
- **Source of truth:** `TaxVaultScreen.tsx` (shared component; authoritative instance documented under Settings)

---

### 2.7 Reports

**Route:** `reports`
**Purpose:** Financial reporting, statement generation, invoicing, tax compliance, and certificates.
**Access:** All roles.
**Capabilities:** Read-only viewing, record creation (invoices only via InvoicesHub).

#### Feature: Account Summary

- **Path:** Dock → Reports → Account Summary
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `AccountSummary.tsx`

#### Feature: Generate Statement

- **Path:** Dock → Reports → Generate Statement
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing (display/export only)
- **Source of truth:** `GenerateStatement.tsx`

#### Feature: Cash Flow Analysis

- **Path:** Dock → Reports → Cash Flow Analysis
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `CashFlowAnalysisScreen.tsx`

#### Feature: Invoices & Outstanding (InvoicesHub)

- **Path:** Dock → Reports → Invoices & Outstanding → [Overview | List | Detail | Outstanding Tracker | Create GST Invoice]
- **Who can initiate:** All roles can view. Invoice creation available to Maker/Admin.
- **Governance:** None (invoice creation is a record creation, not a money movement)
- **What it writes:** Invoice records (Create GST Invoice screen)
- **What it never does:** Trigger payments, debit accounts, send invoices externally
- **Source of truth:** `InvoicesHub.tsx` and sub-screens in `/invoices/`. This is the sole location where invoices are created.

#### Feature: Tax & Compliance

- **Path:** Dock → Reports → Tax & Compliance
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `TaxComplianceScreen.tsx`

#### Feature: Certificates (Balance Confirmation)

- **Path:** Dock → Reports → Certificates → Balance Confirmation
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing (certificate display/export only)
- **Source of truth:** `CertificatesMenu.tsx` → `BalanceConfirmationScreen.tsx`

#### Feature: Direct Debit Reports

- **Path:** Dock → Reports → Direct Debit Reports
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `DirectDebitReportsMenu.tsx`

#### Feature: Transaction Reports

- **Path:** Dock → Reports → Transaction Reports
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `TransactionReportsMenu.tsx`

#### Feature: Bill Payment Reports

- **Path:** Dock → Reports → Bill Payment Reports
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `BillPaymentReportsMenu.tsx`

#### Feature: Positive Pay Reports

- **Path:** Dock → Reports → Positive Pay Reports
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `PositivePayReportsMenu.tsx`

---

### 2.8 Timeline

**Route:** `timeline`
**Purpose:** Calendar and schedule view of payment events.
**Access:** All roles.
**Capabilities:** Read-only.

#### Feature: Timeline View

- **Path:** Dock → Timeline
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **What it never does:** Create, modify, or cancel scheduled items
- **Source of truth:** `TimelineScreen.tsx`

---

### 2.9 Activity

**Route:** `activity-log`
**Purpose:** Immutable activity log with filtering, search, and correlation-based drill-down.
**Access:** All roles.
**Capabilities:** Read-only.

#### Feature: Enhanced Activity Log

- **Path:** Dock → Activity
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing (it reads from `MOCK_ACTIVITY_LOG`)
- **What it never does:** Modify, delete, or redact log entries
- **Source of truth:** `EnhancedActivityLogScreen.tsx`, reading from `MOCK_ACTIVITY_LOG` in `/data/activityLog.ts`

---

### 2.10 Limits

**Route:** `limits`
**Purpose:** Transaction limit visibility, pre-check simulation, escalation rules, and breach history.
**Access:** All roles.
**Capabilities:** Read-only observation, simulation (pre-check).

#### Feature: Role-Based Limits

- **Path:** Dock → Limits → Role-Based Limits
- **Who can initiate:** All roles
- **Governance:** None (display only)
- **What it writes:** Nothing
- **What it never does:** Modify limit values (that is Admin-only configuration in Admin Hub)
- **Source of truth:** `LimitConfigurationScreen.tsx`, reading from `MOCK_TRANSACTION_LIMITS`

#### Feature: Transaction Pre-Check

- **Path:** Dock → Limits → Transaction Pre-Check
- **Who can initiate:** All roles
- **Governance:** None (simulation only, does not execute)
- **What it writes:** Nothing
- **What it never does:** Execute transactions, modify limits
- **Source of truth:** `TransactionPreCheckScreen.tsx`

#### Feature: Escalation Rules

- **Path:** Dock → Limits → Escalation Rules
- **Who can initiate:** All roles
- **Governance:** None (display only)
- **What it writes:** Nothing
- **Source of truth:** `EscalationRulesScreen.tsx`

#### Feature: Limit Breach History

- **Path:** Dock → Limits → Limit Breach History
- **Who can initiate:** All roles
- **Governance:** None (historical display)
- **What it writes:** Nothing
- **Source of truth:** `LimitBreachHistoryScreen.tsx`

---

### 2.11 Insights

**Route:** `insights`
**Purpose:** Central navigation hub that dispatches to all insight and monitoring screens.
**Access:** All roles.
**Capabilities:** Navigation-only (no data displayed on the hub itself).

InsightsHub is a pure navigation dispatcher. It renders cards that navigate to standalone screens via `onNavigate`. It does not display data itself. The destination screens are the sources of truth.

Cards and their destinations:
| Card                    | Navigates To                 |
|-------------------------|------------------------------|
| Smart Alerts            | `smart-alerts` route         |
| Cash Intelligence       | `cash-intelligence` route    |
| Risk Dashboard          | `risk-dashboard` route       |
| Admin Control Tower     | `admin-insight` route        |
| Timeline View           | `timeline` route             |
| Activity Log            | `activity-log` route         |
| VAM Intelligence        | `vam` route                  |
| Reports & Reconciliation| `reports` route              |

---

### 2.12 Risk

**Route:** `risk-dashboard`
**Purpose:** Fraud prevention and risk monitoring dashboard.
**Access:** All roles.
**Capabilities:** Read-only.

#### Feature: Risk Dashboard

- **Path:** Dock → Risk
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **What it never does:** Block transactions, modify risk scores, trigger alerts
- **Source of truth:** `RiskDashboardScreen.tsx`

---

### 2.13 VAM

**Route:** `collections`
**Purpose:** Virtual Account Management hub with collection tracking, cash allocation, and tax parking.
**Access:** All roles.
**Capabilities:** Read-only.

#### Feature: Virtual Account Management

- **Path:** Dock → VAM → Virtual Account Management
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `VamScreen.tsx`

#### Feature: Direct Debit Collection

- **Path:** Dock → VAM → Direct Debit Collection
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `DirectDebitCollectionScreen.tsx`

#### Feature: Collection Match

- **Path:** Dock → VAM → Collection Match
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `CollectionMatchScreen.tsx`

#### Feature: Cash Buckets (cross-link)

- **Path:** Dock → VAM → Cash Buckets
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `CashBucketsScreen.tsx` (shared component; also accessible via Settings and standalone route)

#### Feature: Tax Vault (cross-link)

- **Path:** Dock → VAM → Tax Vault
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `TaxVaultScreen.tsx` (shared component)

---

### 2.14 Settings

**Route:** `settings`
**Purpose:** Account configuration, service request dispatch, and business tools.
**Access:** All roles can view. Write operations are governed per-destination.
**Capabilities:** Navigation dispatch (most cards navigate to standalone routes), internal views for Marketplace and Integrations.

#### Feature: Account Control Tower

- **Path:** Dock → Settings → Account Control Tower (navigates to `account-control-tower` route)
- **Who can initiate:** All roles
- **Governance:** None (read-only consolidated view)
- **What it writes:** Nothing
- **What it never does:** Modify account structures, move money
- **Source of truth:** `AccountControlTowerScreen.tsx`

#### Feature: Cash Buckets

- **Path:** Dock → Settings → Cash Buckets (navigates to `cash-buckets` route)
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `CashBucketsScreen.tsx`

#### Feature: Tax Vault

- **Path:** Dock → Settings → Tax Vault (navigates to `tax-vault` route)
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **Source of truth:** `TaxVaultScreen.tsx`

#### Feature: Service Requests

- **Path:** Dock → Settings → Service Requests (navigates to `service-request` route)
- **Who can initiate:** All roles can view. Governed per-service.
- **Governance:** Per-service enforcement (see Section 5)
- **What it writes:** Service request records, approval queue entries, audit
- **Source of truth:** `ServiceRequestMenu.tsx` (see Section 5 for full breakdown)

#### Feature: Benefits & Incentives

- **Path:** Dock → Settings → Benefits & Incentives (navigates to `benefits-incentives` route)
- **Who can initiate:** All roles
- **Governance:** None (read-only)
- **What it writes:** Nothing
- **What it never does:** Grant benefits, modify fee structures
- **Source of truth:** `BenefitsIncentivesScreen.tsx`

#### Feature: Marketplace

- **Path:** Dock → Settings → Marketplace (internal view, no App.tsx route)
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **What it never does:** Initiate partner onboarding, execute purchases
- **Source of truth:** `MarketplaceScreen.tsx` (internal to SettingsHub)

#### Feature: Integrations

- **Path:** Dock → Settings → Integrations (internal view, no App.tsx route)
- **Who can initiate:** All roles
- **Governance:** None
- **What it writes:** Nothing
- **What it never does:** Connect to Tally/Zoho/QuickBooks, sync data
- **Source of truth:** `IntegrationsScreen.tsx` (internal to SettingsHub)

---

### 2.15 Admin

**Route:** `admin-insight`
**Purpose:** System administration, user management, access control, approval rule configuration, security, audit, and business profile management.
**Access:** All roles can view. Configuration changes are limited by governance.
**Capabilities:** Configuration (users, profiles), read-only (permissions, rules, limits, audit, security).

#### Feature: Users

- **Path:** Dock → Admin → Users
- **Who can initiate:** Admin for add/edit. All roles can view user list.
- **Governance:** User mutation is role-gated (Admin only)
- **What it writes:** User records (add/edit)
- **What it never does:** Execute transactions, modify account balances
- **Source of truth:** `UserManagementHub.tsx`

#### Feature: Access Control (Permission Matrix)

- **Path:** Dock → Admin → Access Control
- **Who can initiate:** All roles (read-only)
- **Governance:** None (display only)
- **What it writes:** Nothing
- **What it never does:** Modify permissions at runtime
- **Source of truth:** `PermissionMatrixScreen.tsx`, reading from `FEATURE_PERMISSIONS`

#### Feature: Approval Rules

- **Path:** Dock → Admin → Approval Rules
- **Who can initiate:** All roles (read-only)
- **Governance:** None (display only)
- **What it writes:** Nothing
- **What it never does:** Create or delete approval chains
- **Source of truth:** `ApprovalWorkflowScreen.tsx`, reading from `MOCK_APPROVAL_RULES`

#### Feature: Transaction Limits (Admin View)

- **Path:** Dock → Admin → Transaction Limits
- **Who can initiate:** All roles (read-only)
- **Governance:** None (display only)
- **What it writes:** Nothing
- **What it never does:** Override active limit enforcement. This is a view of the same data that the Limits dock tab displays, but presented in the admin context. The Limits dock tab is the operational reference; Admin is the configuration reference.
- **Source of truth:** `AdminTransactionLimitsScreen.tsx`, reading from `MOCK_TRANSACTION_LIMITS`

#### Feature: Security (Device & Session)

- **Path:** Dock → Admin → Security
- **Who can initiate:** Admin can force logout. All roles can view.
- **Governance:** Force logout writes audit
- **What it writes:** Audit entries on forced logout
- **What it never does:** Modify authentication backends
- **Source of truth:** `DeviceSecurityScreen.tsx`

#### Feature: Audit & Compliance

- **Path:** Dock → Admin → Audit & Compliance
- **Who can initiate:** All roles (read-only)
- **Governance:** None (display only)
- **What it writes:** Nothing
- **What it never does:** Modify, delete, or redact audit records
- **Source of truth:** `AuditComplianceScreen.tsx`, reading from `MOCK_AUDIT_EVENTS`. Also provides access to Automation Control Panel.

#### Feature: Business Profiles

- **Path:** Dock → Admin → Business Profiles
- **Who can initiate:** Admin for context switching. All roles can view.
- **Governance:** Context switch writes triple-audit (all three sinks)
- **What it writes:** Audit entries on profile switch, banner update
- **What it never does:** Propagate profile changes outside Admin, modify account data
- **Source of truth:** `BusinessProfilesScreen.tsx`

---

## 3. Collections & Receivables (Special Rule)

### Authoritative AR Command Center

**Receivables Intelligence** (`receivables-intelligence` route, `ReceivablesIntelligenceScreen.tsx`) is the single authoritative Accounts Receivable command center in BizPay.

### Relationship Clarification

| Screen                        | Location                             | Role                                                        | Creates Records? |
|-------------------------------|--------------------------------------|-------------------------------------------------------------|------------------|
| **Receivables Intelligence**  | Standalone route `receivables-intelligence` | AR command center. Displays total outstanding, DSO, aging buckets, top overdue customers. Provides per-customer messaging (predefined templates via SMS/WhatsApp/Email). Provides "Collect via QR" and "Collect via Link" actions that navigate to CollectHub with prefill. | Yes (sent messages) |
| **InvoicesHub**               | Reports → Invoices & Outstanding     | Invoice record management. Create GST invoices, view invoice list, view invoice detail. Outstanding Tracker shows client-level outstanding aggregation. | Yes (invoices) |
| **Outstanding Tracker**       | Reports → Invoices & Outstanding → Outstanding Tracker | Client-level outstanding balance aggregation within InvoicesHub. | No |

### Rules

1. **Invoices are created only in InvoicesHub** (specifically `CreateGSTInvoiceScreen.tsx`). No other screen creates invoice records.
2. **Receivables Intelligence reads invoice data** from `MOCK_INVOICES` (in `/data/receivablesData.ts`) but does not create or modify invoices.
3. **Outstanding Tracker** (inside InvoicesHub) shows client-level aggregation. Receivables Intelligence shows customer-level aging with action buttons. These are complementary views of related data, not duplicates.
4. **Customer messaging** (SMS/WhatsApp/Email using predefined templates) is executed only from Receivables Intelligence. Templates are defined in `/mock/customerMessaging.ts`. No free-text messaging exists.
5. **Collection actions** (QR, Link) initiated from Receivables Intelligence navigate to CollectHub with prefill. CollectHub is the execution surface. Receivables Intelligence is the dispatch surface.

---

## 4. Payments & Transfers

### Screens That Can Execute Money Movement

These screens contain governance-gated submission flows that represent money-moving actions:

| Screen                          | Gate Function              | Category        |
|---------------------------------|----------------------------|-----------------|
| `OwnAccountTransferSingle.tsx`  | `enforceTransactionGate`   | `OWN_ACCOUNT`   |
| `OwnAccountTransferBulk.tsx`    | `enforceTransactionGate`   | `OWN_ACCOUNT`   |
| `ThirdPartyTransferScreen.tsx`  | `enforceTransactionGate`   | `THIRD_PARTY`   |
| Direct Debit screens (6)        | Per-screen form submission | Direct Debit    |
| MFS screens                     | Per-screen form submission | MFS             |
| Bill Payment screens            | Per-screen form submission | Bill Payment    |

### Prefill-Only Screens (No Execution)

| Screen / Feature | What It Does                                                    |
|------------------|-----------------------------------------------------------------|
| Quick Pay strip  | Pre-populates destination transfer screen with beneficiary, amount, and narration. User must still submit on the destination, which is governance-gated. |
| Receivables Intelligence → Collect via QR/Link | Navigates to CollectHub with invoice reference and amount prefilled. CollectHub handles generation. |

### Distinction

- Quick Pay is **not** a payment execution mechanism. It is a navigation shortcut with data prefill.
- All actual money movement requires explicit user submission on a governance-gated screen.

---

## 5. Service Requests & Operations

Service Requests are accessible via: **Settings → Service Requests** (navigates to `service-request` route).

The ServiceRequestMenu provides access to five areas: Operations, Positive Pay, User Management, History, and Admin Insight. Operations contains four sub-services.

### 5.1 Software Token

- **Path:** Settings → Service Requests → Operations → Software Token
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `SOFTWARE_TOKEN`)
- **Execution:** Admin → immediate execution. Non-admin → `APPROVAL_REQUIRED` (queued). Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks on every gate invocation
- **Source of truth:** `SoftwareTokenMenu.tsx`

### 5.2 Chequebook Inventory

- **Path:** Settings → Service Requests → Operations → Cheque Services → Chequebook Inventory
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `CHEQUEBOOK`)
- **Execution:** Admin → immediate. Non-admin → `APPROVAL_REQUIRED`. Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks
- **Source of truth:** `ChequebookInventory.tsx`

### 5.3 Stop Cheque

- **Path:** Settings → Service Requests → Operations → Cheque Services → Stop Cheque
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `STOP_CHEQUE`)
- **Execution:** Admin → direct execution (`EXECUTED` outcome). Non-admin → `APPROVAL_REQUIRED`. Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks. Stop cheque request record added to `/mock/chequeRequests.ts`.
- **Source of truth:** `StopChequeScreen.tsx`

### 5.4 Disputes

- **Path:** Settings → Service Requests → Operations → Disputes
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `DISPUTE_REQUEST`)
- **Execution:** Admin → immediate. Non-admin → `APPROVAL_REQUIRED`. Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks. Dispute record added to `/mock/disputes.ts`.
- **What it never does:** Alter transaction state. Disputes are claims, not reversals.
- **Source of truth:** `DisputeManagementScreen.tsx`

### 5.5 Support & Tickets

- **Path:** Settings → Service Requests → Operations → Support & Tickets
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `SUPPORT_TICKET`)
- **Execution:** Admin → immediate. Non-admin → `APPROVAL_REQUIRED`. Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks. Ticket record added to `/mock/supportTickets.ts`. Tickets are immutable post-creation.
- **Includes:** Read-only Relationship Manager (RM) and Service Manager panel with contact details.
- **Source of truth:** `SupportTicketsScreen.tsx`

### 5.6 Positive Pay

- **Path:** Settings → Service Requests → Positive Pay
- **Governed:** Yes (`enforceServiceRequestGate` with serviceType `POSITIVE_PAY`)
- **Execution:** Admin → immediate. Non-admin → `APPROVAL_REQUIRED`. Viewer → `BLOCKED`.
- **Audit:** Written to all three sinks
- **Source of truth:** `PositivePayMenu.tsx`

### 5.7 User Management (cross-link)

- **Path:** Settings → Service Requests → User Management
- **Renders:** `UserManagementHub.tsx` (same component used by Admin → Users)
- **Source of truth:** Admin → Users is the authoritative location. This is a navigation shortcut.

### 5.8 History

- **Path:** Settings → Service Requests → History
- **Renders:** `FeatureOverviewScreen` (read-only informational page)
- **What it writes:** Nothing

### 5.9 Admin Insight (cross-link)

- **Path:** Settings → Service Requests → Admin Insight
- **Renders:** `AdminInsightScreen.tsx`
- **Source of truth:** Admin dock tab is the authoritative location. This is a navigation shortcut.

---

## 6. Admin / Governance

All Admin sub-sections are accessed via **Dock → Admin** (`admin-insight` route → `AdminHub.tsx`).

### Admin Sub-Sections

| Sub-Section          | Component                         | Read-Only | Configuration | Execution |
|----------------------|-----------------------------------|-----------|---------------|-----------|
| Users                | `UserManagementHub.tsx`           | No        | Yes (add/edit)| No        |
| Access Control       | `PermissionMatrixScreen.tsx`      | Yes       | No            | No        |
| Approval Rules       | `ApprovalWorkflowScreen.tsx`      | Yes       | No            | No        |
| Transaction Limits   | `AdminTransactionLimitsScreen.tsx` | Yes       | No            | No        |
| Security             | `DeviceSecurityScreen.tsx`        | Partial   | No            | Yes (force logout only) |
| Audit & Compliance   | `AuditComplianceScreen.tsx`       | Yes       | No            | No        |
| Business Profiles    | `BusinessProfilesScreen.tsx`      | Partial   | Yes (context switch) | No  |

### Explicit Admin Boundaries

- **No balances are shown** in any Admin screen.
- **No transactions are executed** from any Admin screen.
- **No payment channels** are accessible from Admin.
- Admin is isolated from all money-movement surfaces. It governs configuration and observability only.
- Force logout in Security is the only execution action. It writes an audit entry and terminates the target session record.
- Business Profile context switch updates the active entity banner and writes a triple-audit entry (all three sinks). It does not propagate changes outside the Admin hub.

---

## 7. Reports & Records

### Screens That Create Records

| Screen                      | Record Type        | Location                              |
|-----------------------------|--------------------|---------------------------------------|
| `CreateGSTInvoiceScreen.tsx`| Invoice            | Reports → Invoices & Outstanding → Create |
| `ReceivablesIntelligenceScreen.tsx` | Sent Message | Standalone route `receivables-intelligence` |
| `BanglaQRScreen.tsx`        | QR Code (ephemeral)| Collect → Bangla QR                   |
| `PaymentLinksScreen.tsx`    | Payment Link (ephemeral) | Collect → Payment Links          |

### Screens That Only Display Records

All other screens in the Reports dock tab are read-only:
- Account Summary
- Generate Statement
- Cash Flow Analysis
- Invoice List / Detail / Overview
- Outstanding Tracker
- Tax & Compliance
- Balance Confirmation Certificate
- Direct Debit Reports
- Transaction Reports
- Bill Payment Reports
- Positive Pay Reports

### Invoice Creation Authority

**Invoices are created exclusively in InvoicesHub → Create GST Invoice** (`CreateGSTInvoiceScreen.tsx`). No other screen in the system creates invoice records.

---

## 8. Audit & Immutability

### Audit Sinks

Three audit stores exist. All governed actions write to all three simultaneously (triple-write pattern).

| Sink                   | Location                          | Primary Consumer                     |
|------------------------|-----------------------------------|--------------------------------------|
| `MOCK_AUDIT_EVENTS`    | `/data/adminGovernance.ts`        | Admin → Audit & Compliance           |
| `MOCK_ACTIVITY_LOG`    | `/data/activityLog.ts`            | Activity dock tab (EnhancedActivityLogScreen) |
| `MOCK_ACTIVITY_LOGS`   | `/mock/activityLogs.ts`           | Activity logging subsystem (via `createActivityLog`) |

### Actions That Write Audit Entries

- All `enforceTransactionGate` invocations (regardless of outcome)
- All `enforceBeneficiaryGate` invocations (regardless of outcome)
- All `enforceServiceRequestGate` invocations (regardless of outcome)
- All approval actions (approve, reject, send back)
- Admin → Security → Force Logout
- Admin → Business Profiles → Context Switch
- Screen mount events (Settings Hub, Admin Hub, Insights Hub, Receivables Intelligence)

### Immutability Rules

- Every audit entry has `isImmutable: true`.
- No UI surface provides edit or delete controls for audit records.
- Audit entries include a `correlationId` for cross-referencing related events.
- The Enhanced Activity Log screen supports filtering by correlation ID to trace full event chains.
- Audit schema validation is enforced via `validateAuditSchema()` in the idempotency module.

### Idempotency & Safety

- `generateIdempotencyKey()` creates unique keys per action.
- `checkAndRegisterKey()` prevents duplicate processing.
- `acquireResolutionLock()` / `releaseResolutionLock()` prevent concurrent resolution of the same item.
- `isTerminalState()` guards against re-processing of resolved approvals.

---

## 9. Explicit Exclusions

### WHAT BIZPAY EXPLICITLY DOES NOT DO

**Money Movement**
- No real bank API integration. All transaction execution is frontend-scoped.
- No inter-bank settlement. No RTGS, NEFT, or SWIFT execution.
- No real MFS provider connectivity (bKash, Nagad, Rocket, Upay, SureCash).
- No real utility provider connectivity (DESCO, DPDC, WASA, Gas).
- No real card issuance or card management backend.

**Data & Persistence**
- No server-side persistence. All data is held in JavaScript module-level arrays that reset on page reload.
- No user authentication backend. Role switching is a frontend-only toggle.
- No encryption of stored data (there is no stored data beyond session memory).
- No PII collection, storage, or processing.

**Automation**
- No scheduled job execution. Timeline and schedule displays are read-only calendars.
- No auto-sweep execution. Sweep & Park screen is observational.
- No automated payment processing. Recurring Collections screen displays schedules only.
- No automated nudge sending. Customer messaging in Receivables Intelligence requires manual template selection and send action per customer.

**Intelligence & Analytics**
- No predictive modeling or ML-based forecasting.
- No real-time data feeds. All metrics are computed from static datasets.
- No external data source integration.

**Communication**
- No real SMS, WhatsApp, or Email delivery. Messaging in Receivables Intelligence records a sent message entry in the local mock store.
- No push notifications to devices.
- No webhook or event streaming.

**Integrations**
- No live Tally, Zoho, or QuickBooks integration. The Integrations screen displays connection scope information only.
- No Marketplace partner onboarding or transaction processing.
- No external API consumption of any kind.

**Growth & Marketing**
- No customer acquisition features.
- No promotional campaign tools.
- No referral or loyalty point systems (Benefits & Incentives is a read-only display of balance-discipline privileges).

**Intentionally Blocked by Design**
- Viewers cannot initiate any mutation (enforced at every governance gate).
- Makers cannot approve their own submissions (enforced at approval commit).
- No transaction can bypass limit checks (enforced at `enforceTransactionGate`).
- No beneficiary can be added/modified/deleted without governance gate clearance.
- No approval can be re-processed after reaching terminal state (idempotency guard).
- No audit record can be modified or deleted from any UI surface.

---

## Final Certification

"I certify that this document reflects the actual, currently running BizPay system. Every feature listed is reachable, wired, governed, and audited as described. No future or speculative functionality is included."

- **Developer:** BizPay Development (Execution Role)
- **Date:** February 18, 2026
- **Route count confirmed:** 30 case labels + 1 default = 31 switch branches in App.tsx
