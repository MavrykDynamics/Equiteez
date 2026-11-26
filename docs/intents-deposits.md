# 1Click (NEAR Intents) deposits

"Send From Any Network" is the deposit flow of Deposit Funds (next to
"Receive On Mavryk"; the direct "Bridge From Ethereum" UI was removed). The
user pays with any asset 1Click supports on twelve networks (eight EVM
chains, Solana, NEAR, Aptos, Bitcoin) and receives the wrapped settlement
token on Mavryk:

```
source asset ─1Click─▶ settlement token (USDT0 on Arbitrum One)
             ─EVM WrapBridge (sponsored forward)─▶ wUSDT on Mavryk
```

The user signs at most one transaction: paying the 1Click deposit address,
from a connected wallet (EVM, Solana, NEAR, Aptos or Bitcoin) or from **any**
wallet or exchange. The shared
Mavryk Bridge ETH backend forwards the swapped tokens into the WrapBridge and
pays that gas, the bridge mints on Mavryk, and the backend confirms the mint.

Contract: [`near-intents/backend.md`](../near-intents/backend.md) (API
`v0.0.9`, prefix `/v1`; Swagger at `GET /docs` labels it 0.1.0). The direct
bridge is documented in [`bridge-tracking.md`](bridge-tracking.md) and is
unchanged by this feature.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `INTENTS_API` | — | Required. Backend origin (`https://basenet.bridge-api.mavryk.network`) or `/intents-api` with the dev proxy. |
| `INTENTS_API_PROXY_TARGET` | — | Dev only: Vite proxies `/intents-api/*` here (the Gateway CORS allowlist has no localhost). |
| `INTENTS_ENV` | origin of the API | Scope of persisted operations; override only if two URLs are the same backend. |
| `INTENTS_API_MODE` | `http` | `mock` uses the in-browser simulator. |
| `INTENTS_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana balances, mint lookups and blockhashes. Use a dedicated RPC in production. |
| `INTENTS_NEAR_RPC_URL` | `https://free.rpc.fastnear.com` | NEAR balances and token storage registration. |
| `INTENTS_APTOS_API_URL` | `https://api.mainnet.aptoslabs.com/v1` | Aptos balances (view API). |
| `INTENTS_BITCOIN_API_URL` | `https://mempool.space/api` | Bitcoin balances (Esplora). |

The EVM source chains (`INTENTS_EVM_CHAINS`: Ethereum, Arbitrum One, Base, OP,
Polygon, BNB, Avalanche, Gnosis) are registered in wagmi on public RPCs so a
connected wallet can read balances and send. The direct bridge chain
(Arbitrum Sepolia) stays first.

### Metadata and availability

`GET /v1/metadata` (schemaVersion 2) is the only catalog. It is resolved in
`resolveIntentCatalog`:

1. **Settlement token.** Only `defaultSettlementToken`, matched by ID and
   version in `settlementTokens`. No selector and **never a fallback**: no
   default → "not enabled on this deployment". Its `destinationAsset` is what
   the user receives; the display symbol comes from Equiteez token metadata,
   else the bridge naming (`USDT0` → `wUSDT`, `USDC` → `wUSDC`). Different
   decimals in Equiteez metadata disable the flow.
2. **Flags.** `admissionPaused` → paused; `catalog.stale` → "being updated";
   `previewSupported: false` → prices unavailable.
3. **Source assets.** Every entry on a network in the static table
   (`app/lib/intents/intentNetworks.ts`) whose `family` and `evmChainId`
   agree with it; unknown networks/families/kinds are hidden, and so is the
   settlement asset itself. `assetId` is opaque and the key; symbols are not
   unique (duplicates show their contract in the picker).

Metadata is cached a minute and refetched when the user starts the review.

### Mock backend

