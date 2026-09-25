# Bridge widget Pending-view investigation

Date: 2026-09-25. Scope: current frontend, `notific.md`, `AGENTS.md`, and relevant bridge/notification documentation. Investigation only; no implementation or configuration changes.

## Findings

**The strongest concrete finding is missing local deployment binding, followed by an intentional presentation transition.** `RWA_BRIDGE_DEPLOYMENT` is absent/empty in this checkout's `.env`, `.dev.vars`, and current shell environment. The reconciler therefore refuses to request the authoritative deposit list. Once the local Ethereum lock reaches three confirmations, the widget stops selecting step 1 and selects the warning message **“Confirmation pending”**. Valid socket events cannot overcome that configuration gate.

This sequence was reproduced with the existing store, reconciler and mapper, using synthetic deposits and in-memory storage. It explains the reported behavior for a build with the inspected configuration. It does **not** prove that the user's running deployment has the same environment: no live browser state, WebSocket capture, affected transaction, authenticated deposits response, or deployed build configuration was supplied or inspected.

The notification contract does **not** require mapping a signer's `PENDING` directly to a widget Pending view. The current adapter does not read signer status at all, correctly following `notific.md` §3. There is no evidence here of an incorrect live notification payload.

A second, independently reproduced issue is overly broad equal-timestamp conflict handling: recovered metadata can make a still-valid deposit remain `stale` and therefore show the warning view. This is a credible secondary cause, not an established fact about the reported transaction.

## 1. Current notification → widget flow

```text
Ethereum execution callback                     Authenticated wallet socket
        │                                                   │
withBridgeProgress → publish                validate envelope, deduplicate event ID
        │                                                   │
        │                                      dispatch wallet-channel listeners
        │                                                   │
        │                                 filter BRIDGE_DEPOSIT_UPDATED + wallet
        │                                                   │
        │                                         reconciler.refresh()
        │                                                   │
        │                               active/current session + deployment binding
        │                                                   │
        │                                  GET /wallets/{wallet}/bridge/deposits
        │                                                   │
        │                                     validate entire response with Zod
        │                                                   │
        └────────────── BridgeTransactions ← reconcile authoritative rows
                                  │
                          useSyncExternalStore
                                  │
                      TransactionWidgetProvider
                                  │
                       toTransactionWidget(record)
                                  │
                   RTransactionWidgetHost → RTransactionWidget
```

- `app/root.tsx:154` mounts NotificationsProvider → TransactionsProvider → EthereumProvider → TransactionWidgetProvider above the global loading gate. Navigation, loading and modal closure do not own tracking.
- `useUsdtBridge` publishes local progress independently of modal rendering. `withBridgeProgress` records source hashes; `BridgeTransactions.update()` persists broadcast records synchronously. Source lock confirmation and destination settlement are separate fields.
- `TransactionsProvider.tsx:157` has the only bridge-specific event adapter. It checks the authenticated socket wallet and current store identity, then calls `refresh()`. It deliberately ignores `_frame` payload contents.
- `bridgeReconciler.ts:50` first requires an active, current session and a valid deployment binding. It then fetches and reconciles the list; there is no widget-owned API request.
- Backend identity is normalized Ethereum transaction hash **plus log index**. Local operations retain their own operation ID; unambiguous source/replacement hashes allow joining a backend row to a local record.
- Widget models derive from the canonical records. Discovery, history, dismissal and `isOpen` decide visibility, not settlement. The host passes state to the existing card; it adds no subscriptions or settlement side effects.

Source files are under `app/providers/TransactionsProvider/` unless otherwise specified.

## 2. What events and states are received

### Documented inputs versus observed evidence

`notific.md` is an API description, not a capture of this user's transaction. It documents:

