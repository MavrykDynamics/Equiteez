# Bridge deposit widget implementation plan

## Objective and non-negotiable scope

Connect `BridgeDepositUpdated` updates to the existing `RTransactionWidget`, using the existing durable transaction architecture. This document records investigation of the repository on 2026-09-24; the production integration now implements this plan. Validation coverage and remaining environment limits are recorded in `docs/bridge-tracking.md`.

**Do not change DepositModal or its behavior.** In this checkout there is no component literally named `DepositModal`; the deposit UI is `app/routes/_index/components/DepositFunds/RDepositFundsModal.tsx` and its components (including `BridgeView`, `BridgeStatusView`, and `ConfirmedView`). Leave this entire modal flow, its callers, and its execution hook/contract behavior unchanged. Closing/resetting the modal must continue to have no effect on durable tracking. Do not add modal-owned subscriptions or widget side effects.

There is also no `WidgetsProvider` in this checkout. Its existing equivalent is `app/providers/TransactionsProvider/TransactionWidgetProvider.tsx`. Extend it rather than introducing or renaming a provider. Preserve the `useTransactionWidget()` API because `ConfirmedView.tsx` already consumes its error fields.

Read `AGENTS.md`, `docs/bridge-tracking.md`, and `.codex/skills/new-r-design/SKILL.md` before implementation. Read the redesign registry when extending/registering components. Follow CSS Modules, shared tokens, strict types, DRY, and existing project conventions.

## Findings and evidence limits

The socket integration, persistence, deduplication, reconciliation, and account isolation already exist. The visible widget is currently only a manual preview: `app/layouts/PageLayout/Pagelayout.tsx` renders `RTransactionWidgetPreview`, with hard-coded amount/address and state buttons. No production renderer consumes transaction state.

`docs/bridge-tracking.md` describes the backend contract but links to `../doc-not.md`, which is absent. This repository contains the frontend consumer, not the signer/notifier emitter implementation. Consequently, the exact backend publication trigger, full signer payload schema, signer state enumeration, replay guarantees, and publication frequency cannot be verified here. Do not invent these details or claim a live backend was tested. Recover the upstream contract if direct payload interpretation is required; it is not required for the conservative integration below.

The existing documentation explicitly says the authenticated wallet event is a signer update/invalidation signal. A signer's `COMPLETED` is **not** destination settlement. The authoritative display state comes from the refetched deposits endpoint. This is the correct supported interpretation of displaying the deposit state following an event.

## Relevant files and responsibilities

| File (repository-relative) | Role / planned treatment |
| --- | --- |
| `app/providers/NotificationsProvider/notifications.const.ts` | `NotifierWalletEvent.BridgeDepositUpdated = "BRIDGE_DEPOSIT_UPDATED"`; reuse unchanged. |
| `app/providers/NotificationsProvider/notifications.types.ts` | Generic event envelope; payload remains an optional unknown-valued record. |
| `app/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.ts` | Authentication, socket generations, reconnect, event-ID deduplication, auth/online/visibility cleanup; preserve. |
| `app/providers/NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket.helpers.ts` | Runtime envelope validation; preserve. |
| `app/providers/NotificationsProvider/NotificationsProvider.tsx` | Single transport/channel owner, stable handler registration, implicit wallet subscription; preserve. |
| `app/providers/NotificationsProvider/hooks/useNotifierEvent.ts`, `hooks/useNotifierChannel.ts` | Filter event type and register one stable channel callback with current handler ref; reuse. |
| `app/providers/NotificationsProvider/helpers/dispatchNotifierEvent.ts` | Isolates listener failures; preserve. |
| `app/providers/NotificationsProvider/listeners/NotificationsDataNotifierListener.tsx` | Existing wallet-wide notification-query refresh; do not add a second bridge refresh here. |
| `app/providers/NotificationsProvider/helpers/messages/wallet.messages.ts` | No bridge-event toast; keep it that way to avoid false/duplicate arrival announcements. |
| `app/lib/apis/rwa/bridge/bridge.ts`, `bridge.schema.ts`, `bridge.config.ts` | Fetch, validate, identify rows, verify deployment binding; reuse. |
| `app/providers/TransactionsProvider/TransactionsProvider.tsx` | One bridge adapter, canonical store lifecycle, settlement toast/query invalidation; preserve ownership. |
| `app/providers/TransactionsProvider/bridgeTransactions.ts` | Canonical local/backend merge, persistence, ordering and verification; reuse. |
| `app/providers/TransactionsProvider/bridgeReconciler.ts` | Single-flight fetches, recovery, bounded polling, cancellation; reuse. |
| `app/providers/TransactionsProvider/TransactionWidgetProvider.tsx` | Extend with derived widget models and presentation visibility; no transport ownership. |
| `app/providers/TransactionsProvider/components/RTransactionWidget/RTransactionWidget.tsx` | Existing presentation component; retain states and extend amount display only as needed. |
| `app/providers/TransactionsProvider/components/RTransactionWidget/RTransactionWidgetPreview.tsx` and its CSS | Replace production preview usage; remove unused preview files once references are gone. |
| `app/layouts/PageLayout/Pagelayout.tsx` | Replace the preview with one production widget host at the existing location below the header. |
| `app/root.tsx` | Already mounts providers in correct order; no provider duplication/reordering needed. |
| `app/providers/EthereumProvider/hooks/useUsdtBridge.ts` | Already publishes local progress independently of modal rendering; inspect only, leave unchanged. |