`app/lib/apis/intents/intents.mock.ts` implements the same contract with
mainnet-shaped assets (SOL, BTC, ETH, USDC on Base and Arbitrum, NEAR, ZEC on
NEAR, APT, plus an unknown `tron` entry that must stay hidden), fixed USD
prices, a 0.3% fee and a 0.004 USDT0 withdraw fee. It validates refund
addresses per network, answers `AMOUNT_TOO_LOW/HIGH`, replays idempotent
creations (`IDEMPOTENCY_CONFLICT`, foreign capability → 404), publishes
instructions 1.5s after creation (Bitcoin: 2h funding window, 1h before the
deadline), and after **Simulate Deposit** runs OBSERVED +0s, SWAP +3s,
VERIFYING +8s, DELIVERY_VERIFIED +12s, FORWARDING +16s, WRAPPED +22s,
settlement CONFIRMED +32s. State is kept in `sessionStorage`. Force branches
with `?intentsMock=reject|expire|paused|memo|unavailable|previewBusy|refund|incomplete|review|untracked|stale|admissionPaused|noToken`.
Wallet transfers are disabled in mock mode (the networks are mainnets).

## Code map

| Concern | Location |
| --- | --- |
| Contract (zod), HTTP client, mock | `app/lib/apis/intents/` |
| Network table, refund address formats, explorers | `app/lib/intents/intentNetworks.ts` |
| Metadata → catalog, amount/slippage/recipient checks | `app/lib/intents/intentCatalog.ts` |
| Preview helpers, request key, error copy | `app/lib/intents/intentQuote.ts` |
| Capability + idempotency key generation | `app/lib/intents/intentCapability.ts` |
| Record model, merge, closure/receipt/mismatch rules | `app/lib/intents/intentOperation.ts` |
| EVM funding call shape, blockers, error classification | `app/lib/intents/intentFunding.ts` |
| Non-EVM wallet adapters (lazy, browser only) | `app/lib/intents/wallets/{solana,near,aptos,bitcoin}/` |
| Connected non-EVM wallets per network | `app/providers/IntentWalletsProvider/` |
| Funding runner (EVM and wallet senders), "I've sent it", mock simulation | `app/contracts/intentsFunding.contract.ts`, `useIntentsFunding` |
| Persisted store, GET tracker, widget mapping, receipts | `app/providers/TransactionsProvider/intent*.ts` |
| Metadata and preview queries | `app/hooks/useIntentsCatalog.ts`, `useIntentsPreview.ts` |
| Modal orchestration | `app/hooks/useIntentsDeposit.ts` |
| Modal shell, step and picker state | `DepositFunds/RDepositFundsModal.tsx` |
| Views | `DepositFunds/components/Intents{View,WalletsStep,DetailsStep,SourceWalletField,PickerView,QuoteView,FundingPanel,StatusView}.tsx` |
| Network/token grouping for the pickers | `DepositFunds/components/intentPickers.ts` |

## Screens