| Surface | Documented input | Frontend treatment |
| --- | --- | --- |
| Wallet socket | `BRIDGE_DEPOSIT_UPDATED`, per signatory; signer vocabulary includes `PENDING`, `COMPLETED`, `FAILED`, `TIMED_OUT`, `REORGED` | Invalidate/refetch deposits; never directly set settlement |
| Deposits list | `confirming`, `signing`, `executed`, `stalled` | Validate, reconcile, then derive card state |
| Notification inbox | `bridge_deposit_completed`, `bridge_deposit_stalled` | Notification list/badge data; not widget progress input |
| Transfer feed | Executed movement without a transfer status | Not consumed as widget settlement evidence |
| Token notification | Bridge-in does not publish `TOKEN_LEDGER_TRANSFER` | Widget correctly does not depend on it |
| Balance updates | Secondary arrival signal according to the guide | Not used to promote this widget to success |

The guide does not enumerate every intermediate signer status or supply a complete machine-readable socket payload schema. In particular, a signatory's `COMPLETED` means its signature landed, not that the deposit minted. Different signatories may disagree without changing the aggregate deposit's successful outcome.

**Live events actually received for the reported deposit remain unknown.** The evidence from this investigation is source inspection, existing mocked lifecycle tests, and deterministic synthetic reproduction. No live socket or API response is claimed.

### Frontend socket contract

`useNotifierSocket.helpers.ts` accepts a JSON string containing:

```ts
{
  type: "event",
  event_id: nonemptyString,
  event_type: nonemptyString,
  occurred_at: isoDatetimeWithOffset,
  channel: nonemptyString,
  payload?: Record<string, unknown>
}
```

The bridge adapter additionally needs `channel === "wallet"`, `event_type === "BRIDGE_DEPOSIT_UPDATED"`, and the authenticated socket wallet to match the active Mavryk account. The payload may be absent. There is no requirement for `payload.deposit`, a lowercase deposit status, a recipient, or a particular signer ID.

Malformed envelopes are rejected with a warning. Unknown event types pass envelope validation but do not pass the bridge-event filter. A structurally valid signer payload containing `PENDING` or `COMPLETED` is expected and is not a status-mapping error.

## 3. What the widget expects

There is no separate top-level `pending` status in `RTransactionWidgetState`. The reported Pending view most likely refers to the warning/message branch whose default title is **“Confirmation pending”** (`RTransactionWidget.tsx:151`). The step list renders only when `state.status === "progress"` (`:88`). Individual future steps also use the CSS status `pending`; that is different from replacing the whole card with the warning view.

`transactionWidget.helpers.ts:17` applies this precedence:

| Canonical evidence | Card |
| --- | --- |
| No backend row and no source lock hash | No card |
| Verified backend `confirming` | Progress, step 1: Lock on Ethereum |
| Verified backend `signing` | Progress, step 2: Validators Sign |
| Verified backend `executed` | Success |
| Verified backend `stalled` | Warning: Deposit delayed |
| No verified backend, verification `local`, lock `confirming`, no execution error | Progress, step 1 |
| Local lock `confirmed`, with no verified backend state | Warning: Confirmation pending |
| Restored `unverified`, `unknown`, `stale`, or source error without overriding verified backend evidence | Warning: Confirmation pending |

Verified backend evidence takes precedence over local progress/errors. Reconciliation errors preserve verified success. Restored success starts unverified, so opening that history before successful reconciliation shows a warning.

The mapper **never selects steps 3 or 4** (“Mint on Mavryk”, “Transferring”). The documented API has no separate states proving those phases. It transitions directly from signing to success; a skipped signing stage is normal because the guide says signing often lasts only 5–20 seconds. No validated terminal `failed` deposit status exists.

## 4. Why Pending appears instead of steps

### A. Confirmed local configuration blocker

The three inspected environment sources contain no `RWA_BRIDGE_DEPLOYMENT`; `.env` does contain `RWA_API`. No secrets or environment values were printed in this investigation.

`TransactionsProvider.tsx:115` passes these values to `hasBridgeDeploymentBinding()`. That helper requires valid JSON with:

