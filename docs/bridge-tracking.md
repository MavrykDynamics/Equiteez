# Durable deposit tracking

## Contract and scope

The API contract is documented in [`notific.md`](../notific.md); the received signer event sequence is captured in [`events.md`](../events.md). This implementation covers Ethereum → Mavryk deposits, including backend-discovered returning MAV-origin tokens. It includes the production deposit widget; withdrawals are not implemented.

`BRIDGE_DEPOSIT_UPDATED` arrives on the authenticated `wallet` channel. The validated signer fields captured in `events.md` provide immediate widget progress: two signers independently emit `PENDING`, `PROCESSING`, then `COMPLETED`. Events directly drive the production widget, without a deposits-list request or verification gate. The agreed two-signer sequence shows success after both distinct signers report `COMPLETED`. Backend settlement remains a separate field used by existing settlement notifications and cache refreshes.

The endpoint for background settlement reconciliation is `GET /api/v1/wallets/{wallet}/bridge/deposits`. It is wallet-bound (403 for another wallet), unpaged, and limited to 50 recent rows. The normal cache lifetime is 20 seconds. Events retire the server cache. Background requests with an authenticated socket omit `fresh=1`; requests without an authenticated socket use `fresh=1`, which the server may decline under its budget. Widget event handling does not request API verification. HTTP/transport/validation errors preserve backend state and expose reconciliation errors to existing context consumers; they do not affect event-driven widgets.

A backend deposit is identified by `evm_tx_hash` plus `log_index`; the local join tries known source/replacement hashes and then adopts the backend log index when unambiguous. Multiple logs sharing one hash are retained separately. A log index can change following re-inclusion. No aggregate ID is invented for list rows.

- `confirming`: source finality wait, distinct from the app's three Ethereum confirmations.
- `signing`: validators are signing; nullable thresholds remain unknown.
- `executed`: verified destination arrival, permanently protected from regression.
- `stalled`: warning, no periodic polling; reconnect, foreground, and manual refresh can still advance it to `executed`.

## API configuration

Tracking uses the existing authenticated `RWA_API` client. No separate `RWA_BRIDGE_DEPLOYMENT` assertion is required. The configured API owns wallet-scoped deposit settlement; source hashes and backend log indices join its validated rows to local operations. Deploy the frontend against the API for its bridge network.

## Ownership and lifecycle

`NotificationsProvider` remains the only socket/authentication/reconnection/channel-subscription owner. Its quarantine behavior is unchanged; the supplied guide does not specify whether subscription acknowledgements are complete snapshots or deltas.

`TransactionsProvider` lives in `app/root.tsx`, below authentication/user/notifications and above `EthereumProvider`, routes, and `AppGlobalLoader`. It owns one account/network transaction map and exactly one bridge event adapter through `useNotifierEvent`. The listener stays registered even with no pending deposits and when all records are terminal.

`useUsdtBridge` publishes progress directly from the contract execution callback. It assigns a local operation ID and captures the first lock hash, later replacement hashes, amount, sender, and lock-observed time. Saving happens synchronously in that callback, before any widget effect. Local source progress/errors and backend settlement are separate fields. Modal dismissal/reset does not delete or stop broadcast tracking. The modal switches to submitted copy as soon as a lock hash is available, then closes when a matching deposit event is observed, leaving only the global widget. Events for other source hashes do not close it. Source submission, approvals and receipt confirmation logic are unchanged.

`TransactionWidgetProvider` derives widget models from canonical records and owns only session-scoped discovery, ordering, open/dismissed presentation state. `useTransactionWidget()` exposes normalized transactions (including local progress and validated backend details), per-record verification, `lastCheckedAt`, `storageError`, `reconciliationError`, `refresh`, `dismiss`, and `setIsOpen`. Dismissal hides nothing from the canonical map or reconciliation. Presentation is reset by account/network session identity, including logout and login to the same wallet.

Only a refetched `executed` row produces an arrival toast. Historical terminal rows discovered at login do not toast; observed or locally retained transactions completed during a disconnect do. Terminal announcement markers persist to suppress repeats. Newly observed execution invalidates the existing wallet/feed/portfolio/activity/notification queries for that account without requesting chain-based cache bypass.

## Recovery, ordering, and cleanup

Storage key: `equiteez:bridge:v1:<encoded-network>:<encoded-wallet>`. The network includes source chain ID, destination network, and source bridge. The versioned JSON stores a map serialized as records, including all known source hashes and optional backend snapshots. Only records with broadcast lock hashes are persisted. Records are retained across dismissal and logout; there is no automatic pruning.

Restore runtime-validates the envelope, records, and scope. Every restored record starts **unverified**, including previously executed records. Cached settlement is historical evidence, not a newly verified arrival. Reads never trigger signatures, approvals, or submission. Backend reconciliation supplies current settlement after reload; the source receipt observer itself is not restarted.

Storage access, parsing, scope, and quota errors are exposed. Unreadable recovery data is preserved instead of overwritten. Write failures retain in-memory tracking and are retried on subsequent writes. Writes preserve newly added records from other tabs where observed; localStorage is not transactional, and simultaneous tab writes/announcement delivery are not exactly-once guarantees. The backend is the cross-device recovery authority.

Reconciliation runs at authenticated session initialization, authenticated socket connection/reconnection, new local lock/replacement hashes, foreground/pageshow/online recovery, and manual refresh. Pending/uncertain records receive up to 60 sequential requests, spaced at least 20 seconds after each response, with a 15-second HTTP timeout. Budget exhaustion marks status stale and stops polling until another recovery trigger. Stalled and verified executed records do not independently schedule polls. Empty successful lists have no discovery poll; events/reconnect/foreground discover later external deposits.

