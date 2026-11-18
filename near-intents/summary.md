# 1Click deposits in Equiteez: alignment with backend v0.0.2

Branch `MAV-4112/near-intents`. Date: 2026-11-16.

The first implementation (commits `4fe294a0` … `9c4819c5`) was built against a draft contract (`plan-intents.md` §3.1) and a mock. `backend.md` and the live `GET https://basenet.bridge-api.mavryk.network/openapi.json` (schema 0.1.0) describe a different API. This branch moves all six tickets to the real contract.

## 1. Commits

| Ticket | Commit | What changed |
| --- | --- | --- |
| EQ-FE-01 | `aaa35117` | Real schemas, HTTP client with the capability access adapter, mock of the real contract, product config for source assets and bridge pairs, route resolution, slippage selector, dev proxy. Adds `backend.md`. |
| EQ-FE-02 | `74787951` | Capability + idempotency key + exact request persisted before POST, local review with the accepted minimum, waiting for `PREPARING_QUOTE` → instructions, executable-quote view, request/instructions mismatch checks, rehearsal scope. |
| EQ-FE-03 | `e0c64f3e` | Re-read the operation right before signing (AVAILABLE, same `quoteId`, ≥15s before expiry). Send to `depositAddress` only. The deposit-hint call is removed (no such endpoint). |
| EQ-FE-04 | `ea419564` | Tracker follows `retryAfterMs`/`Retry-After`, handles 404 (lost access), merges by `revision`. The widget maps phase/attention/funding/settlement. The status view lists every identity. |
| EQ-FE-05 | `d46fdae2` | Receipt = backend `settlement.status: CONFIRMED` for the expected FA2. Fallback: verified bridge data on every `bridgeEvents` identity. One arrival toast with the amount. |
| EQ-FE-06 | this commit | Integration test on the real contract, `docs/intents-deposits.md`, plan notes, this summary. |

Commits are grouped by ticket. Only the last commit has been typechecked and tested on its own; intermediate commits share types across tickets and may not compile alone.

## 2. Changes from the draft contract

| Area | Before (draft) | Now (backend.md / OpenAPI 0.1.0) |
| --- | --- | --- |
| Auth | `X-Intents-Client` header (would also fail the CORS preflight) | Per-operation `Authorization: Bearer <capability>`: 32 random bytes, base64url. Persisted before POST; the only way to read the operation again. |
| Routes | `source.token.symbol`, `destination.*` | `sourceChainId` (string), `originAsset`, `settlementToken`, `bridgeAddress`, decimals, `min/maxAmountIn`, `minAmountOut`, `maxSlippageBps`. Display and funding metadata now come from `INTENTS_SOURCE_ASSETS` and `INTENTS_BRIDGE_PAIRS`. |
| Quote | `POST /quotes` preview | No preview. The user accepts `slippageBps` + `acceptedMinAmountOut`; the backend prepares the executable quote after the POST. |
| Create | `{routeId, amountIn, recipient, sourceAddress}` | 8 required fields including `routeVersion`, `refundAddress` (= source wallet), `slippageBps`, `acceptedMinAmountOut`. 202 + `Idempotency-Replayed`. |
| Funding | `funding {chainId, token, depositAddress, amount}` returned at once | `fundingStatus` + `fundingInstructions` (published later, hidden when EXPIRED/OBSERVED). |
| Hint | `POST /operations/:id/deposit` | Removed. The hash is stored locally for support. |
| Status | `status` enum | `phase`, `attention`, `closure`, `fundingStatus`, `providerStatus`, `delivery`, `forwarding`, `settlement`, `refund`, `revision`, `retryAfterMs`. |
| Receipt | Bridge correlation only (`forwardTxHash`) | Backend `settlement` CONFIRMED + token identity. Bridge correlation on `forwarding.bridgeEvents[]` is the fallback. |
| Errors | lowercase codes | `VALIDATION_ERROR`, `IDEMPOTENCY_CONFLICT`, `ROUTE_UNAVAILABLE`, `DEPENDENCY_UNAVAILABLE`, … with `requestId` (shown to the user) and `Retry-After`. |
| Storage | `equiteez:intents:v1:*` | `equiteez:intents:v2:*` (v1 mock records are ignored). |

## 3. What works

