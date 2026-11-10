# Plan: 1Click (NEAR Intents) sponsored deposits in Equiteez

Scope: the **Equiteez UI** tickets EQ-FE-01 … EQ-FE-06 only. The standalone Bridge UI tickets (FE-01 … FE-06) and the backend tickets (BE-*) are out of scope here.
Sources: `Frontend code specification.md`, `task-1.md` … `task-6.md`, `schema.jpg`, `updated-bridge-contracts.md`, and the current code (`RDepositFundsModal`, `TransactionsProvider`, `TransactionWidgetProvider`, `EthereumProvider`, `docs/bridge-tracking.md`).

---

## 1. What the feature is (from the schema)

```
User (source wallet, any configured chain/token)
  │ 1. POST /operations {route, amount, recipient = active Mavryk account}
  ▼
Backend (maintainer wallet)
  │ - resolves the predetermined WrapForwarder address for the recipient
  │ - asks 1Click for a quote whose destination = that forwarder
  │ - SAVES the operation before replying
  │ ◄── returns { operationId, quote, 1Click depositAddress }
  ▼
User funds the 1Click deposit address  (the ONLY user signature)
  ▼
1Click swaps and sends ERC-20 to the forwarder on the bridge chain
  ▼
Backend polls 1Click, checks delivery and finality, then calls
WrapForwarderFactory.forward(recipient, token) and pays the gas itself
  → the forwarder is deployed if needed → WrapBridge.wrapToken → ERC20WrapAsked
  ▼
Existing bridge signers → Mavryk minter mints wUSDT  (asynchronous, no user action)
  ▼
The tokens show up in the user's Equiteez balance
```

What this means for the frontend:

- The user signs exactly one transaction: funding the 1Click deposit address on the source chain. There is no approval on the bridge, no `wrapToken` call and no Mavryk signature.
- The backend is the source of truth only up to **EVM WRAPPED**. Neither 1Click `SUCCESS` nor `WRAPPED` proves the tokens arrived on Mavryk. That proof comes from the existing settlement and notification data, or else from a balance update shown with neutral wording.
- Four identities must never be mixed up: the **operationId**, the **source funding hash**, the **1Click delivery hash**, and the **forward hash + log index**. Only the last one can be joined with existing bridge deposit events (`initial_tx_hash` + `initial_log_index`).

---

## 2. Current state of the code (what we reuse)

| Area | Existing piece | How 1Click uses it |
| --- | --- | --- |
| Entry UI | `app/routes/_index/components/DepositFunds/RDepositFundsModal.tsx` with tabs `bridge` / `receive` | Add a third tab/method. Keep both existing tabs unchanged. |
| Recipient | `useUserContext().userAddress` | Default recipient that can't be changed, shown clearly. |
| Source wallet | `EthereumProvider` (wagmi, `ethereum.config.ts`, **Sepolia only**) | Reuse the connect, wallet-selection and error helpers. The wagmi `chains` must be extended to every configured source chain. |
| Direct bridge | `useUsdtBridge` + `usdtBridge.contract.ts` (approve → wrapToken) | Keep it **separate**. Don't route 1Click funding through it. |
| Tracking | `TransactionsProvider` (`bridgeTransactions.ts`, storage `equiteez:bridge:v1:…`) | Add a **separate** typed record kind and store for intent operations. |
| Widget | `TransactionWidgetProvider` + `RTransactionWidgetHost` / `RTransactionWidget` (4 hardcoded step labels) | Make the step labels come from the model, and add 1Click models to the same stack. |
| Socket | `NotificationsProvider` / `useNotifierEvent` (only socket owner) | Reuse it if the backend publishes operation events there. Don't add a second socket. |
| Receipt | `UserProvider.userTokensBalances`, wallet/portfolio/activity query invalidation, `bridge_deposit_completed` notifications | Same invalidation path. Correlate only by forward hash + log index. |
| HTTP | `app/lib/apis/rwa/client.ts` (`rwaApi`, Bearer RWA token) | **Don't assume** the RWA token works on the new service. Use its own client and access adapter. |

