# 1Click (NEAR Intents) deposits

"Send From Any Network" is the deposit flow of Deposit Funds (next to
"Receive On Mavryk"; the direct "Bridge From Ethereum" UI was removed). It
lets an Equiteez user pay from a configured source chain/token and receive
wUSDT on Mavryk Basenet. The user
signs **one** transaction: funding the 1Click deposit address. The shared
Mavryk Bridge ETH backend then sponsors the forward into the existing
WrapBridge, the bridge signers mint on Mavryk, and the backend verifies the
mint. Everything happens inside Equiteez; nothing links to the standalone
bridge.

Contract: [`near-intents/backend.md`](../near-intents/backend.md) (runtime
v0.0.6, API schema 0.1.0, prefix `/v1`; interactive reference at `GET /docs`,
there is no `/openapi.json` any more). Tickets:
`near-intents/task-1.md` … `task-6.md`. The direct bridge is documented in
[`bridge-tracking.md`](bridge-tracking.md) and is unchanged by this feature.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `INTENTS_API` | — | Required. Backend origin (`https://basenet.bridge-api.mavryk.network`) or `/intents-api` with the dev proxy. |
| `INTENTS_API_PROXY_TARGET` | — | Dev only: Vite proxies `/intents-api/*` here (the Gateway CORS allowlist has no localhost). |
| `INTENTS_ENV` | origin of the API | Scope of persisted operations; override only if two URLs are the same backend. |
| `INTENTS_API_MODE` | `http` | `mock` uses the in-browser simulator. |
| `INTENTS_MOCK_DEPOSIT_ADDRESS` | `0x…dEaD` | Testnet address the mock asks the wallet to fund. |
| `INTENTS_SEPOLIA_RPC_URL` | public | RPC for the Sepolia source chain. |

### Routes and asset metadata

`GET /v1/routes` is the technical route contract (limits, decimals, bridge
and factory). `GET /v1/metadata` describes each route version's assets: the
source token the wallet transfers (`kind`, `contractAddress`, `symbol`,
`decimals`), the settlement ERC-20, the destination FA2, the `mode` and
whether connected-wallet hash registration is supported. Both are fetched
together and joined on `routeId` + `routeVersion`. There is no hand-written
source-asset list: a route without metadata is never guessed from a ticker.

A route is enabled only when:

1. it is `enabled` and metadata has `admissionPaused: false`;
2. its `settlementChainId` + `bridgeAddress` + `settlementToken` match a pair
   in `INTENTS_BRIDGE_PAIRS` (today: Arbitrum Sepolia mock USDT → Basenet
   wUSDT `KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE`), with matching decimals;
3. its metadata source asset matches `originAsset`, chain and decimals, and
   the metadata settlement/destination assets match the route and the pair;
4. its `mode` is one Equiteez can price without a quote preview
   (`INTENTS_EXACT_PARITY_MODES`, today only `rehearsal`). Provider routes
   show "Quotes for this route are not available" until
   `POST /v1/quotes/preview` is integrated;
5. a rehearsal route has `depositRegistrationSupported: true` (literal);
6. the source chain has a wagmi funding adapter (`INTENTS_SOURCE_CHAINS`).

On Basenet this is `basenet-rehearsal-k8s`: exactly 1 Mock USDT
(`0x5c05e82b…`, 18 decimals) on Arbitrum Sepolia, 0 slippage, accepted
minimum 1e18, 1 wUSDT minted. A route with `minAmountIn = maxAmountIn`
prefills and locks the amount; `maxSlippageBps: 0` shows "0% (fixed)".

### Mock backend

`app/lib/apis/intents/intents.mock.ts` implements the same contract: three
routes with metadata mirroring Basenet (Arbitrum Sepolia USDT as a fixed
1-token `rehearsal` with registration; Sepolia ETH as a provider route, shown
as needing a preview; Base Sepolia USDC without metadata), capability-scoped
idempotent `POST /operations` (replay, `IDEMPOTENCY_CONFLICT`, foreign
capability → 404, `REHEARSAL_SCOPE_MISMATCH`), `PREPARING_QUOTE` → published
1:1 instructions after 1.5s, `POST /operations/:id/deposit` (first call
`REHEARSAL_RECEIPT_PENDING` with `Retry-After: 3s`, then accepted; replay;
another hash → `REHEARSAL_DELIVERY_CONFLICT`), and after the accepted
registration: OBSERVED +0s,
SWAP_IN_PROGRESS +3s, VERIFYING_DELIVERY +8s, DELIVERY_VERIFIED +12s,
FORWARDING +16s, WRAPPED (settlement PENDING) +22s, settlement CONFIRMED +32s.
State is kept in `sessionStorage`. Force branches with
`?intentsMock=reject|expire|paused|unavailable|refund|incomplete|review|untracked|registrationConflict`.
In mock mode the funding step also offers **Simulate Funding** (a fake hash
that goes through registration like a real one).

## Code map