Root order is NotificationsProvider → TransactionsProvider → EthereumProvider → TransactionWidgetProvider → AppGlobalLoader → PageLayout. Canonical tracking and presentation state therefore survive routes/loading gates even if the visible host temporarily unmounts.

## Event and response contract

The validated socket envelope is:

```ts
{
  type: "event";
  event_id: string;       // nonempty transport event identity, NOT deposit identity
  event_type: "BRIDGE_DEPOSIT_UPDATED";
  occurred_at: string;    // ISO datetime with offset; not a deposit revision
  channel: "wallet";
  payload?: Record<string, unknown>;
}
```

The authenticated socket wallet is passed separately to listeners. Use that identity and the current session, never a guessed payload recipient. Do not add assumptions such as `payload.deposit`, `payload.status`, or `payload.id`.

`GET /api/v1/wallets/{wallet}/bridge/deposits` returns `{ deposits: BridgeDeposit[] }`, at most 50 recent rows, no pagination. The frontend uses its existing RWA client/base URL and 15-second request timeout. The validated projection is:

| Field | Type / interpretation |
| --- | --- |
| `evm_tx_hash`, `log_index` | Valid 32-byte hex hash, normalized lowercase; nonnegative integer log index. Together identify a backend deposit. |
| `status` | `confirming`, `signing`, `executed`, or `stalled`. |
| `chain_from`, `chain_to` | Nonempty chain-family strings; reconciliation accepts `ethereum` → `mavryk`. They do not establish network identity. |
| `updated_at` | ISO datetime; stale/conflict comparison, not a guaranteed monotonic revision. |
| `signer_count` | Nonnegative integer. |
| `signatory_threshold` | Positive integer or null; null means unknown. |
| `required_confirmations` | Nonnegative integer or null; not the observed confirmation count. |
| `reason` | Optional nullable string. |
| `amount` | Optional nullable decimal string. |
| `amount_raw` | Optional integer string. |
| `decimals` | Optional nullable nonnegative integer. |
| `token` | Optional nullable string; do not assume this always means ticker or USD value. |
| `token_evm` | Optional string. |
| `created_at` | Optional ISO datetime. |

There is no validated recipient field: `record.account` is the destination wallet because the endpoint is wallet-bound and local publication verifies recipient equality. There is no validated terminal `failed` status, destination mint transaction, or transfer-in-progress field.

Backend requests require a matching `RWA_BRIDGE_DEPLOYMENT` binding to the exact `RWA_API`, configured source chain ID, destination network, and bridge. Follow `docs/bridge-tracking.md`; never guess/configure a deployment on behalf of an operator. Without binding, surface existing reconciliation uncertainty; do not derive success from the event instead.

## End-to-end flow and ownership

1. Backend signer/notifier emits a wallet event (emission internals unavailable here).
2. Existing authenticated WebSocket receives and validates the envelope, rejects obsolete generations, deduplicates `[authenticatedWallet, event_id]` (bounded cache of 500).
3. NotificationsProvider dispatches to wallet handlers. Wallet is implicit: registering a wallet listener sends no `subscribe`/`unsubscribe` wire frame.
4. The existing single `useNotifierEvent` call in TransactionsProvider checks event type, authenticated wallet, and current store identity, then calls `reconciler.refresh()`.
5. Reconciler fetches the authoritative list, coalesces concurrent triggers, validates the response, and merges it into BridgeTransactions.
6. TransactionWidgetProvider derives presentation from canonical records; a production host renders one existing RTransactionWidget per eligible, non-dismissed deposit.
7. Store updates replace the displayed state in place. Existing TransactionsProvider settlement handling owns toasts and account-scoped query invalidation. The widget emits neither additional arrival toasts nor balance refreshes.