- `apiUrl` matching the normalized configured `RWA_API` URL;
- source chain ID `11155111`;
- destination network exactly `basenet`;
- source bridge matching `USDT_BRIDGE.address`.

The source bridge and token configuration agree with the addresses and network pair in `notific.md`. The user's description “our main chain” must not become the literal network value `mainnet`; this integration expects `basenet`.

Without binding, `refresh()` sets this message and returns **before any fetch or polling is started**:

> Backend settlement is unverified: the API deployment has no matching bridge network binding.

This applies equally to initialization, manual refresh and notification-triggered refresh. Seeing working bell notifications or a connected socket does not imply deposit-list reconciliation is enabled. The socket URL is derived from `RWA_API`; it does not require this bridge binding.

`vite.config.ts:62` defines `process.env` for the frontend build. Verify the value available to the actual build/dev process, not just a server runtime variable added after a bundle was built. The binding is captured when the session's reconciler is constructed, not dynamically reread on every event.

### B. Deterministic transition after the source lock

`confirmUsdtBridgeTransaction()` publishes lock `confirming`, then lock `confirmed` after the application's three confirmations. `notific.md` §2 distinguishes that from the signer's approximately 12 Sepolia-block finality wait.

Reproduction using current code:

| Action | Fetch calls with binding disabled | Widget result |
| --- | --- | --- |
| Publish local lock `confirming`; start reconciler | 0 | Progress, step 1 |
| Publish local lock `confirmed`; request event-equivalent refresh | 0 | Warning: “Source transaction confirmed. Bridge settlement has not yet been verified.” |
| Independently reconcile validated `confirming` fixture | Not a network call | Progress, step 1 |
| Reconcile validated `signing` fixture | Not a network call | Progress, step 2 |
| Reconcile validated `executed` fixture | Not a network call | Success |

Thus the mapper works for verified list states. It intentionally shows uncertainty once local confirmation finishes without authoritative backend data. With the inspected missing binding, that uncertainty cannot resolve through notifications. If the host becomes visible only after source confirmations, the brief initial step view may never be seen.

Even with valid configuration, a temporary gap before the list contains the deposit produces this same warning. If funds have actually arrived but the list is never fetched, remains empty, or excludes that deposit, the widget has no feed/balance fallback to learn arrival.

### C. Other paths to the same message

- HTTP errors, timeout, authorization failure, or response-validation failure retain records and expose a generic reconciliation error. A previously verified nonterminal record becomes stale and loses its steps.
- The entire deposits response is parsed before merging. One malformed row can prevent all rows in that response from updating. Unknown status, wrong numeric/null types or invalid dates/hashes are examples; none was observed from a live API here.
- Rows are accepted only for `ethereum` → `mavryk`. These are family slugs, as documented; `sepolia` → `basenet` would be ignored rather than establish the expected row. No evidence shows the actual API sends those unexpected slugs.
- Reload restores records as unverified. Empty/bounded responses retain missing records rather than declare success or failure. The guide explicitly permits missing old/unpublished deposits.
- Hidden tabs suspend requests. Polling stops after 60 sequential attempts, spaced 20 seconds after responses. Events/reconnect/foreground/manual refresh restart recovery when configuration permits it.
- Source timeout/error yields a warning, not an invented permanent failure.

## 5. Event handling, races and side effects

### Correct protections found