| Concern | Location |
| --- | --- |
| Contract (zod), HTTP client, mock | `app/lib/apis/intents/` |
| Capability + idempotency key generation | `app/lib/intents/intentCapability.ts` |
| Route + metadata resolution, amount/slippage/recipient checks | `app/lib/intents/intentRoute.ts` |
| Accepted-minimum estimate, request key, error copy | `app/lib/intents/intentQuote.ts` |
| Record model, merge, closure/receipt/mismatch rules | `app/lib/intents/intentOperation.ts` |
| Funding call shape and error classification | `app/lib/intents/intentFunding.ts` |
| Wallet funding (re-read + wagmi actions) | `app/contracts/intentsFunding.contract.ts`, `useIntentsFunding` |
| Persisted store, tracker (GET polling + hash registration), widget mapping, receipts | `app/providers/TransactionsProvider/intent*.ts` |
| Modal orchestration | `app/hooks/useIntentsDeposit.ts`, `useIntentsRoutes.ts` |
| Modal shell, step and picker state | `DepositFunds/RDepositFundsModal.tsx` |
| Views | `DepositFunds/components/Intents{View,WalletsStep,DetailsStep,PickerView,QuoteView,FundingPanel,StatusView}.tsx` |
| Network/token grouping for the pickers | `DepositFunds/components/intentPickers.ts` |
| Shared screen parts (header, transfer summary, rows, dots loader) | `DepositFunds/components/DepositParts.tsx`, `depositSteps.ts` |
| Network/token logos (lettered fallback otherwise) | `app/lib/intents/intentAssetIcon.ts` |
| Shared redesign components | `RAmountInput`, `RSelectField`, `RSelectList`, `RTokenIcon` |

## Screens

The UI follows the Figma "NEAR Intents · Send flow — Variant B". It changes
presentation only; every phase and funding state below keeps its logic.

| Screen | Shows |
| --- | --- |
| Wallets (step 1) | External wallet (connect via `REthereumWalletDropdown`, or Disconnect) and the Equiteez account; Continue needs both. Always shown first. |
| Deposit details (step 2) | From → To, "Token to receive" (display-only while there is one destination), Network, amount (`RAmountInput`), estimate card (You receive ≈, Minimum received, network fee tooltip, slippage chips from `getIntentSlippageChoices`; no custom value, no estimated time). |
| Network / token pickers | Replace the modal content. Networks are the catalog grouped by `sourceChainId`; tokens are that chain's routes with per-route wallet balances. Unavailable routes are listed with their reason. No USD values or network totals (no price source). |
| Review | One layout for `review`, `creating`, preparing the quote and the funding instructions (deposit address, "Send within" countdown, operation ID). Funding states map to Send / "Confirm in your wallet" / Sending; paused, mismatch, unknown and reverted are alerts. |
| Status | The four widget steps as a vertical stepper, alerts for warning/error states, identifiers under "Transaction details", View on explorer, New deposit (while running) or Done. |

## Access

- Routes and metadata are public. Operation calls (create, read, register) send
  `Authorization: Bearer <capability>`: 32 random bytes, base64url without
  padding, generated for every new operation (there is no pre-approved
  scope any more). The RWA token and cookies are never
  sent. Only `Authorization`, `Content-Type` and `Idempotency-Key` are sent,
  which is what the Gateway allows.
- The capability, `Idempotency-Key` (UUID) and the exact request body are
  persisted **before** the first POST and reused for every retry. Only a
  definitive 4xx (nothing created) leads to a fresh scope.
- The capability is the only way to read the operation again. It lives in
  the account/backend-scoped localStorage record and is never logged,
  put in URLs or shown. Axios errors are never rethrown (their config holds
  the header).

## Lifecycle

