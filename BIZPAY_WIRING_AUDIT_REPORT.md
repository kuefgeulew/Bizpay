# BIZPAY — FULL WIRING, RENDER & MOUNT AUDIT
**Date:** Feb 18, 2026
**Scope:** All screens, components, sub-components, hubs, data files, mock files
**Routes audited:** 30 cases (frozen)
**Method:** Static import-chain analysis + navigation-path tracing

---

## 1. ROUTING LAYER (App.tsx) — 30 Cases

| # | Route ID | Component | File | Rendered |
|---|----------|-----------|------|----------|
| 1 | `transaction` | TransactionScreen | screens/sme/TransactionScreen.tsx | Yes |
| 2 | `service` / `service-request` | ServiceScreen | screens/sme/ServiceScreen.tsx | Yes |
| 3 | `approvals` | ApprovalHub | screens/sme/approvals/ApprovalHub.tsx | Yes |
| 4 | `reconciliation` | ReconciliationHub | screens/sme/reconciliation/ReconciliationHub.tsx | Yes |
| 5 | `limits` | TransactionLimitsHub | screens/sme/limits/TransactionLimitsHub.tsx | Yes |
| 6 | `beneficiary` | BeneficiaryMenu | screens/sme/beneficiary/BeneficiaryMenu.tsx | Yes |
| 7 | `reports` | ReportsMenu | screens/sme/reports/ReportsMenu.tsx | Yes |
| 8 | `timeline` | TimelineScreen | screens/sme/insights/TimelineScreen.tsx | Yes |
| 9 | `notifications` | NotificationCenter | screens/sme/admin/NotificationCenter.tsx | Yes |
| 10 | `activity-log` | EnhancedActivityLogScreen | screens/sme/admin/EnhancedActivityLogScreen.tsx | Yes |
| 11 | `vam` | VamScreen | screens/sme/insights/VamScreen.tsx | Yes |
| 12 | `admin-insight` | AdminInsightScreen | screens/sme/admin/AdminInsightScreen.tsx | Yes |
| 13 | `risk-dashboard` | RiskDashboardScreen | screens/sme/insights/RiskDashboardScreen.tsx | Yes |
| 14 | `collections` | CollectionsHub | screens/sme/insights/CollectionsHub.tsx | Yes |
| 15 | `insights` | InsightsHub | screens/sme/insights/InsightsHub.tsx | Yes |
| 16 | `settings` | SettingsHub | screens/sme/settings/SettingsHub.tsx | Yes |
| 17 | `collect` | CollectHub | screens/sme/collections/CollectHub.tsx | Yes |
| 18 | `receivables-intelligence` | ReceivablesIntelligenceScreen | screens/sme/collections/ReceivablesIntelligenceScreen.tsx | Yes |
| 19 | `outflow-controls` | OutflowControlsScreen | screens/sme/payments/OutflowControlsScreen.tsx | Yes |
| 20 | `payables-intelligence` | PayablesIntelligenceScreen | screens/sme/payments/PayablesIntelligenceScreen.tsx | Yes |
| 21 | `credit-backstop` | CreditBackstopScreen | screens/sme/payments/CreditBackstopScreen.tsx | Yes |
| 22 | `sweep-park` | SweepParkScreen | screens/sme/reconcile/SweepParkScreen.tsx | Yes |
| 23 | `cash-locks` | CashLocksScreen | screens/sme/reconcile/CashLocksScreen.tsx | Yes |
| 24 | `smart-alerts` | SmartAlertsScreen | screens/sme/insights/SmartAlertsScreen.tsx | Yes |
| 25 | `cash-intelligence` | CashIntelligenceScreen | screens/sme/insights/CashIntelligenceScreen.tsx | Yes |
| 26 | `cash-buckets` | CashBucketsScreen | screens/sme/accounts/CashBucketsScreen.tsx | Yes |
| 27 | `tax-vault` | TaxVaultScreen | screens/sme/accounts/TaxVaultScreen.tsx | Yes |
| 28 | `account-control-tower` | AccountControlTowerScreen | screens/sme/settings/AccountControlTowerScreen.tsx | Yes |
| 29 | `benefits-incentives` | BenefitsIncentivesScreen | screens/sme/settings/BenefitsIncentivesScreen.tsx | Yes |
| 30 | `default` | DashboardScreen | screens/DashboardScreen.tsx | Yes |

No ghost routes. No deleted components. No unreachable cases.

---

## 2. HUB & MENU NAVIGATION

### DockGrid (14 active items + 1 null slot)
All 14 targets map to valid App.tsx cases. **No failures.**

### InsightsHub (8 cards)
All 8 card IDs (`smart-alerts`, `cash-intelligence`, `risk-dashboard`, `admin-insight`, `timeline`, `activity-log`, `vam`, `reports`) map to valid App.tsx cases. **No failures.**

### SettingsHub (5 cards)

| Card ID | Target Exists | Status |
|---------|--------------|--------|
| `account-control-tower` | Yes | OK |
| `cash-buckets` | Yes | OK |
| `tax-vault` | Yes | OK |
| `service-requests` | **No** | **BROKEN** |
| `benefits-incentives` | Yes | OK |

> **FINDING:**
> - Status: BROKEN
> - Component: `SettingsHub.tsx` line 66
> - Card id `"service-requests"` does not match any App.tsx case. App.tsx has `"service"` and `"service-request"` (singular). Clicking this card falls to the default case and shows Dashboard.
> - Fix: Change card id from `"service-requests"` to `"service-request"`

### CollectionsHub (5 items — internal sub-routing)
All route to internal views (vam, dd-collection, match, cash-buckets, tax-vault). All mount components. **No failures.**