### Contract / network change to flag (`updated-bridge-contracts.md`)

The new deployment is **Basenet ⇄ Arbitrum Sepolia**: WrapBridge `0x856c1E8a…`, mock USDT `0x5C05e82b…`, and wUSDT `KT1Wewg18Z8D…` on Mavryk. The current `app/consts/usdtBridge.ts` still points to **Ethereum Sepolia** (`0x476a30d0…`, mock USDT `0xADA0b668…`, wUSDT `KT1Pn5Zp…`).

- For 1Click, the frontend never calls the WrapBridge. The backend forwards to it. The frontend only needs the **destination Mavryk token** (wUSDT `KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE`, id/decimals to confirm) for balance and receipt display. That value comes from the route catalog and is checked against `TokensProvider`.
- Moving the **direct bridge** to Arbitrum Sepolia is a separate decision (see Open questions, item 1). If it moves, `USDT_BRIDGE`, `ethereum.config.ts`, `bridgeNetwork` storage keys and the bridge-tracking docs all change. Treat that as its own ticket. Don't mix it into the 1Click work.

---

## 3. Target architecture

```
app/consts/intents.ts                       env flags, API base URL, poll intervals, supported source chains
app/lib/apis/intents/
  intents.schema.ts                         zod schemas: Route, Quote, Operation, ErrorBody (versioned)
  intents.types.ts                          inferred types + IntentsApi interface
  intents.http.ts                           real client (own axios instance + access adapter)
  intents.mock.ts                           in-memory/sessionStorage simulator implementing IntentsApi
  index.ts                                  getIntentsApi(): picks mock | http by env
  intents.test.ts
app/lib/intents/                            pure logic, no React
  intentOperation.ts                        record type, merge (monotonic), stage mapping, terminal rules
  intentQuote.ts                            quote validity/expiry/material-change checks
  intentFunding.ts                          build native / ERC-20 transfer from executable instructions
  *.test.ts
app/providers/TransactionsProvider/
  intentOperations.ts                       storage (equiteez:intents:v1:<env>:<wallet>), restore, merge
  intentOperationsTracker.ts                status polling / socket adapter for open operations
  (TransactionsProvider exposes intent records next to bridge records; existing API unchanged)
app/providers/EthereumProvider/hooks/
  useIntentsFunding.ts                      wagmi sendTransaction / writeContract(transfer), chain switch, receipt
app/hooks/useIntentsRoutes.ts               React Query: GET /routes (+ feature flag gate)
app/hooks/useIntentsDeposit.ts              orchestrates quote → operation → funding for the modal
app/routes/_index/components/DepositFunds/components/
  IntentsView.tsx (+ .module.css)           route select, amount, recipient
  IntentsQuoteView.tsx                      quote review, expiry countdown, confirm
  IntentsStatusView.tsx                     details view sharing the widget model
docs/intents-deposits.md                    lifecycle, contracts, limitations (like docs/bridge-tracking.md)
```

Design rules (from AGENTS.md): use CSS Modules with `--r-*` tokens and the `new-r-design` skill. Any new `R*` component goes into `.codex/skills/new-r-design/SKILL.md`. Update the `AGENTS.md` project-structure section in the same PR.

### 3.1 API contract we code against (draft, to be confirmed with BE-02/BE-03)

All responses are validated with zod at the boundary. If the real API differs, only `intents.schema.ts` and `intents.http.ts` should need changes.

