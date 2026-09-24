# Durable deposit tracking

## Contract and scope

The previously referenced API contract source, `../doc-not.md`, is absent from this checkout; signer emission details remain unverified. This implementation covers Ethereum → Mavryk deposits, including backend-discovered returning MAV-origin tokens. It includes the production deposit widget; withdrawals are not implemented.

`BRIDGE_DEPOSIT_UPDATED` arrives on the authenticated `wallet` channel. Its signer payload is **only an invalidation signal**. A signer's `COMPLETED` is not destination settlement. The adapter uses the existing validated envelope and does not interpret undocumented payload fields.

The authoritative endpoint is `GET /api/v1/wallets/{wallet}/bridge/deposits`. It is wallet-bound (403 for another wallet), unpaged, and limited to 50 recent rows. The normal cache lifetime is 20 seconds. Events retire that cache, so event reconciliation does not use `fresh=1`; requests without an authenticated socket use `fresh=1`, which the server may decline under its budget. HTTP/transport/validation errors preserve state and report uncertainty.

A backend deposit is identified by `evm_tx_hash` plus `log_index`; the local join tries known source/replacement hashes and then adopts the backend log index when unambiguous. Multiple logs sharing one hash are retained separately. A log index can change following re-inclusion. No aggregate ID is invented for list rows.

- `confirming`: source finality wait, distinct from the app's three Ethereum confirmations.
- `signing`: validators are signing; nullable thresholds remain unknown.
- `executed`: verified destination arrival, permanently protected from regression.
- `stalled`: warning, no periodic polling; socket, reconnect, foreground, and manual refresh can still advance it to `executed`.

## Required deployment binding

The API's chain-family slugs do not identify networks. Operators must explicitly assert the network pair and bridge served by the exact API deployment before reconciliation is enabled. Configure this public build-time environment variable using the actual `RWA_API` URL:

```dotenv
RWA_BRIDGE_DEPLOYMENT='{"apiUrl":"https://YOUR_API/api/v1/","sourceChainId":11155111,"destinationNetwork":"basenet","sourceBridge":"0x476a30d098eD197c2b109abaBbf5135D49df0967"}'
```

The normalized URL must equal `RWA_API`, and the pair and source bridge must match `USDT_BRIDGE`. There is no default binding. Missing/invalid/mismatched configuration disables backend requests, exposes a reconciliation error, and leaves local broadcast tracking and persistence active. This is an operator assertion, not a backend capability or cryptographic attestation. Do not configure it without verifying the deployment.

## Ownership and lifecycle

`NotificationsProvider` remains the only socket/authentication/reconnection/channel-subscription owner. Its quarantine behavior is unchanged; the supplied guide does not specify whether subscription acknowledgements are complete snapshots or deltas.

`TransactionsProvider` lives in `app/root.tsx`, below authentication/user/notifications and above `EthereumProvider`, routes, and `AppGlobalLoader`. It owns one account/network transaction map and exactly one bridge event adapter through `useNotifierEvent`. The listener stays registered even with no pending deposits and when all records are terminal.

`useUsdtBridge` publishes progress directly from the contract execution callback. It assigns a local operation ID and captures the first lock hash, later replacement hashes, amount, sender, and lock-observed time. Saving happens synchronously in that callback, before any widget effect. Local source progress/errors and backend settlement are separate fields. Modal dismissal/reset does not delete or stop broadcast tracking. The modal switches to submitted copy as soon as a lock hash is available; it no longer invalidates destination balances merely because the source lock confirmed.

`TransactionWidgetProvider` derives widget models from canonical records and owns only session-scoped discovery, ordering, open/dismissed presentation state. `useTransactionWidget()` exposes normalized transactions (including local progress and validated backend details), per-record verification, `lastCheckedAt`, `storageError`, `reconciliationError`, `refresh`, `dismiss`, and `setIsOpen`. Dismissal hides nothing from the canonical map or reconciliation. Presentation is reset by account/network session identity, including logout and login to the same wallet.