---

## 3. INTERNAL SUB-SCREEN ROUTERS

| Router | Views | All Mount | Issues |
|--------|-------|-----------|--------|
| TransactionScreen | mfs, own, directdebit, bill, thirdparty | Yes | None |
| ServiceScreen | ppMenu, cheque, software, history | Yes | None |
| ServiceRequestMenu | software, positive, cheque, history, users, admin | Yes | None |
| BeneficiaryMenu | brac, other, pp, manage, governance | Yes | None |
| ApprovalHub | queue, detail | Yes | None |
| ReconciliationHub | dashboard, exceptions, manual, auto-rules, tax-vault, matches | Yes | None |
| TransactionLimitsHub | limits, precheck, escalation, history | Yes | None |
| CollectHub | bangla-qr, payment-links, virtual-accounts, settlement | Yes | None |
| AutoReconRulesHub | overview, detail, simulation, exceptions | Yes | None |
| InvoicesHub | overview, list, detail, outstanding | Yes | None |

No unreachable branches. All default states render content. **No failures.**

---

## 4. COMMAND SEARCH REALITY CHECK

### Search terms that route to nothing
None. All 85 CommandSearch entries map to valid `searchNavigator` cases which map to valid App.tsx routes or internal sub-view setters.

### iconKey mismatches
None. All 6 used keys (`zap`, `creditCard`, `activity`, `fileText`, `users`, `settings`) exist in `ICON_MAP`.

### Duplicate entries

| Status | Entry | Lines |
|--------|-------|-------|
| EXACT DUPLICATE | `{ id: "cash-buckets", label: "Mental Accounting", sub: "Bucket allocation" }` | Lines 95 + 98 |

> - Fix: Delete one of the duplicate entries (line 98)

### Duplicate key warning (non-fatal)
Multiple CommandSearch entries share the same `id` (e.g., 4 entries with `id: "smart-alerts"`, 4 with `id: "account-control-tower"`). The `key` prop uses `item.id`, causing React duplicate-key warnings when unfiltered. Non-fatal but should use index or composite key.

---

## 5. COMPONENT USAGE AUDIT

### Dead Components

| Status | File | Reason | Recommendation |
|--------|------|--------|----------------|
| DEAD | `/src/app/components/security/SecurityModals.tsx` | Imported by nobody | DELETE |
| DEAD | `/src/app/tests/criticalVerification.ts` | Imported by nobody | DELETE |

### Dead Data Files

| Status | File | Reason | Recommendation |
|--------|------|--------|----------------|
| DEAD | `/src/app/data/transactionData.ts` | Imported by nobody | DELETE |
| DEAD | `/src/app/data/approvalExtensions.ts` | Imported by nobody | DELETE |

### Dead Mock Files

| Status | File | Reason | Recommendation |
|--------|------|--------|----------------|
| DEAD | `/src/app/mock/state.ts` | Imported by nobody | DELETE |

### Transitively Dead (reachable only from dead files)

| Status | File | Reason | Recommendation |
|--------|------|--------|----------------|
| TRANSITIVELY DEAD | `/src/app/data/securityHardening.ts` | Only imported by dead SecurityModals.tsx and dead criticalVerification.ts | DELETE with parents |

### All Other Files
Every other screen, component, data, and mock file is imported by at least one live parent in the render tree.

---

## 6. MOUNT VERIFICATION

### Screens that exist but never mount
None. All 30 routed screens mount on their respective case match.

### Screens that mount only under edge conditions
| Screen | Condition | Verdict |
|--------|-----------|---------|
| ApprovalDetailScreen | Requires `selectedItem !== null` | Safe — guarded redirect to queue if null |
| ReconciliationHub `"matches"` view | Minimal inline JSX | Renders content, not empty |

No screens with early `return null` that blocks mounting under normal conditions.

---

## 7. DUPLICATION & SHADOWING

### Intentional Dual-Access (NOT bugs)
- **VamScreen**: Accessible via `DockGrid → collections → vam` AND `search → vam` AND `InsightsHub → vam`. Intentional.
- **CashBucketsScreen / TaxVaultScreen**: Accessible via direct routes AND `CollectionsHub` AND `ReconciliationHub`. Intentional.
- **AdminInsightScreen**: Accessible via `App.tsx → admin-insight` AND `ServiceRequestMenu → admin`. Intentional.

### Shadowed / Overridden Routes
None. `case "service": case "service-request":` is intentional aliasing to the same component.

### Duplicate Functionality
None detected. All screens serve distinct purposes.

---

## SUMMARY OF FINDINGS

| Severity | Item | File | Fix |
|----------|------|------|-----|
| BROKEN | SettingsHub `"service-requests"` nav target | `SettingsHub.tsx:66` | Change id to `"service-request"` |
| DEAD | `SecurityModals.tsx` | `components/security/` | DELETE |
| DEAD | `criticalVerification.ts` | `tests/` | DELETE |
| DEAD | `transactionData.ts` | `data/` | DELETE |
| DEAD | `approvalExtensions.ts` | `data/` | DELETE |
| DEAD | `state.ts` | `mock/` | DELETE |
| DEAD | `securityHardening.ts` | `data/` | DELETE (transitively dead) |
| MINOR | Exact duplicate CommandSearch entry | `CommandSearch.tsx:98` | DELETE duplicate line |
| MINOR | Duplicate React keys in CommandSearch | `CommandSearch.tsx:232` | Use composite key |

---

All screens are wired, mounted, and reachable — EXCEPT: SettingsHub "Service Requests" card navigates to `"service-requests"` which has no matching route (should be `"service-request"`). Fix applied below.