- Exactly one bridge-specific `useNotifierEvent` adapter remains active throughout an authenticated session. Other wallet listeners serve inbox/account features; they are not additional bridge-list adapters.
- Wallet is an implicit channel: registering cards/listeners does not send wallet subscribe/unsubscribe frames. Explicit-channel quarantine does not block wallet delivery.
- Socket generation checks reject obsolete sockets. Event deduplication uses `[authenticatedWallet, event_id]` with a bounded cache of 500 IDs, not transaction hash or deposit identity. Distinct signatory events for one deposit can therefore refresh it independently.
- The channel hook maintains a current handler ref and cleans up registration. Card renders, dismissal and host remounts do not re-register the bridge adapter.
- Listener failures are isolated; a failing unrelated listener does not stop bridge dispatch.
- Reconciliation is single-flight. Events during an in-flight fetch invalidate that response and coalesce into a follow-up; old session responses/publications are rejected. Known replacements and unambiguous early backend discovery are joined without using socket event IDs as deposit IDs.
- Canonical success is protected from regression. Dismissal hides presentation only. Persistence/account separation and cleanup are covered by existing tests.
- The widget itself neither toasts nor invalidates balances. TransactionsProvider owns settlement effects, driven by authoritative rows and persisted announcement markers.

These findings support correct handling of the normal flow; they do **not** establish absence of all possible side effects.

### Reproduced secondary stale-state issue

`bridgeTransactions.ts:271` compares the **entire validated backend row** when `updated_at` is equal. Any difference, except an incoming `executed`, marks the previous nonterminal record stale and keeps its previous backend snapshot.

`notific.md` says `updated_at` is the last signer transition, while `signatory_threshold` may be null when storage cannot be read. It is therefore plausible for a subsequent read to recover threshold metadata without a newer signer timestamp.

Synthetic reproduction:

1. Accept verified `signing`, threshold null, timestamp T → step 2.
2. Read `signing`, threshold 2, the same timestamp T → stale → Confirmation pending.
3. Repeat that identical recovered response → still stale, because it is compared against the retained threshold-null snapshot again.
4. An accepted newer snapshot, or authoritative execution under the existing precedence rules, can recover the card.

This is an over-conservative conflict rule relative to non-revision metadata. The blanket Pending description can also be misleading: when local lock progress is `confirmed`, it says settlement has not yet been verified even if signing had previously been verified and only metadata freshness became uncertain.

### Remaining risks and limits

- A sustained stream of events arriving before every fetch resolves can repeatedly obsolete successful results. Coalescing limits concurrency, but cannot guarantee progress under continuous invalidation. No live evidence establishes this condition.
- An empty successful list with no tracked pending deposits does not schedule discovery polling. If a later external deposit has no delivered event, it will be discovered only on another recovery trigger. This is compatible with the documented signer-dark limitation.
- Stalled records do not independently poll, including after a later request error makes their verification stale; they need an external recovery trigger.
- Wallet inbox queries are invalidated on wallet events, and execution can invalidate them again through the settlement owner. This is possible redundant query work, not duplicate bridge tracking or a reason for Pending.
- A replayed event may be suppressed while its ID remains cached; reconnect reconciliation supplies recovery. Old IDs can reappear after eviction and cause extra refetches. Neither provides cross-tab exactly-once delivery.
- HTTP/validation failures are collapsed into one generic message, limiting diagnosis without a captured response. Tests use mocked transport; they cannot establish live signer delivery, network binding or backend correctness.

## 6. Agreement with `notific.md`

| Requirement | Assessment |
| --- | --- |
| Frames invalidate; list determines aggregate state | Correct |
| Signer `COMPLETED` is not mint success | Correct; payload status is ignored |
| Connected refresh omits `fresh=1`; disconnected refresh requests it | Correct |
| Success only from executed data; refresh feed/portfolio/summary | Implemented; historical execution suppresses the arrival toast |
| Recover external deposits and concurrent operations | Implemented, subject to list availability and configured binding |
| Distinguish three local confirmations from bridge finality | Correct, but fallback UX becomes a warning rather than steps |
| Display confirming wait, target and estimated time | Partial: step 1 is labelled “Lock on Ethereum”; target and “usually 3–5 minutes” are not displayed |
| Display validators `n/N`, unknown threshold as `n/?` | Missing from card model/rendering despite validated API fields |
| Stalled reason, failure details and explorer link | Reason is displayed; no source explorer link or `failed_signatories` details |
| Unregistered amount: show `amount_raw` unscaled | Different: without decimals or matching local amount, card says “Amount unavailable” |
| Extract `ERC20WrapAsked` log index locally | Not implemented; backend log adoption is used because the available ABI lacks that event definition |
| Treat `updated_at` as last signer transition | Equal-timestamp whole-row conflict detection can reject legitimate metadata recovery |