Do not move bridge business logic into NotificationsProvider or have it call a child widget context. No additional bridge listener is needed in NotificationsProviderListeners, the widget host, the modal, or each card.

## State mapping and precedence

Implement one pure, exhaustively typed mapper, suggested file `app/providers/TransactionsProvider/transactionWidget.helpers.ts`, with focused tests. It should return a widget view model or null for an ineligible record. Reuse `BridgeTransaction` and `RTransactionWidgetState` rather than duplicating their enums.

| Canonical evidence | Widget state | Meaning |
| --- | --- | --- |
| No backend row and no source lock hash | No widget | Approval/signature-only attempts stay in the existing modal. |
| Fresh local lock hash, lock confirmation in progress, no backend settlement | `progress`, step 1 | Lock on Ethereum. |
| Local lock confirmed but no backend row | `warning` | Source transaction confirmed; bridge settlement not yet verified. Three app confirmations are not backend finality. |
| Verified `confirming` | `progress`, step 1 | Backend source finality wait. |
| Verified `signing` | `progress`, step 2 | Validators sign. |
| Verified `executed` | `success` | Verified funds arrived on Mavryk. |
| Verified `stalled` | `warning`, title “Deposit delayed” | Use safe reason text/fallback; can recover. Never permanent failure. |
| Restored `unverified`, `stale`, or `unknown` without verified execution | `warning` | Keep last-known details; status needs verification. |
| Broadcast source hash plus `executionError`, without authoritative settlement | `warning` | Error text alone cannot distinguish receipt timeout from actual chain failure. |
| Authoritative definitive failure | `error` only if a future documented, validated contract supplies it | Not reachable from today's four API statuses. Do not add a guessed `failed` status. |

Precedence: verified executed wins over local errors and unrelated request errors; restored execution remains unverified until reconciliation. Other verified backend states win over local progress/errors; uncertainty takes precedence over nonverified progress except fresh local lock progress without an error. Global storage errors are supplemental recovery warnings, not evidence of failed settlement. Global reconciliation errors should be visible without changing an already verified success to failure.

The widget labels are “Lock on Ethereum”, “Validators Sign”, “Mint on Mavryk”, and “Transferring”. **Steps 3 and 4 have no independent evidence in the current contract. Leave them unused by this mapper.** Transition directly from signing to success when executed is verified. Reaching a signer threshold does not prove a destination transaction was broadcast. Do not advance with timers or infer mint progress from signer `COMPLETED`. If actual intermediate states or definitive failure are required later, obtain the backend contract and add runtime validation before mapping them.

Typical paths: step 1 → step 2 → success; step 1/2 → warning → success; external deposit first discovered at signing → step 2; historical execution → retained history, no new popup. Skipped stages are normal. Let existing timestamp/conflict reconciliation decide which record is current; do not impose a second numeric status ordering in presentation.

## Amount and token correctness

The current widget accepts `amount`, defaults `symbol` to `USD`, and always uses `<Money fiat>`. Backend-discovered deposits can have unknown amounts or non-USD tokens, including returning MAV-origin tokens. Do not render unknown values as zero or label a token quantity as dollars.

Derive display data once: use validated backend decimal amount, otherwise raw amount with known decimals using existing BigNumber/token helpers, otherwise a matching local amount; otherwise explicitly display “Amount unavailable”. Preserve precision, do not convert through JavaScript Number. Only resolve a symbol from verified existing token metadata or the configured local source token; use neutral “Token amount” copy when unresolved. Do not infer metadata from an arbitrary `token` string. Display token quantities without fiat formatting unless an actual USD valuation is available.

Extend RTransactionWidget's presentation props compatibly (for example an explicit token/fiat display mode and an unknown-amount representation, keeping existing defaults valid). Inspect Money and existing amount formatters before choosing the smallest extension. Keep this separate from settlement mapping. Add tests for unknown values, large/raw amounts, and non-USD tokens.

## Presentation, deduplication, and render behavior

Use TransactionWidgetProvider's canonical transaction array and existing session-scoped `dismissed`/`isOpen` state. Add derived models/visibility rather than copying deposit state into another map.