| Screen | Shows |
| --- | --- |
| Wallets (step 1) | Equiteez account (required) and an optional EVM wallet (`REthereumWalletDropdown`). Continue needs only the Equiteez account. |
| Deposit details (step 2) | From → To, "Token to receive" (display only), Network, "Send from" (non-EVM networks: connect that network's wallet, optional), amount, refund address, live preview (You receive ≈, Minimum received, fee included, swap time, slippage chips). |
| Network / token / wallet pickers | Networks grouped EVM / other, in table order, with their symbols; tokens of the selected network, with balances from the sending wallet; wallets of the network (detected first, others link to their install page). |
| Review / deposit | Review: fresh preview, accepted minimum, refund address, Confirm. Then "Preparing your deposit address…", then the deposit screen: QR code, network, exact amount (copy), deposit address (copy), memo when required, "Send within" countdown, refund address, exchange-fee warning, operation ID. Actions: Send from <wallet> (the reviewed wallet, any network), I've sent the deposit, Simulate Deposit (mock). |
| Status | The four widget steps, alerts for warning/error states, identifiers, explorer link, New deposit or Done. |

## Access

- Metadata and previews are public. Operation calls send
  `Authorization: Bearer <capability>`: 32 random bytes, base64url without
  padding, generated for every operation. The RWA token and cookies are never
  sent; only `Authorization`, `Content-Type` and `Idempotency-Key` are, as the
  Gateway allows.
- The capability, `Idempotency-Key` and exact request body are persisted
  **before** the first POST and reused for every retry (network errors, 5xx,
  429). Only a definitive 4xx (nothing created) leads to a fresh scope.
- The capability is never logged, put in URLs or shown; axios errors are never
  rethrown (their config holds the header).

## Lifecycle

1. **Form.** Asset, amount (raw units, wallet balance when sending from an EVM
   wallet; there are no backend limits), slippage (10/50/100/300 bps, default
   1%), the Equiteez account as the `mv1` recipient, and a **refund address
   on the source network**: the sending wallet's account (the wagmi wallet for
   EVM assets, the network's own wallet otherwise), or a pasted address
   validated per network (§7) and explicitly confirmed.
2. **Preview.** `POST /v1/quotes/preview` with exactly seven fields, debounced
   700ms, keyed by the inputs (late answers for old inputs are never shown),
   not retried automatically (≈10 a minute).
3. **Review.** Refetches metadata and the preview, then fixes the request with
   `acceptedMinAmountOut = bridgeableMinAmountOut` of that preview. On
   Confirm, a preview past `expiresAt` is fetched again; a different minimum
   is shown with "The price changed" for a new confirmation.
4. **Create.** Save the record, then `POST /v1/operations` → 202. The response
   must echo the request (EVM refund addresses come back lower-cased) or it is
   never funded. The operation starts at `PREPARING_QUOTE`.
5. **Deposit screen.** Shown only for `fundingStatus: AVAILABLE` with
   instructions matching the request (network, asset, exact amount,
   `bridgeableMinAmountOut ≥ accepted`). `QUOTE_REJECTED` or expiry before
   funding returns to the form; `PAUSED` shows "Do not send". Once published,
   input changes no longer clear the screen (the user may already have paid).
6. **Fund.** One runner for every wallet: check the reviewed account, re-read
   the operation (same `quoteId`, ≥15s before `fundingExpiresAt`, no memo),
   check the balance, save `prompted`, then ask the wallet. The transfer goes
   to `depositAddress`, never `forwarderAddress`.
   - *EVM (wagmi):* native transfer or ERC-20 `transfer`; switches chain;
     waits for the receipt (repriced replacements kept).
   - *Solana (Wallet Standard: Phantom, Solflare, Backpack, …):* a
     SystemProgram transfer, or SPL `transferChecked` into the deposit
     address's associated token account (created idempotently; classic or
     Token-2022). SOL must cover the fee and any account rent first.
   - *Aptos (AIP-62 Wallet Standard: Petra, Nightly, Pontem, …):*
     `aptos_account::transfer` (APT), `transfer_coins` (coin types) or
     `primary_fungible_store::transfer` (fungible assets). Mainnet and
     `signAndSubmitTransaction` 1.1 required.
   - *Bitcoin (sats-connect: Xverse, Unisat, Fordefi, `btc_providers`):* one
     `sendTransfer` in satoshis from the payment address; the wallet picks
     inputs and fee. Mainnet addresses only.
   - *NEAR (wallet-selector: Meteor, HERE):* a Transfer of NEAR, or
     `ft_transfer` (1 yocto) with `storage_deposit` first when the deposit
     account is not registered. Redirect wallets are not offered.
   - Non-EVM networks have no receipt wait: the deposit stays `broadcast`
     until 1Click reports it. Wallet adapters load lazily and are not in the
     PWA precache.
   - *Any other wallet or exchange:* the user pays the address and taps
     "I've sent the deposit" (`fundingState: external`). 1Click detects the
     deposit itself; there is no hash registration.
7. **Track.** The modal switches to the status view; the global widget shows
   the same model.

### Never sending twice

Only `not_started` and `rejected` allow a wallet request or "I've sent it".
A wallet error counts as `rejected` only for an explicit rejection (code
4001 / -32000 or rejection wording); anything else after the wallet was asked
is `unknown`, because it may have been broadcast.
`prompted`, `broadcast`, `confirmed`, `unknown`, `reverted` and `external`
never prompt again, and `fundingStatus: OBSERVED` hides the send actions. Only
an explicit new deposit creates a new operation with a new capability and key.

### Polling