Only a refetched `executed` row produces an arrival toast. Historical terminal rows discovered at login do not toast; observed or locally retained transactions completed during a disconnect do. Terminal announcement markers persist to suppress repeats. Newly observed execution invalidates the existing wallet/feed/portfolio/activity/notification queries for that account without requesting chain-based cache bypass.

## Recovery, ordering, and cleanup

Storage key: `equiteez:bridge:v1:<encoded-network>:<encoded-wallet>`. The network includes source chain ID, destination network, and source bridge. The versioned JSON stores a map serialized as records, including all known source hashes and optional backend snapshots. Only records with broadcast lock hashes are persisted. Records are retained across dismissal and logout; there is no automatic pruning.

Restore runtime-validates the envelope, records, and scope. Every restored record starts **unverified**, including previously executed records. Cached settlement is historical evidence, not a newly verified arrival. Reads never trigger signatures, approvals, or submission. Backend reconciliation supplies current settlement after reload; the source receipt observer itself is not restarted.

Storage access, parsing, scope, and quota errors are exposed. Unreadable recovery data is preserved instead of overwritten. Write failures retain in-memory tracking and are retried on subsequent writes. Writes preserve newly added records from other tabs where observed; localStorage is not transactional, and simultaneous tab writes/announcement delivery are not exactly-once guarantees. The backend is the cross-device recovery authority.

Reconciliation runs at authenticated session initialization, authenticated socket connection/reconnection, bridge events, new local lock/replacement hashes, foreground/pageshow/online recovery, and manual refresh. Pending/uncertain records receive up to 60 sequential requests, spaced at least 20 seconds after each response, with a 15-second HTTP timeout. Budget exhaustion marks status stale and stops polling until another recovery trigger. Stalled and verified executed records do not independently schedule polls. Empty successful lists have no discovery poll; events/reconnect/foreground discover later external deposits.

Each session has one in-flight request. Triggers during a request invalidate its result and coalesce into one follow-up request. An obsolete session/generation cannot update state, toast, or invalidate queries. Hidden tabs and cleanup abort backend requests and clear scheduled polls; foreground restarts reconciliation. Account changes/logout create a new store identity and reject old execution publications as well as old backend responses.

Local progress uses a monotonic local sequence. Backend rows use `updated_at` only to reject older snapshots, not as an invented revision. Conflicting equal timestamps are kept stale, except that authoritative `executed` takes precedence. A stale row cannot demote executed. Missing rows are retained: the 50-row cap, absent signer publication, and stream retention can all cause omissions.

## Verified limitations and missing contracts

- The guide has no full socket payload schema, per-signatory sequence, replay cursor/endpoint, globally stable deposit ID independent of log re-inclusion, or monotonic snapshot revision. Events therefore only invalidate; ambiguous/equal-timestamp changes remain uncertain. An operator/backend contract is still required to establish actual deployment network isolation.
- Only the documented fields consumed by tracking are validated. `failed_signatories` element structure and complete signer payload types are unspecified and are not interpreted. Unknown amount/token metadata is never guessed.
- The available ABI contains only `wrapToken`; the guide names `ERC20WrapAsked` but does not supply its verified event signature/indexed fields. Receipt log decoding is not invented. The log index is adopted from the backend list instead.
- The installed Wagmi/Viem receipt-wait action has no abort parameter. An already-started source receipt wait may finish within its existing two-minute bound after account change; its publications and UI results are rejected. Backend requests/timers are abortable. No new signing action is allowed for a closed/stale flow.
- Unknown replacement hashes after a reload are discoverable as backend deposits, but cannot always be joined to an old local hash without a verified replacement mapping. Source aliases observed in the active session are retained.
- There is no complete history/status-by-ID fallback. Deposits absent from the bounded list remain unverified/stale. Feed-based recovery beyond that window and withdrawal tracking are not implemented.
- The API may have no live signer stack. An empty list or missing event never establishes failure or success.

## Validation