Recommended explicit behavior:

- Automatically show newly discovered active deposits, stalled deposits, and locally retained/restored pending deposits once eligible. Keep their cards visible as they reach success, until dismissed; no auto-dismiss timer.
- Do not automatically open a batch of historical executed deposits first discovered at login. Keep them available in an explicit “Show deposits” history control when records exist. A locally retained pending record becoming executed on reconnect should show its outcome.
- Maintain only the minimal session-scoped set of presentation identities needed to distinguish already-active cards from history. Record discovery for presentation before filtering dismissed items. Reset all presentation on session identity change, including logout/login to the same wallet.
- `isOpen` controls expanded visibility; newly eligible active deposits may open it. Repeated snapshots or later updates to a dismissed deposit must not reopen that deposit. A different deposit may open the host.
- Dismiss by canonical operation identity; never delete canonical records or unsubscribe. Keep a history/reopen action so dismissed tracking can be inspected deliberately.
- Render all eligible concurrent deposits in a stable order (preserve first-observed order, with operation identity as deterministic tie-breaker), rather than overwriting one global current widget.

Use canonical `operationId` for React keys. Backend identity is hash plus log index, not event ID or hash alone. Existing merging handles known replacement hashes and unambiguous backend/local joins. When an early backend-discovered `deposit:<hash>:<index>` record is adopted into a local operation ID, migrate presentation identity/dismissal using its exact backend ID; do not resurrect a dismissed card or collapse distinct logs. Do not merge ambiguous same-hash records in the presentation layer.

Use memoized derived data and stable callbacks; dismissing an already-dismissed ID or setting the same open state should return the previous state. `useNotifierChannel` already avoids registration churn via a handler ref. The store currently creates new maps/records and emits even for repeated successful snapshots (lastCheckedAt legitimately changes). Do not claim it already prevents all re-renders. Keep derivation in the provider, pass primitive/stable presentation props, and memoize card rendering when useful so timestamp-only updates do not rerender every card. Avoid broad store refactors or deep-equality frameworks for this feature.

## Subscription and cleanup strategy

Keep the existing persistent adapter throughout the authenticated session, including when no deposits are pending and after all deposits finish. Dynamic per-deposit subscriptions would miss external deposits and recovery events and cannot be justified for an implicit wallet channel.

Preserve existing behavior:

- Event listener registration cleans up on disabled channel/unmount. NotificationsProvider owns socket close/reconnect and channel reference counts.
- One reconciler request per session; triggers during a request obsolete its result and coalesce into one follow-up. Do not add widget fetch effects or intervals.
- Pending/uncertain tracking has up to 60 requests spaced 20 seconds after responses, 15-second HTTP timeout. Stalled/verified executed do not independently poll; events/reconnect/foreground/manual refresh can still update them.
- Hidden tabs stop backend requests/timers. `visibilitychange`, `online`, and `pageshow` resume reconciliation; account changes/logout/unmount abort requests and reject late session results/publications.
- Socket events invalidate API cache according to existing docs, so connected requests omit `fresh=1`; disconnected reconciliation uses it. Do not change this policy from the widget.
- Dismissal/navigation does not stop canonical tracking. Persistence retains broadcast records under account/network keys; restored rows begin unverified. Preserve unreadable storage and expose storage failures.
- Empty or capped lists do not prove failure. Omitted deposits remain retained/stale. Reorg/re-inclusion, equal-timestamp conflicts, and source replacements follow existing store rules; executed cannot regress.
- Do not add source receipt observers, signing/retry transactions, timers, or cross-tab exactly-once guarantees. Manual “Refresh status” calls existing `refresh()` only.

## Step-by-step implementation