Interval = the operation's `retryAfterMs` (5s), clamped to 1.5–60s with ±10%
jitter. Errors back off from 5s; 429/503 honour `Retry-After`. Three 404s in a
row mark access as lost (the record is kept for support). A deposit screen the
user left is still polled until its funding window closes, and a deposit sent
elsewhere until 30 minutes after it (late deposits are tracked). Polling stops
on arrival, quote rejection, a reported refund, settlement for an unexpected
token, or 2h after WRAPPED with `settlement: NOT_TRACKED`. It pauses while the
tab is hidden.

### Persistence and isolation

`localStorage` key `equiteez:intents:v3:<env>:<account>`. v2 (route-based
Basenet rehearsal) and v1 records are not read. Unreadable data is kept and
tracking falls back to the session. Records from other tabs are merged.
Settled records older than 14 days are pruned. There is no cross-device or
cross-client discovery: the backend has no list endpoint.

## Progress mapping

| Backend | Widget |
| --- | --- |
| wallet broadcast/confirmed, `external`, `AWAITING_DEPOSIT` | Step 1 Send Funds ("Waiting for 1Click to detect your deposit on …") |
| `fundingStatus: OBSERVED`, `SWAP_IN_PROGRESS` | Step 2 Swap |
| `VERIFYING_DELIVERY`, `DELIVERY_VERIFIED`, `FORWARDING` | Step 3 Forward To Bridge |
| `WRAPPED` + settlement `PENDING` | Step 4 "Waiting for Mavryk confirmation" |
| `WRAPPED` + settlement `NOT_TRACKED` | Step 4, neutral, dismissible |
| settlement `CONFIRMED` for the expected FA2, or correlated bridge data | Success with the minted amount |
| attention `RETRYING`, `PROVIDER_UNAVAILABLE`, `SETTLEMENT_TOKEN_PAUSED`, `SOURCE_PAUSED`, `REFUND_PENDING` | Extra copy on the current step |
| attention `MANUAL_REVIEW`/`RECONCILE_REQUIRED`, delivery `AMBIGUOUS`/`RECONCILE_REQUIRED`, forwarding/settlement `RECONCILE_REQUIRED` | "Deposit under review" warning with the operation ID |
| attention `DEPOSIT_INCOMPLETE` | "Incomplete deposit" warning, no top-up |
| `refund` reported | Final "Refund reported" warning (provider report) |
| funding `EXPIRED` after a send | "Do not send it again; a late deposit is still tracked" |
| unknown enum values | "Status not recognised" warning |
| `prompted` (after reload) / `unknown` / `reverted` | "Check your wallet" warnings |

1Click `SUCCESS`, EVM `WRAPPED` and signer votes are never success.

## Receipt

Primary: `settlement.status === "CONFIRMED"` with at least one mint and
`tokenAddress`/`tokenId` equal to the destination recorded from metadata. A
confirmed mint on another token is a warning, never success.

Fallback for `NOT_TRACKED`: the join keys are the ERC20WrapAsked identities
`forwarding.bridgeEvents[].transactionHash:logIndex` (and the
`settlement.mints[]` wrap identities), matched against the direct bridge's
verified records. Funding and delivery hashes are never passed to the bridge
store.

On arrival the existing wallet/portfolio/activity/notification queries are
invalidated (also once on WRAPPED), and one "Deposit arrived" toast is shown,
guarded by a persisted `announced` marker.

## Not yet supported

- Sending memo deposits from a non-EVM wallet (none today: every network is
  `SIMPLE`); they are paid from the deposit details instead.
- Redirect-based NEAR wallets (MyNearWallet) and Aptos wallets limited to
  `signAndSubmitTransaction` 1.0.
- Restoring non-EVM wallet connections after a reload (the user reconnects;
  tracking never needs the wallet).
- A settlement-token selector: the contract allows only the default token.

## Tests

`npx vitest run app/lib/apis/intents app/lib/intents app/contracts/intentsFunding.contract.test.ts app/hooks app/providers/TransactionsProvider app/routes/_index`

`app/hooks/useIntentsDeposit.integration.test.tsx` runs EVM wallet, Solana
wallet (fake adapter) and Solana manual deposits against the mock backend and
the real tracking providers, with wagmi mocked at the action boundary. Each
adapter in `app/lib/intents/wallets/` is tested against a fake wallet and a
fake network reader.
