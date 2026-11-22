# 1Click deposits in Equiteez: alignment with backend v0.0.2

Branch `MAV-4112/near-intents`. Date: 2026-11-16.

The first implementation (commits `4fe294a0` … `9c4819c5`) was built against a draft contract (`plan-intents.md` §3.1) and a mock. `backend.md` and the live `GET https://basenet.bridge-api.mavryk.network/openapi.json` (schema 0.1.0) describe a different API. This branch moves all six tickets to the real contract.

## 0. Update for backend v0.0.6 (2026-11-18)

Backend v0.0.6 lets Equiteez run a connected-wallet transfer on Arbitrum
Sepolia → Mavryk Basenet (`basenet-rehearsal-k8s`). Requested changes and
what was done:

| Request | Change |
| --- | --- |
| Source token from `/v1/metadata` | `getMetadata()` in the HTTP client/mock; `useIntentsRoutes` fetches `/v1/routes` + `/v1/metadata` and joins them on `routeId` + `routeVersion`. The token the wallet transfers (contract or native, symbol, decimals) comes only from metadata; settlement and destination FA2 are cross-checked against the route and `INTENTS_BRIDGE_PAIRS`. `INTENTS_SOURCE_ASSETS` is removed. New availability states: `paused` (`admissionPaused`), `preview_required` (non-rehearsal modes until `/v1/quotes/preview` is integrated), `registration_unsupported`. |
| New capability + unique idempotency key per operation | The pre-approved scope (`INTENTS_REHEARSAL_CAPABILITY` / `_IDEMPOTENCY_KEY`) is removed; every new operation generates both. |
| Register the deposit hash via `POST /v1/operations/{id}/deposit` | `registerDeposit()` (capability, body `{transactionHash}`, no idempotency key, response checked). Funding saves `registration: pending` in the same write as the broadcast hash; the tracker sends it, also after reload. |
| Resubmit the same hash on `REHEARSAL_RECEIPT_PENDING` | Pending receipt, RPC outage, 429, 5xx and lost responses resend the same hash after `Retry-After` or 15s → 60s, no cap, never another wallet prompt. Mismatch/conflict stop with "Deposit under review" (operation ID, Request ID, hash). Repriced replacements take over; cancellations stop registration. |

Also:

- Accepted minimum is exact on rehearsal routes (1:1, 0 fee); the old 50 bps
  fee allowance would have blocked the only allowed amount (0.995e18 <
  `minAmountOut` 1e18). `pricing`/`feeAllowanceBps` are removed.
- A route with `minAmountIn = maxAmountIn` prefills and locks the amount;
  `maxSlippageBps: 0` shows "0% (fixed)" (Universal Send and the modal).
- The mock mirrors Basenet (fixed 1-token rehearsal with registration,
  `RECEIPT_PENDING` once, `?intentsMock=registrationConflict`);
  `simulateDeposit` is gone and Simulate Funding goes through registration.
- Tracker fix: in-flight requests no longer keep a 0 ms timer spinning until
  they settle (affected the existing GET polling too).
- Verified: intents suites 358 passed / 1 pre-existing failure; full suite 744
  passed / the same 3 pre-existing failures; `tsc` no new errors; ESLint no
  errors; `remix vite:build` succeeds. The real client resolves the live
  `basenet-rehearsal-k8s` route as available with an exact 1e18 minimum.
- **Not done yet:** the 1 test USDT transfer on Basenet (needs the deployed
  preview, see §4.3).

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

### 4.3 Against Basenet (connected-wallet test, v0.0.6)

1. No route or rehearsal values are needed: the route and its token come from
   `/v1/metadata`, and every operation gets a fresh capability and key.
2. Deployed preview (`*.equiteez-app.pages.dev`): `wrangler.toml`
   `[env.preview.vars]` already sets `INTENTS_DEPOSIT_ENABLED=true` and
   `INTENTS_API=https://basenet.bridge-api.mavryk.network`. Locally use the
   proxy instead (the Gateway CORS allowlist has no localhost):
   ```bash
   INTENTS_DEPOSIT_ENABLED=true
   INTENTS_API=/intents-api
   INTENTS_API_PROXY_TARGET=https://basenet.bridge-api.mavryk.network
   ```