```ts
// GET /v1/routes
type IntentRoute = {
  id: string;
  enabled: boolean;
  source: { chainId: number; chainName: string;
            token: { address: `0x${string}` | "native"; symbol: string; decimals: number } };
  destination: { network: "basenet"; tokenAddress: string; tokenId: string; symbol: string; decimals: number };
  minAmountIn: string; maxAmountIn?: string;      // raw units, decimal strings
};

// POST /v1/quotes   (optional, preview only, not executable)
type IntentQuote = { routeId: string; amountIn: string; amountOut: string; minAmountOut: string;
                     expiresAt: string; recipient: string };

// POST /v1/operations   headers: Idempotency-Key
// body: { routeId, amountIn, recipient, sourceAddress }
type IntentOperation = {
  id: string; version: number; updatedAt: string;
  routeId: string; recipient: string; sourceAddress: string;
  amountIn: string; amountOut: string; minAmountOut: string; quoteExpiresAt: string;
  funding: { chainId: number; depositAddress: `0x${string}`; token: "native" | `0x${string}`;
             amount: string; memo?: string };                       // exact executable instructions
  status: IntentStatus;
  sourceTxHash?: string;          // reconciliation hint we sent / backend detected
  deliveryTxHash?: string;        // 1Click → forwarder
  forwardTxHash?: string; forwardLogIndex?: number;   // ERC20WrapAsked identity for joining
  refund?: { txHash?: string; reason?: string };
  error?: { code: IntentErrorCode; message: string };
};

type IntentStatus =
  | "awaiting_deposit" | "deposit_detected" | "swapping" | "delivered"   // 1Click side
  | "forwarding" | "wrapped"                                            // sponsored forward (backend authority ends here)
  | "refunded" | "expired" | "failed";

type IntentErrorCode = "sponsorship_unavailable" | "destination_busy" | "quote_expired"
  | "below_minimum" | "route_disabled" | "unauthorized" | "rate_limited" | "internal";

// POST /v1/operations/:id/deposit   { txHash }   (hint only, safe to retry)
// GET  /v1/operations/:id
```

### 3.2 Mock strategy (backend not ready)

- `IntentsApi` is a single interface. `intents.mock.ts` implements it with:
  - a static route catalog: Sepolia/Arb-Sepolia ETH (native) and mock USDT (ERC-20) → Basenet wUSDT
  - `createOperation` that honors `Idempotency-Key` (same key → same operation) and returns a dev-controlled deposit address
  - a time-based status machine (`awaiting_deposit` → … → `wrapped`), advanced after `submitDeposit`, and stored in `sessionStorage` so the reload/recovery flows can be tested
  - switches (query string `?intentsMock=refund|expire|busy|sponsorship|fail`) to force every error and terminal branch
- Selection: `INTENTS_API_MODE=mock|http` through `process.env` (Vite already `define`s `process.env`), plus a feature flag `INTENTS_DEPOSIT_ENABLED`. Production defaults: flag off, mode `http`.
- In mock mode, funding can still send a real testnet transfer to a dev-controlled address, or skip signing with a "simulate funding" dev button (only shown in mock mode), so the UI can be built without testnet funds.
- Switching to the real backend means: set `INTENTS_API` and `INTENTS_API_MODE=http`, adjust schemas if the contract differs, and run the same test suites. No UI or provider changes should be needed.

### 3.3 Operation record and lifecycle (frontend side)

```ts
type IntentRecord = {
  kind: "intent";
  localId: string;                 // created before POST; == idempotency key
  operationId?: string;            // set once backend persisted the operation
  account: string; env: string;    // scope (Mavryk wallet + INTENTS_API origin/network)
  routeId: string; recipient: string; sourceAddress: string;
  amountIn: string; amountOut?: string; minAmountOut?: string;
  funding?: IntentOperation["funding"];
  fundingState: "not_started" | "prompted" | "broadcast" | "unknown" | "rejected";
  sourceHashes: string[];          // original + replacements; never used as bridge lock hash
  hintState: "none" | "pending" | "sent" | "failed";
  backend?: IntentOperation;       // last accepted snapshot (version/updatedAt monotonic)
  receipt: "none" | "correlated" | "balance_only";
  isWidgetRequested?: boolean; announced?: boolean; sequence: number;
};
```