Focused Vitest suites exercise state merging, duplicates/out-of-order updates, equal-timestamp conflicts, source replacements, early discovery, concurrent deposits, dismissal/navigation presentation, reload without resubmission, reconnect/foreground gaps, scoped cleanup/late results, malformed data, storage errors, and synchronous/asynchronous notifier listener isolation. Tests use deterministic storage/transport and hook harnesses; they are not a live signer deployment or browser end-to-end verification.

## Production deposit widget

`PageLayout` renders `RTransactionWidgetHost` below the header, replacing the manual preview. The host consumes only `TransactionWidgetProvider`: it adds no listeners, fetch effects, timers, toasts, balance invalidations, or signing actions. The providers remain above routes and loading gates. The deposit modal and execution flow are unchanged.

| Evidence | Display |
| --- | --- |
| Approval/signature only, no source lock hash or backend row | No card |
| Fresh local lock confirmation in progress | Step 1, Lock on Ethereum |
| Verified `confirming` | Step 1, Lock on Ethereum |
| Verified `signing` | Step 2, Validators Sign |
| Verified `executed` | Success |
| Verified `stalled` | Deposit delayed warning; may recover |
| Source confirmed without backend verification, restored/stale/unknown records, or source execution errors | Verification warning |

Verified backend state wins over local errors. Supplemental storage/reconciliation messages do not turn verified success into failure. Steps 3/4 and terminal failure have no supported evidence and are never selected by the mapper. Socket payloads remain invalidation signals only.

Amounts use backend decimal strings, then raw quantities with known decimals (BigNumber), then matching local source amounts. Missing amounts display “Amount unavailable”; unresolved symbols display “Token amount”. The configured source token is identified by its address; arbitrary API `token` strings are not treated as tickers. Production token quantities render exact decimal text without fiat formatting or Number conversion because the existing Money component can round token quantities. Legacy widget fiat props remain supported.

Active, delayed and retained pending deposits open automatically in first-observed order. Completion stays visible until dismissal. Initially discovered executed history (including restored executed history awaiting verification) does not auto-open. “Show deposits” explicitly reopens retained history and dismissed cards; “Hide deposits” collapses the host. Dismissal never removes tracking. Repeated snapshots do not reopen dismissed cards; a newly discovered active deposit may open the host. Exact backend hash/log identity carries dismissal and ordering into an adopted local operation; different logs remain separate. Session changes reset all presentation, including logout/login to the same account.

### Widget verification

Mapper tests cover all four backend statuses across all five verification states, source confirmation versus settlement, unknown/token/raw amounts and exact precision. Presentation tests cover history suppression, active completion, dismissal, identity adoption, route/session changes and explicit history/refresh. Integration tests drive the real reconciler/store through external discovery, duplicate snapshots, multiple logs, HTTP failure, recovery and replacement adoption. Existing store/reconciler tests cover persistence, missing deployment binding, malformed responses, stale/conflicting rows, polling bounds and late-response cleanup. The original provider tests retain their mocked-state/server-render harness. Additional jsdom suites mount the real providers, event hook, host and socket hook under Strict Mode: they exercise one persistent listener, event-ID deduplication per wallet, obsolete sockets, route/loading remounts, dismissal, history, logout/login, wallet changes, late results/publications, hidden/foreground recovery, unavailable storage, refresh, and settlement side-effect ownership. jsdom is a development-only test dependency; it does not verify visual layout. Live signer delivery and mobile/desktop browser layout still require a configured browser environment.

Validation for this integration: 69 focused tests pass across 10 suites; targeted ESLint and production build pass. Full typecheck remains blocked by existing errors in assets/utils, SecretCover, IdenIcon, useMemoWithCompare, AssetTabs, codegen and the generated server-build typing used by functions/[[path]].ts; no changed-file errors remain. Browser visual/keyboard verification was attempted but no browser was available to the UI tool. Live signer/backend delivery was not tested. AGENTS.md and the local redesign skill/registry were updated, but those paths are git-ignored in this checkout.