Each session has one in-flight request. Triggers during a request invalidate its result and coalesce into one follow-up request. An obsolete session/generation cannot update state, toast, or invalidate queries. Hidden tabs and cleanup abort backend requests and clear scheduled polls; foreground restarts reconciliation. Account changes/logout create a new store identity and reject old execution publications as well as old backend responses.

Local progress uses a monotonic local sequence. Backend rows use `updated_at` only to reject older snapshots, not as an invented revision. Equal-timestamp reads may refresh `signatory_threshold`, `required_confirmations`, `amount`, `decimals`, and `token`: these come from registry/storage reads rather than signer transitions. Repeated recovered metadata and restored snapshots can therefore verify normally. Other equal-timestamp changes (including status, signer count, source identity, raw amount and reason) remain conflicting and stale, except that authoritative `executed` takes precedence. Older reads are still rejected, with the existing authoritative execution exception. A stale row cannot demote executed. Missing rows are retained: the 50-row cap, absent signer publication, and stream retention can all cause omissions.

## Verified limitations and missing contracts

- The guide has no full socket payload schema, per-signatory sequence, replay cursor/endpoint, globally stable deposit ID independent of log re-inclusion, or monotonic snapshot revision. The observed signer payload projection drives widget progress; unsupported or malformed payloads are ignored without creating a card or triggering a refetch. Ambiguous/equal-timestamp lifecycle changes remain uncertain. The frontend must use the API for its configured bridge network.
- Only the documented fields consumed by tracking are validated. `failed_signatories` element structure and complete signer payload types are unspecified and are not interpreted. Unknown amount/token metadata is never guessed.
- The available ABI contains only `wrapToken`; the guide names `ERC20WrapAsked` but does not supply its verified event signature/indexed fields. Receipt log decoding is not invented. The log index is adopted from received events or backend rows.
- The installed Wagmi/Viem receipt-wait action has no abort parameter. An already-started source receipt wait may finish within its existing two-minute bound after account change; its publications and UI results are rejected. Backend requests/timers are abortable. No new signing action is allowed for a closed/stale flow.
- Unknown replacement hashes after a reload are discoverable as backend deposits, but cannot always be joined to an old local hash without a verified replacement mapping. Source aliases observed in the active session are retained.
- There is no complete history/status-by-ID fallback. Deposits absent from the bounded list remain unverified/stale. Feed-based recovery beyond that window and withdrawal tracking are not implemented.
- The API may have no live signer stack. An empty list or missing event never establishes failure or success.

## Validation

Focused Vitest suites exercise state merging, duplicates/out-of-order updates, equal-timestamp conflicts, source replacements, early discovery, concurrent deposits, dismissal/navigation presentation, reload without resubmission, reconnect/foreground gaps, scoped cleanup/late results, malformed data, storage errors, and synchronous/asynchronous notifier listener isolation. Tests use deterministic storage/transport and hook harnesses; they are not a live signer deployment or browser end-to-end verification.

## Production deposit widget

`app/root.tsx` mounts `RTransactionWidgetHost` once inside `TransactionWidgetProvider`, above route/loading gates. The host is fixed 24px from the bottom/right, with a viewport-bounded vertical stack. It renders only widgets: no tabs, cancel/dismiss controls, show/hide/history controls, refresh buttons, or storage/API verification messages. Source explorer links and recipient copying remain inside the existing widget.

Only received, validated WSS events create production widget models. Local-only progress, API rows and restored history do not create cards. The same authenticated notifier adapter updates the store synchronously; no additional socket or polling owner is introduced. API requests, failures and backend settlement cannot advance, reset or block an event-driven widget.

### Agreed event mapping

The sequence in `events.md` contains two signers. Distinct transitions advance the existing four-step widget:

| Received update | Widget |
| --- | --- |
| First signer `PENDING` | Step 1: Lock on Ethereum |
| Second signer `PENDING` | Step 2: Validators Sign |
| First signer `PROCESSING` | Step 3: Mint on Mavryk |
| Second signer `PROCESSING` | Step 4: Transferring |
| First signer `COMPLETED` | Remain on Step 4 |
| Second signer `COMPLETED` | Success / Successfully transferred |

This is the agreed presentation mapping of signer events, not separate mint/transfer events. Nonterminal progress is the number of accepted distinct transitions, capped at four; two distinct completed signers produce success. The mapper does not infer missing transitions or wait for an API threshold.

`initial_tx_hash` plus `initial_log_index` identifies the deposit. Repeated updates for the same signer/status are ignored even if event ID or timestamp differs. Older timestamps and regressive statuses for the same signer are ignored. Different signers can advance at the same timestamp. Accepted transitions are retained in arrival order for the session. Both signers update one card; other hashes/logs remain separate. Late local adoption retains the canonical hash/log React key and the existing DOM card.

Event amounts use the configured token address and known decimals (the captured raw amount becomes `1.5 USDT`). Unknown tokens remain unscaled and labelled raw units. Amounts render exact decimal text without fiat formatting or Number conversion. Event amounts and source links remain authoritative even when API rows arrive later.

Widgets remain visible through route/loading remounts and completion, with no expiry timer. Existing presentation context methods remain available for compatibility, but the host exposes no presentation controls. Logout/account changes reset session presentation. Restored signer history is not replayed as live evidence; a new live event is required to show a widget after reload.

### Validation

Focused tests replay the six-event sequence through mounted providers and the real notifier hook, checking Steps 1–4, first-completion waiting, second-completion success, stable DOM identity, duplicates with new IDs/timestamps, stale updates, concurrent logs, API failure isolation, local adoption, route remounts, account changes and listener cleanup. Popup tests check matching-event handoff and isolation from other deposits. Existing backend reconciliation and execution tests cover their separate responsibilities. Tests use deterministic storage/transport; no live wallet transaction is submitted.