1. Recheck the named files and current git diff. Read redesign skill/registry and applicable instructions. Confirm the existing adapter remains the only bridge listener. Do not modify the deposit modal subtree or execution behavior.
2. Add the pure state/display mapper beside TransactionWidgetProvider. Implement precedence, eligibility, supported status mapping, amount fallbacks, and unknown-state warnings. Test it before rendering integration.
3. Extend TransactionWidgetProvider additively with derived models and the presentation behavior above. Preserve transactions, error fields, lastCheckedAt, refresh, dismissed, dismiss, setIsOpen, and isOpen. Keep canonical data owned by TransactionsProvider. Test discovery, history suppression, dismissal/identity adoption, and session reset.
4. Add a thin production host, e.g. `components/RTransactionWidget/RTransactionWidgetHost.tsx`, colocated with the existing widget. Consume only the widget context; render cards, dismiss controls, status refresh, history/reopen control, and shared storage/reconciliation messages. Reuse RButton/RText/Container and CSS Modules/tokens. The host must not subscribe or fetch directly.
5. Extend the existing presentation widget only as necessary for honest amount/token display. Keep existing progress/message visuals, accessibility status announcements, and props compatible. No fabricated steps or automatic failure conversion.
6. Replace the preview import/render in `Pagelayout.tsx` with the host in the same position. Remove unused preview code/styles after checking references. Keep providers above AppGlobalLoader in root; do not mount another provider.
7. Keep NotificationsProvider, TransactionsProvider's event adapter, and settlement toast ownership unchanged unless a focused regression test demonstrates a task-related defect. Do not duplicate wallet notification-query invalidation or add per-widget toasts.
8. Run focused tests and checks below. Verify the modal subtree and execution files have no diff. Update documentation/registry as described below.

## Validation and acceptance criteria

Use existing Vitest patterns; inspect `TransactionWidgetProvider.test.tsx` (currently a mocked useState/server-render harness) and bridge fixtures before extending coverage. Do not mistake those tests for real mounted effect/lifecycle coverage.

Required cases:

- Each status/verification combination, precedence, skipped stages, stalled recovery, source confirmation vs destination execution, and no fabricated steps 3/4 or failure.
- Duplicate same event ID, distinct IDs for the same deposit, different deposits, multiple logs per hash, backend-before-local publication, replacement hash adoption, older/equal conflicting rows.
- External event creates a card without opening the deposit modal; duplicate updates update it in place; no extra listener or network subscription per card/render/open/close.
- Historical executed rows do not auto-open; active completion remains visible; dismissed cards stay dismissed through updates and identity adoption; manual history remains available.
- Reload, route/loading remount, logout, switch wallet, login to same wallet, reconnect, hidden/foreground recovery, late old-session response, listener cleanup/Strict Mode.
- Missing deployment binding, malformed/unknown API status, HTTP failure, empty/capped response, missing token metadata, unavailable storage. Preserve last-known data and show uncertainty.
- One settlement toast/query invalidation owner; widget mounting causes neither. Manual refresh never signs or resubmits.
- Mobile/desktop layout, multiple cards, long recipient/reason, keyboard-accessible dismissal/history/refresh, no overflow, amount precision and appropriate token labeling.

Run `npm run test:run -- app/providers/TransactionsProvider app/lib/apis/rwa/bridge app/providers/NotificationsProvider/helpers/dispatchNotifierEvent.test.ts` plus any new integration test paths. Run targeted ESLint on touched TypeScript, `npm run typecheck`, and `npm run build` because rendering/imports change. Report pre-existing failures separately; don't expand scope to unrelated repairs. Manually verify in a configured environment if available; document when live signer/backend verification is unavailable.

Completion means real tracked deposits drive the existing widget, the manual preview is gone, one authenticated-session bridge adapter remains, success is authoritative, lifecycle/deduplication are preserved, and DepositModal's implementation and behavior remain unchanged.

## Documentation Update

In the implementation PR:

- Update `docs/bridge-tracking.md` opening paragraph (currently says no visible widget), then document the production host, mapping table, unknown/failure limitations, amount handling, history/dismissal behavior, and verification coverage. Preserve existing deployment and recovery limitations. Flag/fix the missing `doc-not.md` link only when its actual source is available.
- Update `.codex/skills/new-r-design/REGISTRY.md` for widget prop changes and the production host as appropriate; update the widget mention in `SKILL.md` if its documented contract changes. Follow AGENTS' same-PR registry requirement.
- Update `AGENTS.md`'s TransactionsProvider structure entry if the new host/presentation convention needs documenting; no stack or script change is planned.
- Keep this plan aligned with any verified contract discoveries; label unsupported emitter details as unknown rather than filling gaps with assumptions.

## Implementation adjustment

Production token amounts use exact decimal text rather than Money: inspection found that Money rounds token amounts and has a Number conversion path. Its legacy fiat default remains compatible. The missing `doc-not.md` reference is explicitly marked unavailable in the tracking documentation; no emitter contract is inferred.

Mounted lifecycle coverage required adding jsdom as a development dependency; existing Vitest scripts remain unchanged.