3. Connect an EVM wallet on Arbitrum Sepolia with ≥1 Mock USDT
   (`0x5c05e82b…`) and some Sepolia ETH, and sign in to Equiteez with an `mv1`
   account.
4. Open **Universal Send**. "Mock USDT on Arbitrum Sepolia" is selected with
   the amount locked at 1, slippage "0% (fixed)", minimum you accept 1 wUSDT.
5. **Review Send → Confirm**, wait for the instructions, then **Send**. One
   ERC-20 `transfer` goes to `depositAddress` (the recipient's forwarder).
6. Step 1 shows "Confirming your transfer…" while the backend waits for
   confirmations (`REHEARSAL_RECEIPT_PENDING` → automatic resend of the same
   hash), then progresses. No operator step and no second wallet prompt, also
   after a reload.
7. Expect: delivery verified → sponsored forward → WRAPPED → settlement
   CONFIRMED with `confirmedAmount: "1000000"` on `KT1Wewg18…` token 0, the
   wUSDT balance going up by 1, and one toast.

## 5. Needed from backend / ops

Blocking for a real test:

1. ~~**Activate a route.**~~ Done: `basenet-rehearsal-k8s` is live (2026-11-18). Originally: `GET /v1/routes` returned `[]` on Basenet.
2. ~~**Rehearsal values.**~~ No longer needed in v0.0.6 (per-operation scope, connected wallet). Originally: The raw capability, the idempotency key, the approved sender/recipient, and whether `slippageBps`/`acceptedMinAmountOut` are also fixed. Any mismatch gives `409 REHEARSAL_SCOPE_MISMATCH`.
3. ~~**`originAsset` of each route**~~ Answered in v0.0.6: `/v1/metadata` carries the source asset. Originally: `originAsset` of each route to approve in `INTENTS_SOURCE_ASSETS`. Better: add source token metadata to `/v1/routes` (`token` contract or `native`, `symbol`). Today the frontend can't map `originAsset` to the ERC-20 it must transfer without a hand-maintained list.
4. **CORS for development.** The allowlist has no `http://localhost:*`. We use the Vite proxy for now; please add localhost or a staging origin if proxying isn't acceptable.

Contract gaps and questions:

5. **No quote preview.** Users accept a minimum before any quote exists. We estimate it as parity (stablecoins) × a 0.5% fee allowance × slippage. Non-stable routes (e.g. ETH) need a price reference. Options: a non-executable preview endpoint, or `expectedFeeBps` / an indicative rate in `/v1/routes`.
6. **Which minimum is compared?** Please confirm `acceptedMinAmountOut` is compared with the quote's `minAmountOut` (or `bridgeableMinAmountOut`), and whether it must already be representable in FA2 precision. We round it down to a multiple of 10^(settlementDecimals − 6).
7. **`mv1` only.** Recipients must match `^mv1…$`, so Equiteez accounts on `mv2`/`mv3` keys can't use this route. Confirm this is intended.
8. ~~**Hash registration.**~~ Answered in v0.0.6: `POST /v1/operations/{id}/deposit` (connected-wallet routes). Originally: There is no public endpoint in normal mode, and the rehearsal needs a manual operator step. If a reconciliation hint is wanted (EQ-FE-03 scope), please expose an idempotent `POST /v1/operations/:id/deposit`.
9. **Settlement observation.** OpenAPI calls it "optional … requires explicit deployment enablement". Please confirm it's enabled on Basenet. Otherwise cards end on a neutral step 4 unless the RWA bridge API/notifier indexes deposits from WrapBridge `0x856c1E8a…` (fallback correlation).
10. ~~**`mavrykChainId`.**~~ Answered in v0.0.6: metadata `destinationAsset.chainId` (`NetXmtMsNf69w1w` on Basenet); not yet checked against settlement. Originally: Please share the expected Basenet value so the frontend can also check it (today: token address and ID only).
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