The deployment-binding gate is a frontend requirement documented in `docs/bridge-tracking.md`, not a notification status supplied by the API. It protects network identity because family slugs do not identify a deployment. Removing it blindly is not a sound fix.

The tracking document still refers to the missing former contract source `doc-not.md`; the newly supplied `notific.md` now resolves several descriptive gaps. It should become the referenced contract documentation in a future implementation/documentation change.

## 7. Root cause and conceptual fixes

**Confirmed mechanism:** missing verified backend evidence plus local lock `confirmed` selects the Pending warning by design. **Confirmed local blocker:** absent bridge deployment binding prevents acquiring that evidence. **Incident attribution:** high-confidence explanation for this checkout's configuration, conditional for the user's actual running build until its binding and requests are inspected. Incorrect signer payloads are not required and have not been demonstrated.

Recommended order, without implementing changes:

1. Verify the actual API deployment serves Sepolia → MVRK Basenet and the configured bridge. Supply the correct binding to the frontend build environment, rebuild/restart as appropriate, and verify the deployed client issues deposit-list requests. Do not guess the API identity or change `basenet` to `mainnet`.
2. For the affected source hash, correlate a wallet frame, its subsequent list response, and the canonical record's `backend.status`, `verification`, `progress`, and reconciliation error. No request points to gating/session/visibility; a failed response points to HTTP/auth/schema; an absent row points to publication/retention/join; a present stale row points to reconciliation. Capture only necessary fields, without credentials.
3. Preserve invalidation-only socket handling. Do not map `payload.status === PENDING` to a widget state or `COMPLETED` to success. Do not add another subscription or depend on `TOKEN_LEDGER_TRANSFER` for a mint.
4. Clarify the source-to-bridge handoff in presentation. A verified `confirming` row should communicate “Waiting for the bridge” while retaining an honest step indicator. For local confirmation without a backend row, any persistent step-style presentation must explicitly say status is unverified; it must not claim validators have started. Configuration/transport problems should remain visible.
5. Separate harmless metadata recovery from conflicting lifecycle evidence in reconciliation. Preserve execution protection and conservative handling of real conflicts; do not treat every same-timestamp metadata difference as a permanently stale deposit. Obtain a documented revision rule if stronger ordering is needed.
6. Add the documented signer counts, nullable target handling and explorer/reason details. Align unknown raw-amount handling with the guide. Do not fabricate steps 3/4 or terminal deposit failure states to fill visual gaps.
7. In a future fix, add focused regression coverage for same-timestamp metadata recovery, and validate the full configured sequence in a real environment: source lock → list confirming → optional signing → executed. Keep missing-binding and uncertainty tests; their current warning behavior is intentional.

## Validation and change boundary

Executed the existing focused suites:

```sh
npm run test:run -- app/providers/TransactionsProvider app/lib/apis/rwa/bridge app/providers/NotificationsProvider/helpers/dispatchNotifierEvent.test.ts
```

**69 tests passed across 10 suites**, including mounted Strict Mode listener/session tests and socket deduplication tests. Existing tests cover the intentional local-confirmed warning and disabled requests without binding; passing them does not establish that configuration is correct in a deployment.

Additionally executed the existing modules in an ephemeral Vite SSR loader with synthetic fixtures to reproduce the binding gate, mapper transitions and equal-timestamp metadata conflict. A sandbox WebSocket-listen warning occurred while the loader initialized; module execution completed and returned the results above. No authenticated network requests or transactions were made. `docs/endpoint.png` describes the assets endpoint, not bridge-event evidence.

Only this report, `widget.md`, was created. Application code, tests, configuration, modal behavior and existing documentation were not modified.