Rules:
1. **Persist before every irreversible step.** Save the record with `localId` before the POST. Save it again with `operationId` and funding details before showing the funding prompt. Set `fundingState = "prompted"` before calling the wallet.
2. **Never resend funds automatically.** If a reload finds a record in `prompted` or `unknown`, show "Check your wallet: did you send this?" with a link to the explorer for the deposit address. Polling `GET /operations/:id` will see the deposit anyway (`deposit_detected`). Only an explicit user action can start a *new* operation, never a re-funding of the same one.
3. **The hint is idempotent.** `POST /operations/:id/deposit` is retried with backoff. A failed hint doesn't block anything because the backend workers detect the deposit on their own.
4. **Monotonic merge.** Ignore snapshots that are older (`version` / `updatedAt`) or that move the status backwards. Terminal statuses (`refunded`, `expired`, `failed`) are final.
5. **Scope.** Storage key `equiteez:intents:v1:<encoded env>:<encoded wallet>`. Account change or logout creates a new store identity. Late wallet or HTTP responses from the old session are dropped (same `session`/`runId` guard pattern as `useUsdtBridge`).
6. **Stage mapping for the UI** (4 widget steps plus a neutral final stage):

| Backend status | Widget step / state |
| --- | --- |
| no hash yet / `awaiting_deposit` | Step 1 "Send funds" (waiting) |
| `deposit_detected`, `swapping` | Step 2 "Swapping" |
| `delivered`, `forwarding` | Step 3 "Forwarding to bridge" |
| `wrapped` | Step 4 "Bridging to Mavryk" (neutral, **not success**) |
| `wrapped` + verified receipt (forward hash+log matched to `bridge_deposit_completed` / executed backend row / 2-signer COMPLETED on that identity) | Success |
| `wrapped` without a correlation contract | Step 4 stays, with the copy "Tokens will appear in your balance shortly". The card becomes dismissible after a timeout. Never show "Success". |
| `refunded` / `expired` / `failed` | Warning card, manual dismiss, with refund/expiry details |

### 3.4 Receipt correlation (EQ-FE-05)

- Once `forwardTxHash` + `forwardLogIndex` are known, register that identity with the existing bridge store as an **external join key** (read-only). Existing `BRIDGE_DEPOSIT_UPDATED` events and `bridge_deposit_completed` notifications that carry that `initial_tx_hash`/`initial_log_index` then complete the intent card. We don't create a second card for the same deposit: the bridge record is marked as owned by the intent operation, so `toTransactionWidget` skips it.
- The source funding hash and the delivery hash are never passed into `bridgeTransactions.ts`.
- On correlated completion, run the existing invalidation (wallet/feed/portfolio/activity/notifications for that account) and show one arrival toast, guarded by the persisted `announced` marker.
- If no correlation is possible, existing balance refresh is enough. Don't infer a specific mint from a balance increase.

---

## 4. Steps (ticket by ticket)

### Step 0: Preparation (part of EQ-FE-01, about 0.5 day)
- [ ] Confirm the open questions in §6 that block contracts (route list, chains, auth adapter).
- [ ] Add `app/consts/intents.ts` and env vars `INTENTS_API`, `INTENTS_API_MODE`, `INTENTS_DEPOSIT_ENABLED`. Add them to `.env.example` if it exists.
- [ ] Write `intents.schema.ts` and `intents.types.ts` from §3.1, then `intents.mock.ts` and `intents.http.ts`, with schema and mock tests.

### EQ-FE-01: Entry and route selection (2d)
- [ ] `useIntentsRoutes` (React Query, keyed by env). Show it only when the flag is on and the catalog loaded. Handle catalog errors with a usable unavailable state.
- [ ] Add a third method to `RDepositFundsModal`'s tablist (working name **"Swap From Any Chain"**; final copy from EQ-D-02). Keep `bridge` and `receive` unchanged. The modal state stays a small `activeTab` union.
- [ ] `IntentsView`: source chain/token select, amount input (reuse the BridgeView input pattern), source balance read through wagmi for the selected chain/token, min/max validation in raw units with BigNumber, wrong-network state plus a switch button, and a recipient row showing the active Mavryk address (read-only, copyable). Show "Connect Mavryk wallet" when there is no account.
- [ ] Extend the wagmi config `chains`/`transports` with the configured source chains. The direct bridge keeps using `USDT_BRIDGE.chainId`, so the existing `isWrongNetwork` logic must stay scoped to the direct bridge.
- [ ] Access adapter in `intents.http.ts`: header strategy decided in §6 item 3. Drop responses whose request account/session no longer matches.
- [ ] Tests: the tab renders behind the flag, the existing tabs still work (extend `RDepositFundsModal.test.tsx`), and every validation state.