1. **Form.** Route, amount (raw units against inclusive min/max and balance),
   slippage (choices up to the route's `maxSlippageBps`), the active Equiteez
   account as the fixed recipient (`mv1` only), and the source wallet as the
   refund address.
2. **Review (local).** Shows the request, including the **minimum you
   accept**. There is no quote preview: on exact-parity (rehearsal) routes it
   is `amountIn` converted 1:1 to settlement units × (1 − slippage), rounded
   down to six-decimal FA2 precision, and must be at least the route's
   `minAmountOut` (on Basenet: exactly 1e18).
3. **Confirm.** Save the record, then `POST /v1/operations` → 202. The
   response must echo the request or it is never funded. The operation starts
   at `PREPARING_QUOTE` with no instructions.
4. **Quote.** The tracker polls `GET /v1/operations/:id`. Funding is offered
   only for `fundingStatus: AVAILABLE` with instructions that match the route
   (chain, `originAsset`, exact amount, no memo,
   `bridgeableMinAmountOut ≥ acceptedMinAmountOut`). `QUOTE_REJECTED` or
   expiry before funding returns to the form; `PAUSED` shows a notice.
5. **Fund.** Re-read the operation right before signing; the quote must be
   the one shown (same `quoteId`) and at least 15s from `fundingExpiresAt`.
   `fundingState = "prompted"` is saved before the wallet call; then a native
   transfer or ERC-20 `transfer` goes to `depositAddress` (never
   `forwarderAddress`; in the rehearsal it is the recipient's verified
   forwarder) for the exact amount.
6. **Register.** On routes with `depositRegistrationSupported`, the hash is
   saved as `registration: pending` in the same write as the broadcast. The
   tracker sends `POST /v1/operations/:id/deposit {transactionHash}` with the
   capability (no idempotency key) right away and after every reload.
   `REHEARSAL_RECEIPT_PENDING`, `REHEARSAL_RPC_UNAVAILABLE`, 429, 5xx, network
   errors and lost responses resend the **same hash** after
   `Retry-After` or 15s, doubling to 60s, with no attempt limit; the wallet is
   never asked again. A repriced replacement takes over while pending; a
   cancelled one stops registration. `REHEARSAL_DELIVERY_MISMATCH`,
   `REHEARSAL_DELIVERY_CONFLICT`, a generic 409 or a 4xx validation error
   stop it for good. Acceptance triggers an immediate GET.
7. **Track.** The modal switches to the status view; the global widget shows
   the same model.

### Never sending twice

Only `not_started` and `rejected` (declined in the wallet) allow a wallet
request. `prompted`, `broadcast`, `confirmed`, `unknown` and `reverted` never
prompt again, and `fundingStatus: OBSERVED` hides the send action. Only an
explicit new deposit creates a new operation with a new capability and key.

### Polling

Interval = the operation's `retryAfterMs`, clamped to 1.5–60s with ±10%
jitter. Errors back off from 5s; 429/503 honour `Retry-After`. Three 404s in
a row mark the operation's access as lost (the record is kept for support).
Polling stops on arrival, quote rejection, a reported refund, settlement for
an unexpected token, unfunded expiry, or 2h after WRAPPED with
`settlement: NOT_TRACKED`. It is paused while the tab is hidden.

### Persistence and isolation

`localStorage` key `equiteez:intents:v2:<env>:<account>`. v1 records (draft
contract, mock only) are ignored. Unreadable data is kept and tracking falls
back to the session. Records from other tabs are merged. Settled records
older than 14 days are pruned. There is no cross-device or cross-client
discovery: the backend has no list endpoint.

## Progress mapping

| Backend | Widget |
| --- | --- |
| wallet broadcast/confirmed, `AWAITING_DEPOSIT` | Step 1 Send Funds |
| registration `pending` / `accepted` | Step 1 "Confirming your transfer … with the deposit service" / "Transfer accepted. Verifying the delivery." |
| registration `stopped` (mismatch/conflict) | "Deposit under review" warning with the operation ID, Request ID and funding hash |
| `fundingStatus: OBSERVED`, `SWAP_IN_PROGRESS` | Step 2 Swap |
| `VERIFYING_DELIVERY`, `DELIVERY_VERIFIED`, `FORWARDING` | Step 3 Forward To Bridge |
| `WRAPPED` + settlement `PENDING` | Step 4 "Waiting for Mavryk confirmation" |
| `WRAPPED` + settlement `NOT_TRACKED` | Step 4, neutral, dismissible |
| settlement `CONFIRMED` for the expected FA2, or correlated bridge data | Success with the minted amount |
| attention `RETRYING`, `ROUTE_PAUSED`, `PROVIDER_UNAVAILABLE`, `REFUND_PENDING` | Extra copy on the current step |
| attention `MANUAL_REVIEW`/`RECONCILE_REQUIRED`, delivery `AMBIGUOUS`/`RECONCILE_REQUIRED`, forwarding/settlement `RECONCILE_REQUIRED` | "Deposit under review" warning with the operation ID |
| attention `DEPOSIT_INCOMPLETE` | "Incomplete deposit" warning, no top-up |
| `refund` reported | Final "Refund reported" warning (provider report) |
| unknown enum values | "Status not recognised" warning |
| `prompted` (after reload) / `unknown` / `reverted` | "Check your wallet" warnings |

1Click `SUCCESS`, EVM `WRAPPED` and signer votes are never success.

## Receipt

Primary: `settlement.status === "CONFIRMED"` with at least one mint and
`tokenAddress`/`tokenId` equal to the bridge pair's FA2. A confirmed mint on
another token is a warning, never success.

Fallback for `NOT_TRACKED`: the join keys are the ERC20WrapAsked identities
`forwarding.bridgeEvents[].transactionHash:logIndex` (and the
`settlement.mints[]` wrap identities). Every identity must have the wallet
API's `executed` row or two distinct `COMPLETED` signers. The funding and
delivery hashes are never passed to the bridge store. A bridge record that
matches an identity belongs to the operation: no second card and no
duplicate "Bridge deposit arrived" toast.

On arrival the existing wallet/portfolio/activity/notification queries are
invalidated (also once on WRAPPED), and one "Deposit arrived" toast is shown,
guarded by a persisted `announced` marker.

## Tests

`npx vitest run app/lib/apis/intents app/lib/intents app/contracts/intentsFunding.contract.test.ts app/hooks app/providers/TransactionsProvider app/routes/_index`

`app/hooks/useIntentsDeposit.integration.test.tsx` runs a full deposit
against the mock backend and the real tracking providers, with wagmi mocked
at the action boundary.