- Route catalog behind `INTENTS_DEPOSIT_ENABLED`. An empty list or an outage shows a usable "unavailable" state; Bridge From Ethereum and Receive On Mavryk are unchanged.
- Routes that aren't approved (unknown `originAsset`), unknown bridge pairs, decimals mismatches and chains without a funding adapter are disabled with an explanation, never guessed.
- Validation: inclusive min/max in raw units, balance, slippage ≤ route maximum, accepted minimum ≥ route `minAmountOut`, `mv1` recipients only, authenticated Equiteez session.
- Idempotency: double clicks, lost responses, 5xx/503/429 and modal reopen reuse the same capability, key and body. Definitive rejections start a fresh scope. A changed request under the same scope is never sent.
- No funding prompt before the backend publishes instructions. The wallet is asked only after a fresh re-read confirms AVAILABLE, the reviewed `quoteId`, a request/route match and ≥15s before `fundingExpiresAt`.
- One wallet signature (native or ERC-20 `transfer` to `depositAddress`). Unknown, replaced or cancelled broadcasts, reloads, modal close and account switches never resend.
- Global widget and modal share one model. Minimize/reopen, navigation, reload and account isolation work as before.
- Truthful progress through quote, deposit, swap, delivery verification, sponsored forwarding, WRAPPED and confirmed Mavryk settlement. Attention, review, incomplete, refund and unknown states never invite a second deposit.
- Arrival from verified settlement for the expected wUSDT, or verified bridge data on every wrap identity. One toast, and balances/activity are refreshed.

Verification on the final commit:

- `npx vitest run app/lib/apis/intents app/lib/intents app/contracts/intentsFunding.contract.test.ts app/hooks app/providers/TransactionsProvider app/routes/_index` → 328 passed, 1 failed (the failure was already there, see below).
- Full suite: 714 passed, 3 failed. All 3 fail the same way on the base commit `9c4819c5` and are unrelated: the `RTransactionWidgetHost` arbiscan-link test (bridge network move), `usePrimaryPurchase` and `RPrimarySaleSummary`.
- `tsc`: no new errors (the 10 existing errors in unrelated files remain). ESLint: no errors. `remix vite:build` succeeds.
- **Not done:** a real transfer against Basenet. On 2026-11-16 `GET /v1/routes` returned `{"routes":[]}`, so no route is active yet.

## 4. How to test

### 4.1 Automated

```bash
npx vitest run app/lib/apis/intents app/lib/intents app/contracts/intentsFunding.contract.test.ts app/hooks app/providers/TransactionsProvider app/routes/_index
```

`app/hooks/useIntentsDeposit.integration.test.tsx` is the end-to-end scenario: one funding action to confirmed settlement, close/reopen, reload, untracked settlement completed from bridge data, quote rejection, unknown broadcast, account switch, refund and outage.

### 4.2 Manually with the mock backend

1. `.env`:
   ```bash
   INTENTS_DEPOSIT_ENABLED=true
   INTENTS_API_MODE=mock
   ```
2. `npm run dev`, sign in, open **Deposit Funds → Swap From Any Chain**.
3. Pick "USDT on Arbitrum Sepolia". Check that "Route mock-base-sepolia-usdc (unavailable)" is disabled. Enter `2`, choose a slippage and check **Minimum you accept**.
4. **Review Deposit → Confirm Deposit**. "Preparing your quote…" should be followed about 1.5s later by the executable quote (exact amount, 1Click deposit address, expected/minimum, countdown).
5. **Simulate Funding** (no wallet), or **Send** with a funded test wallet. The modal switches to the status view.
6. Minimize. The widget card should run through Swap → Forward To Bridge → Bridge To Mavryk ("Waiting for Mavryk confirmation"), then success "1.994 wUSDT arrived…" after about 32s, with a single toast.
7. Reload in the middle of the flow: the same card resumes, with no new wallet prompt and no second toast.
8. Scenarios via the URL (`?intentsMock=…`, then repeat steps 3–6):
   - `reject`: back to the form with "No quote met your minimum", no wallet prompt.
   - `expire`: let the 20s countdown run out; the form says the quote expired.
   - `paused`: "Funding is paused", no send button.
   - `unavailable`: error with Request ID; **Confirm** again keeps the same scope.
   - `refund`: final "Refund reported" warning.
   - `incomplete`: "Incomplete deposit" warning, no top-up offered.
   - `review`: "Deposit under review" with the operation ID.
   - `untracked`: neutral step 4, dismissible, no false success.
9. Regression: Bridge From Ethereum and Receive On Mavryk behave as before, and existing bridge cards/toasts are unchanged.
10. Layout: modal and widget at phone width; slippage buttons and long addresses wrap; Tab reaches the slippage radios.

### 4.3 Against Basenet (BE-09 smoke test)