### EQ-FE-02: Quote review and persisted operation (2d)
- [ ] Optional preview: debounced `POST /quotes` as the amount changes, for an estimated output.
- [ ] "Review" → `IntentsQuoteView`: amount in, expected and minimum out (destination decimals), recipient, expiry countdown, route. Confirm button.
- [ ] Confirm: create `localId` (uuid) and persist it → `POST /operations` with `Idempotency-Key: localId` → persist the returned operation → only then move to funding. Double clicks are blocked by a busy ref and by idempotency.
- [ ] Invalidate the quote and go back to the form when the Mavryk account, source wallet, chain, token or amount changes, or when the quote expires. If the backend returns material changes (amountOut / minOut differ), the user confirms again.
- [ ] Error mapping: `sponsorship_unavailable`, `destination_busy` (someone else's operation is in progress for this recipient, so try later), `quote_expired`, `below_minimum`, `route_disabled`, network/5xx.
- [ ] Tests: idempotent retry returns the same operation, a stale account response is rejected, and no funding prompt appears before the operation is persisted.

### EQ-FE-03: Fund the 1Click deposit (2d)
- [ ] `useIntentsFunding`: switch to `funding.chainId`, then native `sendTransaction({to: depositAddress, value})` or ERC-20 `writeContract(transfer(depositAddress, amount))`. Values come exactly from `funding` and are never recalculated. Pre-check the balance and gas estimate.
- [ ] Set `fundingState = "prompted"` before the wallet call. Save the hash when the wallet returns it (`broadcast`), then wait for the receipt (same bounded wait as the direct bridge). Handle replacement hashes the same way: add them to `sourceHashes`.
- [ ] Send the hint `POST /operations/:id/deposit` with retries. Failures are shown as non-blocking.
- [ ] Errors: user rejected (`rejected`, a retry of the same funding is allowed because nothing was broadcast), network mismatch, disconnect, unknown result (`unknown`, no automatic retry), late responses after the account changed (dropped).
- [ ] Reuse `ethereumErrors.ts` and wallet-selection UI. Don't touch `useUsdtBridge` or `usdtBridge.contract.ts`.
- [ ] Tests: native and ERC-20 call shapes, rejection, unknown broadcast never resends, modal close during the prompt.

### EQ-FE-04: Progress and global widget (3d)
- [ ] `intentOperations.ts` store: validated restore, scoped key, monotonic merge, storage-error exposure (same pattern as `bridgeTransactions.ts`, kept as a separate module).
- [ ] `TransactionsProvider`: hold the intent map next to the bridge map and expose `intents`, `publishIntent`, `refreshIntent`. The existing context fields stay unchanged.
- [ ] Tracker: for each open (non-terminal) operation, poll `GET /operations/:id` with backoff (for example 5s, rising to 30s, paused while the tab is hidden, resumed on focus/online/pageshow), one request in flight per operation, abortable. If the backend publishes operation updates on the existing notifier channel, add a `useNotifierEvent` adapter and slow the polling down. No new socket.
- [ ] `RTransactionWidget`: accept an optional `steps` labels prop (default = current bridge labels, so existing behavior is unchanged). Update the redesign registry if the props change.
- [ ] `TransactionWidgetProvider`: map intent records to `TransactionWidgetModel` (`kind: "intent"`, composite ID `intent:<operationId>`). Reuse holds, discovery, removal and expiry (`widgetRemovals` keyed by the composite ID).
- [ ] Modal: after funding, show the submitted view → `IntentsStatusView` (same model as the widget). Minimize/close releases the hold and the card appears in the host. Reopening the modal while an operation is active shows its details instead of a new form (one canonical operation).
- [ ] Tests: minimize/reopen, route navigation, reload in every `fundingState`, duplicate/out-of-order snapshots, account switch isolation, existing bridge widget tests still pass.

### EQ-FE-05: Receipt, balances and activity (2d)
- [ ] Destination token check: route `destination` must match `TokensProvider` metadata (address/id/decimals). On a mismatch, disable the route.
- [ ] Correlation per §3.4 (forward hash + log index → existing bridge event/notification/backend row).
- [ ] When the operation reaches `wrapped` (and again on correlated completion), trigger the existing `UserProvider` balance refresh and the activity/portfolio query invalidation.
- [ ] Neutral fallback copy when there's no correlation. Persisted `announced` marker deduplicates the arrival toast across reconnects and tabs where possible.
- [ ] Tests: an unrelated deposit or balance increase doesn't complete the card, a matching completion does, other accounts are ignored.

### EQ-FE-06: Validation (2d)
- [ ] Unit and integration tests with the mock API and deterministic storage. Mounted suites use `@vitest-environment jsdom`, as the existing ones do.
- [ ] Regression: direct bridge flow, Receive tab, bridge widget, settlement notifications.
- [ ] Desktop and mobile layout of the modal and widget, keyboard/focus return on close and reopen, `aria-live` status announcements.
- [ ] With BE-09: a testnet transfer started in Equiteez against the real backend, checking the recipient balance, a single funding transaction, and truthful intermediate states.
- [ ] `docs/intents-deposits.md`, plus updates to `AGENTS.md` and the redesign registry.

---

## 5. Suggested order of work while the backend is in progress

1. Contracts and mock (§3.1, §3.2). Can start now.
2. Store, tracker and widget changes against the mock (EQ-FE-04 core). This is the riskiest part, so do it early.
3. Form, quote and funding UI (EQ-FE-01..03), using the mock and the "simulate funding" switch or a real testnet transfer.
4. Receipt correlation (EQ-FE-05) once it's confirmed which identity the backend and notifications expose.
5. Switch to `http` mode when BE-02/03/04 land, fix schema differences, then E2E with BE-09.

---

## 6. Open questions / dependencies

1. **Networks.** Is the bridge chain for 1Click delivery Arbitrum Sepolia (the new `updated-bridge-contracts.md` deployment)? Does the direct "Bridge From Ethereum" flow also move to Arb Sepolia with the new wUSDT (`KT1Wewg18…`), or does it stay on Sepolia (`KT1Pn5Zp…`)? If they differ, users see two different "USDT" balances.
2. **Testnet support for 1Click.** 1Click mostly runs on mainnet chains. Which source routes and chains will test/staging actually support? This decides what the mock catalog should copy.
3. **Auth / access adapter.** How does Equiteez authenticate with the new service (CORS origin allowlist only, the RWA JWT forwarded or exchanged, or a signed Mavryk challenge)? It affects `intents.http.ts` and whether operations can be listed per account for recovery across devices (currently not promised).
4. **Final API contract.** Field names, status enum, error codes, idempotency header, whether `version` exists, the deposit memo, and whether the quote is folded into `POST /operations`.
5. **Live updates.** Does the backend push operation updates through the existing RWA notifier channel (preferred, through `NotificationsProvider`), or is polling `GET /operations/:id` the only path?
6. **Receipt correlation.** Will the backend return `forwardTxHash` + `forwardLogIndex` (the `ERC20WrapAsked` log), and will the RWA bridge API and notifications index deposits from the **new** WrapBridge for this route? If not, EQ-FE-05 ships with neutral wording only.
7. **Design handoff (EQ-D-02/03/04).** Tab name, quote layout, step labels and widget copy for refunded/expired states.
8. **Refund address.** Where do 1Click refunds go: the source sender, or an address the user provides? It decides whether the form needs a refund-address field.
9. **Concurrency.** "Busy destination": should the UI block a second operation for the same recipient while one is open, or only show the backend error?

---

## 7. Estimate

Matches the spec: 13 working days (EQ-FE-01 2d, EQ-FE-02 2d, EQ-FE-03 2d, EQ-FE-04 3d, EQ-FE-05 2d, EQ-FE-06 2d), plus about 0.5d for mock and contract setup. That excludes the network migration of the direct bridge (open question 1) and time spent waiting on backend or design.
