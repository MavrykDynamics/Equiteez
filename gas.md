## 0. What it is

A trade without MVRK. The user signs a TZIP-17 permit in the wallet; the App builds the `permitAndExecute` call with Taquito exactly as it builds the MVRK-paying call today, and posts it to the RWA API instead of injecting it. The API validates it (who signed, what variant, against which contract), persists it, and relays it to the Gas Station, whose sponsor vault pays the gas. The App **never** talks to the Gas Station: the sponsor key lives only in the backend. The operation then moves through the relayer's lifecycle to `confirmed`, `failed` or `rejected`, which the App learns by polling, by a socket frame, and - for the two failures - by an inbox row.

There are two user-selectable paths: **Gasless (default)** and **pay network gas in MVRK**. Gasless uses the relay; MVRK uses the existing direct wallet transaction. Relay eligibility controls whether gasless can execute, not whether a high MVRK balance changes the default. A relay outage must not silently turn a gasless action into a user-paid transaction.

**Historical rollout snapshot (2026-09-22; not rechecked).** The routes are in the API from `develop` `e00de0a` (#50); prod (`v0.12.2`) answers `404` on `/relay/config`, which the client must read as "disabled". Test is wired for the relay on the pending infra change (`GAS_STATION_ENABLED=true`, backend `develop-0e157a3`); prod has it off. The Gas Station in basenet has the **test triple** registered (orderbook `KT1JqTYTFuX6JC4FjVYVe2JyvJ7wnT2o5qHw`, RWA token `KT1WPaxGTXz8f3RXsJTi8CMXg7ipyvykcLsP`, quote token `KT1CSxd3AbPZYPgQZJUkn64RGQbN89FcPPvi`, plus the KYC contract and wUSDT), while the live catalog contracts are a pre-permit generation. `enabled` is true only when at least one **catalog** contract is registered, so until the catalog is redeployed on the permit generation the gate stays closed on every environment and the feature is exercised against the test triple through a dev-only fixture, behind the flag. That snapshot planned a fee-off launch; the current design includes paid Credits. Use runtime `fee.enabled` and resolve the rollout decision in §9.

## 1. The gate

```
GET /api/v1/relay/config        public, cached 30 s (X-Cache: STALE while refreshing)
```

`{ enabled, fee, contracts[], gaslessThresholdMumav }`. `enabled` means: relay on, not draining, and at least one catalog contract registered with the relayer. `contracts` lists exactly those, each `{ address, kind (rwa_token | orderbook | quote_token | kyc), permitActions[] }`. `fee` is always an object, `{ enabled: false }` while charging is disabled; every unit-bearing value is a string. Cache it client-side for a minute; a `404` (older backend) or a fetch error resolves to a disabled config, never to a throw.

### Selection and eligibility are separate

1. Without an explicitly saved preference, start with **gasless selected**. Do not select MVRK based on a high, low,
   missing, or still-loading native-token balance. `gaslessThresholdMumav`
   remains a legacy API field and no longer selects the payment mode.
2. The selector lives in **Portfolio → Profile → Gas Payment → Payment Method**,
   with **Credits** selected by default. Choose Credits or MVRK, then **Save**.
   A dropdown edit is a draft until Save succeeds; restore the saved preference
   on subsequent visits. This replaces the earlier proposed form-level toggle.
   Show the Credits badge in Credits mode and the usual Wallet badge in MVRK
   mode. Preserve order inputs when applying a saved change. Do not restore an
   old balance-derived `mav` value as an explicit choice. Storage/API ownership
   is an integration gap (§9), not a new endpoint invented by this guide.
3. For gasless, require `enabled`, the authenticated wallet session, and the
   contracts/permit actions needed for this action. Buy/sell need the relevant
   orderbook action and `permitUpdateOperators` on the quote/RWA token;
   cancel/refund need only their orderbook action. A loading configuration is
   not confirmed eligibility. A failed config fetch or `404` disables relay
   execution, not the user's ability to select MVRK.
4. If gasless is unavailable, show the reason and offer an explicit MVRK choice.
   Missing authentication should offer sign-in. Never silently change the
   selected path or overwrite the user's choice because a relay request fails.
5. For MVRK, estimate the direct transaction's network fee and check the wallet's
   native balance. While the estimate/balance is unknown, do not claim sufficient
   funds. Insufficient MVRK blocks direct submission with a clear reason; offer
   gasless if eligible. Relay availability does not gate the direct path;
   contract, KYC, balance, and order validity checks still apply.

Use **MVRK** in user-facing copy. Existing API fields such as `gaslessThresholdMumav` and existing internal `mav` mode values need not be renamed; this is a UI/product rule, not a wire-schema migration.

### Mode changes and fee review

Show the selected payment method before the wallet prompt. In gasless mode, identify that Equiteez pays network gas. In MVRK mode, show the estimated network fee payable by the user. Keep network gas, orderbook fees and the optional gasless service fee distinct: gasless does not mean that every fee is zero. Fee-credit/top-up controls apply only to gasless when `fee.enabled`.

Lock the path for the running action. Do not execute the same intent via MVRK while its relay outcome is pending or unknown, including after a submit timeout. Recover/reconcile the existing operation first; switching is not a retry. After a terminal failure, refresh order state, balances and fees, then let the user review a fresh action in either eligible mode. A completed operator grant or top-up must not be represented as a completed order.

The confirmed selector placement is Profile settings, not the trade form. Recovery actions may link to that setting; they must not silently save MVRK. A preference change affects future actions, not an already signed/submitted plan. Save failures retain the previous active method and expose a retryable error.

## 1.1. Figma screens → frontend behaviour

All node IDs below belong to the linked Gasless Trading section. “Credits” is the user-facing name; the API still exposes prepaid quote-token units and per-variant action counts. Do not rename wire fields or assume one unit equals one Credit. Numeric examples in frames are not a price contract.

| Surface                                    | Required integration                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile settings, Gas Payment              | Payment Method dropdown + Save; default Credits, explicit persisted MVRK option. Render the appropriate header badge after saving.                                                       |
| Badge variants                             | Healthy, low, empty, adding, and free-allowance states; fetch credits for the authenticated wallet and reset the cache on wallet/network changes.                                        |
| Badge dropdown                             | Credits Balance, amount/value, Add Credits, Portfolio, Change Account, Sign Out. Add Credits opens the same modal used by the trade panel.                                               |
| Order summary / empty warning; low warning | Credit line with count and monetary equivalent; inline Top Up link. Low balance is a warning, insufficient effective allowance blocks only chargeable gasless orders.                    |
| Add Trading Credit , modal in context      | Wallet USDT balance, 5/20/50 presets, Custom, exact USDT authorization amount, non-withdrawable disclosure, Cancel and Add Credits.                                                      |
| Adding progress                            | Compact “Adding N Credits” / “Buying Credits” progress; pending balance must not become spendable before confirmation and credit refresh.                                                |
| Submitted panel                            | “Transaction Submitted”, “Minimize And Continue Browsing”, “View Details”; replace placeholder paragraph with actual status. The layer name `confirmed` is not a backend status mapping. |
| Activity → Transaction History             | Top Up row: Gas Credits / USDT, amount, Gas Station interaction, transaction hash and real status.                                                                                       |
| Failure guidance                           | Distinguish user credit shortage from sponsor outage; show whether a charge remains, without inferring a refund from an ambiguous null.                                                  |

### Credits badge and trade-panel states

The design specifies green for more than 2 Credits, yellow for 1–2, red for 0 with **Add Credits**, grey animated **Adding N Credits**, and blue **N Free Credits** (5 initially in the design). Apply these thresholds to the agreed Credit/action unit (§9), not raw `balanceUnits`. An unknown balance is a loading/error state, never “0 Credits”. Pending top-up is an overlay on the confirmed balance; it does not erase existing spendable credits.

Use `freeAllowanceRemaining` for the free count; never grant five locally or reset it on refresh, sign-in or account switching. Paid balance and free allowance can coexist. Their display precedence and the inclusion of free allowance in `actionsRemaining` must be confirmed before summing counts (§9). An empty paid balance with usable free allowance must not force a top-up.

Trade-panel copy from the design:

- Low: “Running low on Credits. Please Top Up your balance.”
- Empty: “You’re out of Credits. Please Top Up your balance.”

Keep the form intact when opening/closing Top Up. Cancels, refunds, operator grants and top-ups are free in the intended schedule; lack of paid Credits must not block them. Check current pricing by permit variant, not a global “credit balance is zero” gate. In MVRK mode hide Credits spending controls and warnings; retained credits are neither discarded nor cashed out by switching.

### Top-up interaction and amounts

Design defaults: **20 selected**, presets **5 / 20 / 50**, custom **5–100**, no cap on the accumulated balance. Reopening starts at 20. These are quantities of Credits in the notes, while the custom input artwork shows dollar amounts; resolve the unit/price contract in §9 before implementing the conversion.

Show available USDT for `fee.tokenContract` / `fee.tokenId`, not total portfolio value. Calculate `amountUnits` with exact decimal arithmetic and `fee.decimals`; validate it against `topUpMinUnits..topUpMaxUnits` and wallet funds. Disable invalid/unaffordable choices, including a default preset that cannot be funded. Never silently reduce the authorized amount. The displayed “You're authorizing one payment of exactly {amount} USDT” must match the signed transfer and POST amount. Refresh configuration before signing; changed price or bounds require a revised review. No fabricated 1 Credit = 1 USDT conversion.

Cancel/close before signing returns to the unchanged order. Wallet rejection leaves credits unchanged. After submission, closing/minimizing only dismisses the panel: keep tracking the operation and the pending badge. On `confirmed`, refresh fee credits and USDT balance; while the credit read has not caught up, keep an updating state rather than inventing the new balance. A failure shows a recoverable state with the original order preserved. The same top-up is not sent twice merely because the user reopens the modal or reloads the page.

Credits are prepaid and cannot be withdrawn. A charge returned after an order failure is restored to the credit balance; it is not a USDT withdrawal to the wallet. Top-up confirmation is not order placement: resuming a trade still requires its remaining signatures and a valid order review.

### Order summary, progress and history

Show the **Credit** row and its monetary equivalent for a chargeable gasless order, deriving the charge from the current variant schedule and allowance. The design's “1 Credit · $1.00” is an example; its Dev Notes explicitly leave price per order under discussion. The prepaid debit must not be counted again as a new wallet USDT transfer in the order total. Separate the amount needed for this order from credit already purchased. Do not reproduce the sample `$10,000.01` total beside a `$1.00` credit line as a calculation rule.

The artwork says Credits cover “platform and network fees”. Existing protocol fees are independent of relay charges: do not remove them or promise that wording until fee coverage is confirmed (§9). When `fee.enabled` is false, skip paid-credit reads/top-ups/warnings and show sponsor-paid network gas; retain the user's gasless/MVRK preference.

A submitted panel can appear once the backend has accepted the operation; “View Details” opens internal operation details until an `opHash` exists, then may offer the explorer. Minimize keeps tracking active. For a multi-step trade, distinguish wallet signing, relay processing and confirmed setup from confirmed order placement. A placed order is not necessarily a filled order. The generic submitted frame does not replace the sequential permit rules in §3.

Populate the Top Up history from authoritative `fee_top_up` operations (`intent.amountUnits`, `createdAt`, `status`, `opHash`). The relay list can be filtered client-side by `intentKind`, with pagination; do not invent an unsupported `intentKind` query parameter. If the main activity feed does not already expose these rows, add a frontend adapter or an explicit backend extension, preserving pagination and deduplicating by operation ID / hash. Do not assume a quote-token transfer automatically creates this activity row. Do not create a successful relay inbox notification solely to populate history.

## 2. Endpoints

```
POST /api/v1/wallets/{wallet}/relay/operations            { intent, operation, idempotencyKey?, permitCounter? } → 202
GET  /api/v1/wallets/{wallet}/relay/operations/{id}?fresh=1
GET  /api/v1/wallets/{wallet}/relay/operations?status=open&limit=20&cursor=
POST /api/v1/wallets/{wallet}/relay/fee/top-up            { publicKey, signature, amountUnits } → 202   (fee on only)
GET  /api/v1/wallets/{wallet}/relay/fee/credits                                                   (fee on only)
```

Wallet-bound (`403` for another wallet's path). **These routes are camelCase**, pinned to the Gas Station's own shapes, unlike the snake_case rest of the API.

### Submit

`operation` is the `TransferParams` Taquito's `toTransferParams()` produced for `permitAndExecute`: `{ to, parameter: { entrypoint: "permitAndExecute", value } }`, a one-element list of `Pair(userPublicKey, userSignature, action)`. `amount` may be omitted, `0` or `"0"`; anything else is `400 AMOUNT_NOT_ZERO`.

`intent` says what the permit does; the backend decodes the Michelson and refuses a mismatch (`400 INTENT_MISMATCH`):

| `intent.kind`                          | typed fields                                                                                         | permit variant                                 | contract    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| `place_buy_order` / `place_sell_order` | `orderbookAddress`, `rwaTokenAmount`, `pricePerRwaToken`, `currency`, `orderExpiry`, `isMarketOrder` | `permitPlaceBuyOrder` / `permitPlaceSellOrder` | orderbook   |
| `cancel_orders`                        | `orderbookAddress`, `orders[{ orderId, orderType }]` (1–10, one orderbook)                           | `permitCancelOrders`                           | orderbook   |
| `process_refund`                       | `orderbookAddress`, `orderId`, `orderType`                                                           | `permitProcessRefund`                          | orderbook   |
| `update_operators`                     | `tokenAddress`, `tokenId`, `operator` (the token's own allowlisted orderbook)                        | `permitUpdateOperators`                        | token       |
| `fee_top_up`                           | read-only: appears on GET rows written by the top-up route; refused on submit                        | `permitTransfer`                               | quote token |

Amounts and ids are raw nat decimal strings. `to` must equal the intent's `orderbookAddress` / `tokenAddress`. **No literal inside the action may name an address outside the wallet and the catalog** (a contract-agnostic guard; the `operator` of an `update_operators` is the one exception it knows).

Gates run in this order and each answers before any gas is spent: drain switch (`503 RELAY_UNAVAILABLE`), entrypoint and zero amount, contract in the catalog **and** registered (`400 CONTRACT_NOT_RELAYABLE`, `detail.reason` = `not_in_catalog | not_registered | old_generation`), exactly one permit in the list, `%userPublicKey` derives to the JWT wallet (`403 SIGNER_MISMATCH`), intent ↔ variant ↔ contract agreement (`400 INTENT_MISMATCH`), KYC (`403 KYC_REQUIRED`), per-wallet quotas (`429 RELAY_QUOTA_EXCEEDED`, `Retry-After` in seconds).

The row is persisted **before** the relayer is called. **One permit may be in flight per `(signer, contract)`**: a second one is `409 PERMIT_IN_FLIGHT` with `detail.operationId`, which is **our** id - poll it. `idempotencyKey` is one per user click (1–128 printable ASCII): the same payload again replays the stored ids with `202`; a different payload under the same key is `409 IDEMPOTENCY_KEY_REUSED`. `permitCounter` is optional and stored for diagnosis only.

`202` → `{ operationId, gasStationOperationId, status: "pending" }`. Poll **our** `operationId`, never the relayer's.

### Read

- `GET …/relay/operations/{id}`: our row, a superset of the socket payload -
  `status`, `intent` (as submitted) and `intentKind`, `permitVariant`,
  `contractAddress`, `opHash`, `feeChargedUnits`, `error`, `createdAt`,
  `updatedAt`, `settledAt`. Poll every 3 s **without** `fresh=1` and stop on
  a terminal status. `?fresh=1` forces one relayer poll for a non-terminal row
  on its own per-wallet budget (30 per minute) - use it only behind a "check
  now" action, and read `X-Cache-Bypass`: `fresh`, `limited` (budget spent,
  stored row) or `stale-fallback` (relayer silent, stored row). Another
  wallet's id reads as `404`.
- `GET …/relay/operations?status=&limit=&cursor=`: newest first, keyset-paged
  (`{ items, nextCursor }`, follow until `null`); `status` takes the enum plus
  `open` (every non-terminal), repeated or comma-separated; `limit` ≤ 100.

### Fee (skip entirely while `fee.enabled` is false)

`POST …/relay/fee/top-up` forwards a signed `permitTransfer` of the quote token to `fee.collector`; the relayer rebuilds the transfer from its own config, so only `{ publicKey, signature, amountUnits }` travel. `amountUnits` must sit in `fee.topUpMinUnits..topUpMaxUnits` (`400 AMOUNT_OUT_OF_BOUNDS`); with the fee off it is `404 FEE_DISABLED`. The top-up occupies the quote token's one-in-flight slot like an operator grant does. Credit is granted when the operation confirms: poll it, then re-read `GET …/relay/fee/credits` (`{ enabled: false }` while off; otherwise `balanceUnits`, `decimals`, `actionsRemaining` per variant, `freeAllowanceRemaining`, …). A `402 FEE_CREDIT_REQUIRED` on a submit routes the user to the top-up - after refreshing the config, since the flag may have flipped behind a cached copy.

## 3. Flows

The permit flows below apply to **gasless**. Selecting MVRK dispatches the existing direct contract action through the wallet, with native gas estimation and direct-operation tracking; it must not call relay submit or fee top-up. Both paths must retain the same order intent and business validation.

**Cancel and refund** are one permit each, free on the relayer's schedule, no operator step. Up to 10 cancels of one orderbook go into one `permitCancelOrders` action - one signature, one relay, one counter consumed. Refund keeps today's gating (`refund=claimable` rows); only the transport changes.

**Buy and sell** are sequential relays, because a permit is one operation and the slot is one per contract: first `permitUpdateOperators` on the quote token (buy) or the RWA token (sell), granting the orderbook, then `permitPlaceBuyOrder` / `permitPlaceSellOrder` on the orderbook. The grant is **persistent** - there is no revoke step - so skip it whenever the token already lists the orderbook as operator (the FA2 `is_operator` view; fall back to the `operators` big map, and to "not granted" as the worst case, which costs one free step and never a missed one). A fresh wallet signs twice, a returning one once. With the fee on, a top-up may precede the order.

**Wait for `confirmed` before the next step**: the top-up and the operator grant both consume the quote token's counter, and the backend serialises them (`409 PERMIT_IN_FLIGHT` otherwise). Never fan out permits on one contract. A `failed` or `rejected` step stops the plan; terminal alone is not permission to continue.

**Signing rules** the backend cannot enforce for you:

- Read the `%action` type from the **live script**, the counter from the
  contract **immediately before** signing, the chain id from the node; hash
  with `blake2b(pack(action))`; the packed payload starts with `05`.
- Verify the signature locally before posting (one blake2b and one ed25519
  check); a wallet that alters the bytes shows up here, not as a
  `PERMIT_MISSIGNED` three seconds later.
- The signer must be the JWT wallet; a changed wallet mid-plan stops the plan.
- Refuse to sign a `permitTransfer` whose recipient is not `fee.collector` or
  whose token is not `fee.tokenContract`.
- Show the user a readable decode of the action (variant, contract, amounts,
  operator) in your own confirmation step: the wallet prompt shows opaque
  bytes and is not informed consent on its own.

## 4. Tracking an operation

| status                                | meaning                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pending`                             | persisted and accepted by the relayer                                                                                                                                         |
| `batched` → `injecting` → `submitted` | the relayer's progress; the App shows "relaying…"                                                                                                                             |
| `confirmed`                           | this permit executed on chain; interpret success by `intentKind` (top-up, grant or order action). Refresh the relevant balances/feeds; an indexed order row may arrive later. |
| `failed`                              | the chain rejected it; `error` carries the verdict                                                                                                                            |
| `rejected`                            | policy, funding, or our own gates after persistence; `error` carries the verdict                                                                                              |

Typical time to `confirmed` is 20–40 s (the relayer batches every 6 s and waits two blocks). The backend polls the relayer every 5 s and receives its webhook; every row reaches a terminal state without the App. After **10 minutes** non-terminal, show "still processing" with the operation link - not an error; the backend keeps going.

- **Polling**: 3 s until terminal; seed the query cache with the `202` body so
  polling starts without a gap.
- **Socket**: `RELAY_OPERATION_UPDATED` on `channel: "wallet"` carries
  `operationId`, `status`, `opHash`, `permitVariant`, `contractAddress`,
  `intentKind` (not `intent`), `feeChargedUnits`, `error` (`message` may be
  absent), `updatedAt`, `walletAddress`. **Merge into the cached row by
  `updatedAt`, never replace**: progress frames are published too, and a
  terminal frame can repeat with the same status when a later webhook amends
  the fee. Dedupe by `event_id`. While the socket is authenticated, slow the
  poll to 30 s and refetch open operations once on reconnect. Prod and test
  share the relay topic: a frame for an `operationId` you do not know is
  someone else's - ignore it.
- **On `confirmed`**: invalidate open orders, order history, the activity
  summary and the relay list; fee credits and USDT balance for top-ups, and fee credits for order
  outcomes (including free allowance usage and later charge refunds).
- **Inbox**: `relay_failed` and `relay_rejected` rows (entity
  `relay:<operationId>`, payload = the socket body). A confirmed relay is
  never a row - its order row is - and neither is a failure the route answered
  with `retry` (a relayer blip, not the user's news). `event_id` is `null` on
  these rows.
- **After a reload**: `GET …/relay/operations?status=open` on the pages that
  place or list orders; keep polling those ids; block a second operation on
  the same contract client-side with the in-flight copy; toast an unattended
  terminal once per `operationId`. The remaining steps of a plan are not
  resumed automatically - the user re-runs the action and the grant step
  skips itself.

## 5. Errors: `remedy` is the switch

Every relay route answers `{ error, message, remedy, detail? }`. Branch on `remedy`, never on `message`; the code set is open (the Gas Station's codes pass through verbatim) and always carries a `remedy`.

| remedy    | action                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `re-sign` | the permit is unusable (expired, stale counter, consumed): re-read the counter, sign again, **new** idempotency key; at most 2 automatic attempts |
| `retry`   | transient: back off 1 s, 2 s, 4 s with the **same** payload and the same key; at most 3                                                           |
| `give-up` | policy, funding or malformed: surface it; nothing to retry                                                                                        |

Four codes get a UI decision on top of the wire remedy:

| status | code                     | UI                                                                                                                                                                                                         |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 409    | `PERMIT_IN_FLIGHT`       | adopt `detail.operationId` and poll it; on confirmation refresh state instead of duplicating the successful action; retry only if still needed                                                             |
| 402    | `FEE_CREDIT_REQUIRED`    | the **user's** credit is empty: refresh the config, open the top-up, re-run the step with a fresh signature                                                                                                |
| 503    | `RELAY_UNAVAILABLE`      | drain, relayer down, or the **sponsor's** vault is empty: after bounded retries, show gasless unavailable and offer an explicit MVRK choice; do not auto-select it, and reconcile any pending submit first |
| 400    | `CONTRACT_NOT_RELAYABLE` | config drift the gate should have caught: refresh config, explain that gasless is unavailable for this asset/action, and offer an explicit MVRK choice                                                     |

The rest, by code: `SIGNER_MISMATCH` (reconnect the wallet), `KYC_REQUIRED` (send to KYC, inline), `RELAY_QUOTA_EXCEEDED` / `QUOTA_EXCEEDED` (honour `Retry-After`, offer an explicit MVRK choice without bypassing other trading checks), `IDEMPOTENCY_KEY_REUSED`, `INTENT_MISMATCH`, `INVALID_PERMIT`, `UNSUPPORTED_BATCH`, `INVALID_ENTRYPOINT`, `AMOUNT_NOT_ZERO` (client bugs), `SIMULATION_FAILED` (decode the contract error in `message` as on the MVRK path). Refusals before the handler - `401`, the ownership `403`, the per-IP `429` - keep the service-wide `{ error, code }` envelope without a `remedy`: derive it (re-login, give up, retry).

A terminal row carries the verdict in `error{ code, message, remedy }`: `RELAY_SUBMIT_LOST` (our POST never reached the relayer) and `OPERATION_LOST` (the relayer forgot it) both mean `re-sign`; the rest are the relayer's own.

### Fee outcome in failure UI

The Figma failure note distinguishes user shortage from sponsor shortage. Keep the RWA API mapping: user shortage is `402 FEE_CREDIT_REQUIRED`; sponsor funding/availability is surfaced as `503 RELAY_UNAVAILABLE`, not a raw Gas Station `402 INSUFFICIENT_CREDITS`. Never ask the user to buy Credits to repair a sponsor outage.

Read `feeChargedUnits` on terminal operations and apply later `updatedAt` amendments. A positive value means that amount remains charged. OpenAPI defines null as **free or refunded**; the design's shorthand “null means returned” is insufficient for a free action or for a page loaded after the event. Say a specific amount was returned only when a previous charge/refund record proves it. Otherwise use neutral “No service fee retained” after settlement, and refresh credits. Do not hardcode the illustrated 1 USDT refund or infer refund policy from an error code. Distinguishing “never charged” from “refunded” after reload needs additional ledger/settlement data (§9).

## 6. Numbers to pin in the client

| what                               | value                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| default payment method             | gasless; independent of MVRK balance                                       |
| `gaslessThresholdMumav`            | legacy API string; ignored for mode selection                              |
| per-wallet quota                   | 10 relays per minute, 200 per day                                          |
| `?fresh=1` budget on the relay GET | 30 per wallet per minute                                                   |
| `/relay/config` cache              | 30 s server-side; a minute client-side                                     |
| poll interval / socket-backed poll | 3 s / 30 s                                                                 |
| "still processing"                 | 10 min                                                                     |
| in flight                          | one per `(signer, contract)`                                               |
| cancels per permit                 | 10                                                                         |
| `idempotencyKey`                   | 1–128 printable ASCII, no spaces                                           |
| unit-bearing values                | strings everywhere; `tokenId`, `decimals`, `freeAllowanceOps` are integers |

## 7. Things that are not bugs

- The September 22 snapshot reported relay disabled for catalog assets. Read
  current `/relay/config` and action eligibility at runtime; do not hardcode
  that historical deployment state.
- A second permit on the same contract while one is open is a `409` naming
  our operation id, not the relayer's.
- The same terminal status arrives twice on the socket with a different
  `feeChargedUnits`; the later `updatedAt` wins.
- `gasStationOperationId` is `null` on a row whose submit never got a relayer
  id; `intentKind: fee_top_up` appears in lists and never on a submit.
- A confirmed relay makes no inbox row; the order row and its socket frame
  are the news. A failure the route answered with `retry` makes none either.
- `402` and `503` are different people's problems: the user's fee credit
  versus the sponsor's vault. The sponsor's `INSUFFICIENT_CREDITS` never
  reaches the App by name.
- The relay routes are camelCase; `fee` is always an object; additive fields
  appear without notice and must be ignored.

## 8. Acceptance checks for the payment-method update

- [ ] Without a saved explicit preference, gasless is the default with zero, high, or unknown MVRK balance.
- [ ] The user can select MVRK; review shows its estimated network gas and the
      direct action uses the wallet, without submitting a relay or topping up credits.
- [ ] Switching before signing preserves order inputs and refreshes the fee review.
- [ ] Missing/failed config, unsupported contracts, relay outages and quotas explain
      why gasless cannot execute; none silently starts an MVRK-paid transaction.
- [ ] Missing authentication offers sign-in; insufficient/unknown native balance
      prevents an unvalidated direct submission without changing the selected mode.
- [ ] While a relay is pending or its submission outcome is unknown, the same
      intent cannot be sent through the direct path, including after reload.
- [ ] Failed operator grants/top-ups stop the plan. Confirmed setup steps alone
      never display order success; a fresh attempt rechecks current on-chain state.
- [ ] Service-fee UI is absent when disabled and is never applied to direct MVRK gas.
- [ ] Profile Payment Method edits take effect on Save, persist across visits,
      and replace the Credits badge with the Wallet badge in MVRK mode.
- [ ] All five badge variants, dropdown top-up entry and low/empty trade messages
      are driven by real wallet data; free allowance prevents false empty blocking.
- [ ] Top Up defaults to 20; 5/20/50/custom choices obey the agreed unit conversion,
      API bounds and USDT balance; displayed and signed payment amounts match.
- [ ] Pending top-up, minimized tracking, submitted details, confirmed history,
      rejected signing and failed settlement all preserve the user's order inputs.
- [ ] Paid Credits, free allowance, no-fee mode and returned charges are not
      double-counted; null charge does not fabricate a refund amount.

## 9. Design/API decisions required before release

These are gaps found by comparing the October design to the existing contract, not permissions to hardcode mock values or silently change backend behaviour.

| Decision / owner                                   | Evidence and required resolution                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credit unit and tariff - product + Gas Station     | Dev Notes say price is under discussion; frames use 1 Credit = $1 and 1 Credit per order. API exposes USDT `balanceUnits` and per-variant `actionsRemaining`, not a separately denominated Credit balance. Define price, conversion, rounding and behaviour if buy/sell prices differ.                                                                                                 |
| Presets and free allowance - product + Gas Station | Agree 5/20/50/custom 5–100 and 5 initial free Credits with server limits and `freeAllowanceOps`. Confirm whether `actionsRemaining` includes free allowance and how mixed free/paid balances display. The client cannot mint allowance.                                                                                                                                                |
| Fee-on rollout - product + deployment owner        | October design includes prepaid Credits; September plan started fee-off. Implement both runtime states, explicitly configure the intended release; do not infer deployment from the artwork.                                                                                                                                                                                           |
| Saved payment preference - frontend + API          | Figma requires Profile dropdown + Save and restoration across visits. No payment-method persistence field/endpoint was found in the inspected OpenAPI/application handlers. Choose wallet/network-scoped local persistence or add profile persistence for cross-device behaviour; define migration of older choices.                                                                   |
| Fee coverage - product + contracts                 | Confirm whether “platform and network fees” includes existing protocol fees. Until resolved, itemize actual fees and avoid the inclusive claim; relay charging alone does not change the orderbook contract.                                                                                                                                                                           |
| Top-up history - frontend + API                    | Design requires Activity → Transaction History rows. Relay GET provides top-ups; verify feed coverage or implement a paginated adapter/endpoint with stable deduplication.                                                                                                                                                                                                             |
| Refund wording - API + product                     | `feeChargedUnits: null` cannot distinguish free from refunded or recover a prior charge amount. Add settlement/ledger data if exact returned amounts must be shown reliably after reload.                                                                                                                                                                                              |
| Unspecified UI states - design + frontend          | Reviewed section contains desktop frames, a pending top-up widget and a submitted panel with placeholder body. Dedicated mobile layouts, full trade-signing/recovery states, preference-save errors and insufficient-USDT states were not specified there. Implement the safety behaviour in this guide and obtain matching UI/copy; do not treat placeholder text as production copy. |