1. Ask backend/ops to activate the rehearsal route and send: its `originAsset`, the **raw** rehearsal capability (not the hash), the idempotency key, and the approved sender/recipient (see §5).
2. `.env` (local only; never in a production build):
   ```bash
   INTENTS_DEPOSIT_ENABLED=true
   INTENTS_API=/intents-api
   INTENTS_API_PROXY_TARGET=https://basenet.bridge-api.mavryk.network
   INTENTS_SOURCE_ASSETS='[{"originAsset":"<from /v1/routes>","chainId":421614,"token":"0x5C05e82bE66B19476bAcb558E62e7d449b98635F","symbol":"USDT","name":"Mock USDT","decimals":18,"pricing":{"kind":"parity"},"feeAllowanceBps":50}]'
   INTENTS_REHEARSAL_CAPABILITY=<raw 43-char capability>
   INTENTS_REHEARSAL_IDEMPOTENCY_KEY=<approved key>
   ```
   On a deployed preview (`*.equiteez-app.pages.dev`) use `INTENTS_API=https://basenet.bridge-api.mavryk.network` without the proxy.
3. Connect the approved EVM sender (Arbitrum Sepolia, holding ≥1 mock USDT) and sign in to Equiteez with the approved `mv1` recipient.
4. Deposit exactly **1** USDT. Confirm, wait for the instructions, then send. In the rehearsal, `depositAddress` equals the forwarder; that is expected.
5. Give the operator the funding hash from the status view (the test adapter needs it registered manually).
6. Expect: progress through WRAPPED → settlement CONFIRMED, the wUSDT balance (`KT1Wewg18…`) going up by about 1, one toast, and no second wallet prompt after reload.

## 5. Needed from backend / ops

Blocking for a real test:

1. **Activate a route.** `GET /v1/routes` currently returns `[]` on Basenet.
2. **Rehearsal values.** The raw capability, the idempotency key, the approved sender/recipient, and whether `slippageBps`/`acceptedMinAmountOut` are also fixed. Any mismatch gives `409 REHEARSAL_SCOPE_MISMATCH`.
3. **`originAsset` of each route** to approve in `INTENTS_SOURCE_ASSETS`. Better: add source token metadata to `/v1/routes` (`token` contract or `native`, `symbol`). Today the frontend can't map `originAsset` to the ERC-20 it must transfer without a hand-maintained list.
4. **CORS for development.** The allowlist has no `http://localhost:*`. We use the Vite proxy for now; please add localhost or a staging origin if proxying isn't acceptable.

Contract gaps and questions:

5. **No quote preview.** Users accept a minimum before any quote exists. We estimate it as parity (stablecoins) × a 0.5% fee allowance × slippage. Non-stable routes (e.g. ETH) need a price reference. Options: a non-executable preview endpoint, or `expectedFeeBps` / an indicative rate in `/v1/routes`.
6. **Which minimum is compared?** Please confirm `acceptedMinAmountOut` is compared with the quote's `minAmountOut` (or `bridgeableMinAmountOut`), and whether it must already be representable in FA2 precision. We round it down to a multiple of 10^(settlementDecimals − 6).
7. **`mv1` only.** Recipients must match `^mv1…$`, so Equiteez accounts on `mv2`/`mv3` keys can't use this route. Confirm this is intended.
8. **Hash registration.** There is no public endpoint in normal mode, and the rehearsal needs a manual operator step. If a reconciliation hint is wanted (EQ-FE-03 scope), please expose an idempotent `POST /v1/operations/:id/deposit`.
9. **Settlement observation.** OpenAPI calls it "optional … requires explicit deployment enablement". Please confirm it's enabled on Basenet. Otherwise cards end on a neutral step 4 unless the RWA bridge API/notifier indexes deposits from WrapBridge `0x856c1E8a…` (fallback correlation).
10. **`mavrykChainId`.** Please share the expected Basenet value so the frontend can also check it (today: token address and ID only).
11. **"Nine immutable request fields"** in backend.md §6, but the schema has eight. Please clarify.
12. **`depositMemo`** is typed as `{}` in OpenAPI and documented as null. The frontend refuses to fund when it's non-null.
13. **No list/recovery endpoint.** Operations are visible only in the browser that created them; clearing site data loses status access (funds are still delivered). Cross-device recovery needs an authenticated list endpoint.
14. **No push updates.** Polling only, every `retryAfterMs`. The Gateway reports `x-ratelimit-limit: 60` per minute, which a couple of open operations polled every 1.5–2s can approach. 429s are handled with `Retry-After`, but a slightly higher `retryAfterMs` or a notifier relay of operation updates would avoid them.

Still open from `plan-intents.md` §6: the testnet route set (2), design copy for the tab, steps and states (EQ-D-02/03/04) (7), and the per-recipient concurrency policy (9).

## 6. Where to look

- Contract and code map: `docs/intents-deposits.md`
- Config: `app/consts/intents.ts` (`INTENTS_SOURCE_ASSETS`, `INTENTS_BRIDGE_PAIRS`, polling, safety margin)
- Contract layer: `app/lib/apis/intents/`
- Rules (idempotency, mismatch, closure, receipt): `app/lib/intents/`
- Funding: `app/contracts/intentsFunding.contract.ts`
- Tracking/widget/receipt: `app/providers/TransactionsProvider/intent*.ts`
