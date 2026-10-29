# Gasless trading — Equiteez App integration guide

> Source: `Gasless trading - Equiteez App integration guide` (PDF, 21 pages), converted to Markdown.
> Backend answers to follow-up questions: [gasless-trading-backend-answers.md](./gasless-trading-backend-answers.md).
> Asset-wide refunds: [claim-all-asset-refunds.md](./claim-all-asset-refunds.md).

## 0. What it is

A trade without MVRK. The user signs a TZIP-17 permit in the wallet; the App builds the `permitAndExecute` call with Taquito exactly as it builds the MVRK-paying call today, and posts it to the RWA API instead of injecting it. The API validates it (who signed, what variant, against which contract), persists it, and relays it to the Gas Station, whose sponsor vault pays the gas. The App never talks to the Gas Station: the sponsor key lives only in the backend. The operation then moves through the relayer's lifecycle to `confirmed`, `failed` or `rejected`, which the App learns by polling, by a socket frame, and — for the two failures — by an inbox row.

There are two user-selectable paths: **Gasless** (default) and **pay network gas in MVRK**. Gasless uses the relay; MVRK uses the existing direct wallet transaction. Relay eligibility controls whether gasless can execute, not whether a high MVRK balance changes the default. A relay outage must not silently turn a gasless action into a user-paid transaction.

Use the deployed `/relay/config` and registered contract actions to determine availability. Older September deployment snapshots and test-contract addresses are not current rollout instructions. A merged release or a true history flag does not prove that the relay, fee charging or a particular contract is enabled in the running environment.

## 1. The gate

```
GET /api/v1/relay/config        public, cached 30 s (X-Cache: STALE while refreshing)
```

`{ enabled, fee, contracts[], gaslessThresholdMumav }`. `enabled` means relay on, not draining, and at least one catalog contract registered with the relayer. `contracts` lists those contracts, each `{ address, kind (rwa_token | orderbook | quote_token | kyc | launchpad), permitActions[] }`. Unit-bearing fee values are strings.

Treat configuration as known, stale or unavailable:

- A successful response with `fee.enabled=false` means the relay was explicitly disabled or Gas Station confirmed that charging is off. It is the only basis for fee-off UI.
- When an enabled relay cannot obtain a usable tariff, the backend returns `503 RELAY_UNAVAILABLE`, `remedy: retry`, `detail.reason: fee_config_unavailable`. Do not replace that response with `{fee:{enabled:false}}` or show a zero fee.
- The server cache lifetime defaults to 30 seconds, with a stale band identified by `X-Cache: STALE` and `Warning`. A failed refresh does not extend the last confirmed tariff's lifetime. Cached/stale values can remain visible with a stale indication, but refresh conditions before a new signature. Do not use a longer frontend cache to bypass this check.
- A failed fetch or 404 from an older backend makes relay execution unavailable. Keep the saved payment method and offer retry or an explicit MVRK choice; an outage is not a new preference.

### Selection and eligibility are separate

1. Without an explicitly saved preference, start with gasless selected. Do not select MVRK based on a high, low, missing, or still-loading native-token balance. `gaslessThresholdMumav` remains a legacy API field and no longer selects the payment mode.
2. The selector lives in **Portfolio → Profile → Gas Payment → Payment Method**, with Credits selected by default. Choose Credits or MVRK, then Save. A dropdown edit is a draft until Save succeeds; restore the saved preference on subsequent visits. This replaces the earlier proposed form-level toggle. Show the Credits badge in Credits mode and the usual Wallet badge in MVRK mode. Preserve order inputs when applying a saved change. Do not restore an old balance-derived `mav` value as an explicit choice. Load and save the backend preference described below; do not use local storage as its authority.
3. For gasless, require `enabled`, the authenticated wallet session, and the contracts/permit actions needed for this action. Buy/sell need the relevant orderbook action and `permitUpdateOperators` on the quote/RWA token; cancel/refund need only their orderbook action. A loading configuration is not confirmed eligibility. A failed config fetch or 404 disables relay execution, not the user's ability to select MVRK.
4. If gasless is unavailable, show the reason and offer an explicit MVRK choice. Missing authentication should offer sign-in. Never silently change the selected path or overwrite the user's choice because a relay request fails.
5. For MVRK, estimate the direct transaction's network fee and check the wallet's native balance. While the estimate/balance is unknown, do not claim sufficient funds. Insufficient MVRK blocks direct submission with a clear reason; offer gasless if eligible. Relay availability does not gate the direct path; contract, KYC, balance, and order validity checks still apply.

Use **MVRK** in user-facing copy. Existing API fields such as `gaslessThresholdMumav` and existing internal `mav` mode values need not be renamed; this is a UI/product rule, not a wire-schema migration.

### Mode changes and fee review

Show the selected payment method before the wallet prompt. In gasless mode, identify that Equiteez pays network gas. In MVRK mode, show the estimated network fee payable by the user. Keep network gas, orderbook fees and the optional gasless service fee distinct: gasless does not mean that every fee is zero. Fee-credit/top-up controls apply only to gasless when `fee.enabled`.

Lock the path for the running action. Do not execute the same intent via MVRK while its relay outcome is pending or unknown, including after a submit timeout. Recover/reconcile the existing operation first; switching is not a retry. After a terminal failure, refresh order state, balances and fees, then let the user review a fresh action in either eligible mode. A completed operator grant or top-up must not be represented as a completed order.

The confirmed selector placement is Profile settings, not the trade form. Recovery actions may link to that setting; they must not silently save MVRK. A preference change affects new submissions, including permits signed but not yet accepted. Already admitted operations continue; recheck the preference before the next step of a multi-step plan. Save failures retain the last confirmed method and expose a recoverable error.

### Persisted payment preference

```
GET /api/v1/wallets/{wallet}/profile
GET /api/v1/wallets/{wallet}/payment-preference
PUT /api/v1/wallets/{wallet}/payment-preference
```

These owner-only routes use snake_case and `Cache-Control: private, no-store`. The profile response contains `payment_preference`; the narrower GET returns that object directly:

```json
{
  "payment_method": "gasless",
  "source": "default",
  "version": 0,
  "updated_at": null
}
```

A successful read with no saved row returns this default. A failed read is unknown, not a default choice. Display `gasless` as **Credits** and `mvrk` as **MVRK**. Scope frontend state by wallet and backend environment.

On Save, send `{ "payment_method": "mvrk", "expected_version": 0 }` using the version from the last successful read. Apply the returned preference only after 200. On `409 PAYMENT_PREFERENCE_CONFLICT` or a lost Save response, GET again and let the user review the current value before another Save; never silently overwrite another tab's choice. The profile routes use the standard `{error, code}` error envelope.

New relay submissions and gasless top-ups require the saved method to be `gasless`. With `mvrk`, they return `409 PAYMENT_METHOD_MISMATCH`, `remedy: give-up`, `detail.payment_method: mvrk`; refresh the preference and obtain an explicit choice. An unavailable preference returns `503 RELAY_UNAVAILABLE`. Reads and settlement remain available in either mode. An identical ordinary-operation idempotency replay can recover an already admitted operation after switching to MVRK, subject to the existing structural checks and drain gate.

## 1.1. Figma screens → frontend behaviour

All node IDs below belong to the linked Gasless Trading section. “Credits” is the product name for order-placement capacity at the current tariff; the API stores prepaid fee-token units and reports per-variant action counts. There is no separately denominated Credit ledger. Do not rename wire fields or treat one raw token unit as one Credit.

| Surface / Figma node                                                                | Required integration                                                                                                                                                                     |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile settings `7287:40301`, Gas Payment `7287:40339`                             | Payment Method dropdown + Save; default Credits, explicit persisted MVRK option. Render the appropriate header badge after saving.                                                       |
| Badge variants `6695:57617`, `6695:57664`, `6695:57703`, `6695:57742`, `6695:57780` | Healthy, low, empty, adding, and free-allowance states; fetch credits for the authenticated wallet and reset the cache on wallet/network changes.                                        |
| Badge dropdown `6759:61459`                                                         | Credits Balance, amount/value, Add Credits, Portfolio, Change Account, Sign Out. Add Credits opens the same modal used by the trade panel.                                               |
| Order summary / empty warning `6771:62245`; low warning `6774:63894`                | Credit line with count and monetary equivalent; inline Top Up link. Low balance is a warning, insufficient effective allowance blocks only chargeable gasless orders.                    |
| Add Trading Credit `6745:59561`, modal in context `6773:63144`                      | Wallet USDT balance, 5/20/50 presets, Custom, exact USDT authorization amount, non-withdrawable disclosure, Cancel and Add Credits.                                                      |
| Adding progress `6758:61383`                                                        | Compact “Adding N Credits” / “Buying Credits” progress; pending balance must not become spendable before confirmation and credit refresh.                                                |
| Submitted panel `6758:60611`                                                        | “Transaction Submitted”, “Minimize And Continue Browsing”, “View Details”; replace placeholder paragraph with actual status. The layer name `confirmed` is not a backend status mapping. |
| Activity → Transaction History `6776:65284`                                         | Top Up row: Gas Credits / USDT, amount, Gas Station interaction, transaction hash and real status.                                                                                       |
| Failure guidance `7287:39728`                                                       | Distinguish user credit shortage from sponsor outage; show whether a charge remains, without inferring a refund from an ambiguous null.                                                  |

### Credits badge and trade-panel states

The design specifies green for more than 2 Credits, yellow for 1–2, red for 0 with Add Credits, grey animated Adding N Credits, and blue N Free Credits (5 initially in the design). Apply low/empty thresholds to available order-placement capacity at the current tariff, including free allowance, not raw `balanceUnits`. An unknown balance is a loading/error state, never “0 Credits”. Pending top-up is an overlay on the confirmed balance; it does not erase existing spendable credits.

`actionsRemaining[variant]` already includes `freeAllowanceRemaining`:

```
actionsRemaining[variant] = floor(balanceUnits / feeSchedule[variant]) + freeAllowanceRemaining
```

This formula applies to chargeable variants. Use the returned count for eligibility; do not add the free allowance again or add buy and sell counts together. Both spend the same prepaid balance and shared per-signer allowance. In the standard schedule, free allowance covers buy/sell permit actions; variants absent from `feeSchedule` are free and consume no allowance. The resolved schedule is authoritative; `defaultFeeUnits` is not a fallback for absent variants.

For equal positive buy/sell prices, show one available Credit count with a separate “N free” breakdown. Paid order capacity is `floor(balanceUnits / commonPriceUnits)`; show the prepaid token balance alongside it so any remainder stays visible. The price can change this capacity without changing `balanceUnits`. If buy/sell prices differ, display the prepaid USDT balance and action-specific counts/prices instead of choosing one arbitrary Credit conversion.

Use `freeAllowanceRemaining` for the free count; never grant five locally or reset it on refresh, sign-in or account switching. `FEE_FREE_ALLOWANCE_OPS` defaults to 0 in Gas Station. An empty paid balance with usable free allowance must not force a top-up.

Trade-panel copy from the design:

- Low: “Running low on Credits. Please Top Up your balance.”
- Empty: “You’re out of Credits. Please Top Up your balance.”

Keep the form intact when opening/closing Top Up. Cancels, refunds, operator grants and top-ups are free in the intended schedule; lack of paid Credits must not block them. Check current pricing by permit variant, not a global “credit balance is zero” gate. In MVRK mode hide Credits spending controls and warnings; retained credits are neither discarded nor cashed out by switching.

### Top-up interaction and amounts

Design defaults: 20 selected, presets 5 / 20 / 50, custom 5–100, no cap on the accumulated balance. Reopening starts at 20. Treat these choices as Credit quantities and label the monetary payment separately. With equal buy/sell price `P` in raw fee-token units, buying `N` Credits authorizes `amountUnits = N × P`. At 1 USDT per Credit, 20 Credits costs 20 USDT; at 0.50 USDT, it costs 10 USDT. This is capacity at the reviewed tariff, not an immutable denomination recorded by the backend. API bounds and wallet funds still restrict the available choices.

Show the wallet balance for `fee.tokenContract` / `fee.tokenId`, not total portfolio value. Use USDT labels only when that is the configured fee token; otherwise display its verified symbol. Calculate `amountUnits` with exact decimal arithmetic and `fee.decimals`; validate it against `topUpMinUnits..topUpMaxUnits` and wallet funds. Disable invalid/unaffordable choices, including a default preset that cannot be funded. Never silently reduce the authorized amount. The displayed “You're authorizing one payment of exactly {amount} USDT” must match the signed transfer and POST amount. Refresh configuration before signing; changed price or bounds require a revised review. Do not hardcode the current 1 USDT tariff or equate USDT with an exact fiat-dollar quote.

Cancel/close before signing returns to the unchanged order. Wallet rejection leaves credits unchanged. After submission, closing/minimizing only dismisses the panel: keep tracking the operation and the pending badge. On confirmed, refresh fee credits and USDT balance; while the credit read has not caught up, keep an updating state rather than inventing the new balance. A failure shows a recoverable state with the original order preserved. The same top-up is not sent twice merely because the user reopens the modal or reloads the page.

Credits are prepaid and cannot be withdrawn. A charge returned after an order failure is restored to the credit balance; it is not a USDT withdrawal to the wallet. Top-up confirmation is not order placement: resuming a trade still requires its remaining signatures and a valid order review.

### Order summary, progress and history

Show the Credit row and its monetary equivalent for a chargeable gasless order, deriving the charge from the current variant schedule and allowance. The confirmed current product rule is one Credit per buy/sell placement at an intended price of 1 USDT; use the actual positive `feeSchedule` value, and show when free allowance covers the action. The prepaid debit must not be counted again as a new wallet USDT transfer in the order total. Separate the amount needed for this order from credit already purchased. Do not reproduce the sample $10,000.01 total beside a $1.00 credit line as a calculation rule.

The artwork says Credits cover “platform and network fees”. Existing protocol fees are independent of relay charges: do not remove them or promise that wording until fee coverage is confirmed (§9). When `fee.enabled` is false, skip paid-credit reads/top-ups/warnings and show sponsor-paid network gas; retain the user's gasless/MVRK preference.

A submitted panel can appear once the backend has accepted the operation; “View Details” opens internal operation details until an `opHash` exists, then may offer the explorer. Minimize keeps tracking active. For a multi-step trade, distinguish wallet signing, relay processing and confirmed setup from confirmed order placement. A placed order is not necessarily a filled order. The generic submitted frame does not replace the sequential permit rules in §3.

Populate Activity → Transaction History from the main `/transactions` endpoint, which now includes `gas_credit_top_up` with the rollout flag enabled (§2). Keep `/relay/operations` for operation tracking and recovery. The frontend does not need to merge two independently paginated feeds. Do not create a successful relay inbox notification solely to populate history.

## 2. Endpoints

```
POST /api/v1/wallets/{wallet}/relay/operations          { intent, operation, idempotencyKey?, permitCounter? } → 202
GET  /api/v1/wallets/{wallet}/relay/operations/{id}?fresh=1
GET  /api/v1/wallets/{wallet}/relay/operations?status=open&limit=20&cursor=
POST /api/v1/wallets/{wallet}/relay/fee/top-up          { publicKey, signature, amountUnits, deadline } → 202   (fee on only)
GET  /api/v1/wallets/{wallet}/relay/fee/credits         → { enabled: false } while fees are off
```

Wallet-bound (403 for another wallet's path). These relay routes use camelCase. Profile and main transaction history use snake_case.

### Submit

`operation` is the `TransferParams` Taquito's `toTransferParams()` produced for `permitAndExecute`: `{ to, parameter: { entrypoint: "permitAndExecute", value } }`, a one-element permit list whose item fields follow the deployed entrypoint schema. Current deadline-bearing contracts require `userPublicKey`, `userSignature`, `action`, `deadline`; legacy three-field contracts remain supported by the ordinary submit route. Flat and right-comb Pair encodings are accepted. The signed deadline is inside `operation.parameter.value`, not a top-level field on this request. `amount` may be omitted, `0` or `"0"`; anything else is `400 AMOUNT_NOT_ZERO`.

`intent` says what the permit does; the backend decodes the Michelson and refuses a mismatch (`400 INTENT_MISMATCH`):

| `intent.kind`                          | Typed fields                                                                                                      | Permit variant                                 | Contract    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| `place_buy_order` / `place_sell_order` | `orderbookAddress`, `rwaTokenAmount`, `pricePerRwaToken`, `currency`, `orderExpiry`, `isMarketOrder`              | `permitPlaceBuyOrder` / `permitPlaceSellOrder` | orderbook   |
| `cancel_orders`                        | `orderbookAddress`, `orders[{ orderId, orderType }]` (1–10, one orderbook)                                        | `permitCancelOrders`                           | orderbook   |
| `process_refund`                       | `orderbookAddress` and either legacy `orderId`/`orderType` or `orders[{ orderId, orderType }]` (1–100; no mixing) | `permitProcessRefund`                          | orderbook   |
| `update_operators`                     | `tokenAddress`, `tokenId`, `operator` (the token's own allowlisted orderbook)                                     | `permitUpdateOperators`                        | token       |
| `fee_top_up`                           | read-only: appears on GET rows written by the top-up route; refused on submit                                     | `permitTransfer`                               | quote token |

Amounts and ids are raw nat decimal strings. `to` must equal the intent's `orderbookAddress` / `tokenAddress`. No literal inside the action may name an address outside the wallet and the catalog (a contract-agnostic guard; the operator of an `update_operators` is the one exception it knows).

Gates run in this order and each answers before any gas is spent:

1. drain switch (`503 RELAY_UNAVAILABLE`);
2. entrypoint and zero amount;
3. contract in the catalog and registered (`400 CONTRACT_NOT_RELAYABLE`, `detail.reason = not_in_catalog | not_registered | old_generation`);
4. exactly one permit in the list;
5. `%userPublicKey` derives to the JWT wallet (`403 SIGNER_MISMATCH`);
6. intent ↔ variant ↔ contract agreement (`400 INTENT_MISMATCH`);
7. saved payment preference (`409 PAYMENT_METHOD_MISMATCH`);
8. KYC (`403 KYC_REQUIRED`);
9. per-wallet quotas (`429 RELAY_QUOTA_EXCEEDED`, `Retry-After` in seconds).

The row is persisted before the relayer is called. **One permit may be in flight per (signer, contract)**: a second one is `409 PERMIT_IN_FLIGHT` with `detail.operationId`, which is our id — poll it. `idempotencyKey` is one per user click (1–128 printable ASCII): the same payload again replays the stored ids with 202; a different payload under the same key is `409 IDEMPOTENCY_KEY_REUSED`. `permitCounter` is optional and stored for diagnosis only.

`202 → { operationId, gasStationOperationId, status: "pending" }`. Poll our `operationId`, never the relayer's.

### Read

`GET …/relay/operations/{id}`: our row, a superset of the socket payload — `status`, `intent` (as submitted) and `intentKind`, `permitVariant`, `contractAddress`, `opHash`, `feeChargedUnits`, `error`, `createdAt`, `updatedAt`, `settledAt`. Poll every 3 s without `fresh=1` and stop on a terminal status. `?fresh=1` forces one relayer poll for a non-terminal row on its own per-wallet budget (30 per minute) — use it only behind a “check now” action, and read `X-Cache-Bypass`: `fresh`, `limited` (budget spent, stored row) or `stale-fallback` (relayer silent, stored row). Another wallet's id reads as 404.

`GET …/relay/operations?status=&limit=&cursor=`: newest first, keyset-paged (`{ items, nextCursor }`, follow until null); `status` takes the enum plus `open` (every non-terminal), repeated or comma-separated; `limit ≤ 100`.

### Fee and top-up

Skip paid-fee controls only when a successful configuration response establishes `fee.enabled=false`; keep existing history and in-flight tracking. The top-up route forwards a signed `permitTransfer` to `fee.collector`. Gas Station rebuilds the transfer from its configuration; send exactly these fields:

```json
{
  "publicKey": "<wallet public key>",
  "signature": "<signature over the transfer and deadline>",
  "amountUnits": "20000000",
  "deadline": "2026-11-01T15:00:00Z"
}
```

The amount and timestamp are illustrative. Calculate the amount from the reviewed tariff and choose a fresh deadline when signing. **`deadline` is required, must be RFC3339 with seconds and an explicit offset (`Z` or `±HH:MM`), and must be the same value included in the signed payload.** Missing/malformed values return `400 INVALID_REQUEST` at RWA; bare epoch strings are not accepted by this top-up API. Gas Station rejects an elapsed deadline with `400 PERMIT_EXPIRED` (re-sign). Use a deadline-capable deployed fee-token contract; this route has no legacy three-field top-up mode.

`amountUnits` must be a decimal integer string in `fee.topUpMinUnits..topUpMaxUnits` (`400 AMOUNT_OUT_OF_BOUNDS`). Confirmed fee-off returns `404 FEE_DISABLED`; unavailable tariff returns `503 RELAY_UNAVAILABLE` with `detail.reason: fee_config_unavailable`. The saved method must be gasless.

The 202 top-up response contains `{ operationId, gasStationOperationId, signerAddress, amountUnits }`; unlike ordinary submit it has no `status` field. Poll the returned RWA `operationId`. A top-up occupies the quote token's one-in-flight slot, shared with operator grants. On confirmation re-read credits and the wallet token balance; do not derive credited units from chain status alone.

This endpoint does not accept `idempotencyKey` yet (CRED-3). Never apply ordinary-submit automatic POST retries to a top-up. Persist an accepted operation ID and recover through GET/list after a lost response or reload; `PERMIT_IN_FLIGHT` supplies an existing ID to inspect, which may belong to an operator grant. A conflict is not proof that the same top-up succeeded. Resolve an uncertain submission before asking for a new signature or sending another top-up.

`GET …/relay/fee/credits` returns `{enabled:false}` when fees are confirmed off; otherwise it proxies the authoritative Gas Station balance, decimals, per-variant `actionsRemaining`, `freeAllowanceRemaining` and lifetime amounts. Failure is an unavailable state, not a zero balance. Only `FEE_CREDIT_REQUIRED` should offer a credit-shortage top-up CTA.

### Top-ups in the main transaction history

```
GET /api/v1/wallets/{wallet}/transactions?page=1&per_page=20
GET /api/v1/wallets/{wallet}/transactions?types=gas_credit_top_up&page=1&per_page=20
```

With `GAS_STATION_TOP_UP_HISTORY_ENABLED=true`, the backend merges top-up records with the existing feed before shared filtering, sorting and pagination. Both test and production Helm values enable this flag for the upcoming rollout. It remains false when omitted from backend configuration. No separate frontend history merge is required after deployment.

| Field                                                                                         | Meaning / display                                                                                                                     |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                                                                                        | `gas_credit_top_up`; handle as a service top-up, not an order                                                                         |
| `id`                                                                                          | Stable `relay:<operation_id>`; use this identity, not the operation hash, for the row key                                             |
| `datetime`, `operation_hash`                                                                  | Creation time; hash is nullable until known                                                                                           |
| `status`                                                                                      | `pending` for any non-terminal relay state; terminal `confirmed`, `failed` or `rejected`                                              |
| `gas_credit_top_up.relay_status`                                                              | Exact relay state, including `batched`, `injecting` and `submitted`                                                                   |
| `gas_credit_top_up.amount_units`                                                              | Exact submitted fee-token amount as a decimal string                                                                                  |
| `gas_credit_top_up.token_contract`, `token_id`, `token_decimals`, `token_symbol`, `collector` | Submission-time metadata; fields may be null when not known, and symbol remains optional even with complete metadata                  |
| `amount`                                                                                      | Human token amount using recorded decimals; null on legacy rows without that scale. Use raw units for accounting                      |
| `price_per_token`, `total`, `currency`                                                        | Price is null for this service row; total is a quoted display value when available, otherwise null, in the requested display currency |
| `gas_credit_top_up.credited_units`, `credits_quantity`                                        | Currently null; the backend cannot certify ledger credit or a historical Credit quantity                                              |
| `gas_credit_top_up.accounting_status`                                                         | Currently `pending` before a terminal chain status and `unknown` afterwards; `settled` is reserved for authoritative accounting       |
| `gas_credit_top_up.metadata_status`                                                           | `complete` or `unknown`; never fill missing historical metadata from today's fee configuration                                        |

The existing `token_address`, `types`, `from`, `to`, `search`, `sort`, `page` and `per_page` options apply. This is page-based history, unlike the relay list's cursor pagination. `truncated=true` means the bounded source window omits older history; `total` is not a lifetime count. Optional `relay_read_at` dates the SQL projection, not an indexer head. Respect stale headers and refetch page 1 with `fresh=1` after an update if necessary, within the endpoint's refresh budget.

A related on-chain USDT withdrawal can also remain visible: the backend does not delete transfers by matching a shared batch hash. Do not deduplicate unrelated rows by hash or count the service row again in transfers, net inflow or PnL. On confirmation, refresh credits; a confirmed history row does not establish `credited_units` or a refund.

Before the release/flag reaches an environment, an explicit legacy fallback can read `GET …/relay/operations` and filter `intentKind === "fee_top_up"`. It has no intent-kind query filter: traverse `nextCursor` even if a page contains no top-ups. Do not use both sources as duplicate entries in the same activity feed.

## 3. Flows

The permit flows below apply to gasless. Selecting MVRK dispatches the existing direct contract action through the wallet, with native gas estimation and direct-operation tracking; it must not call relay submit or fee top-up. Both paths must retain the same order intent and business validation.

**Cancel and refund** are one permit each and free in the standard schedule, with no operator step; check the resolved schedule for the actual charge. Up to 10 cancels of one orderbook go into one `permitCancelOrders` action — one signature, one relay, one counter consumed. Refund keeps claimable-order gating. For asset-wide discovery, multi-order payloads and bounded sequential parts, see [claim-all-asset-refunds.md](./claim-all-asset-refunds.md).

**Buy and sell** are sequential relays, because a permit is one operation and the slot is one per contract: first `permitUpdateOperators` on the quote token (buy) or the RWA token (sell), granting the orderbook, then `permitPlaceBuyOrder` / `permitPlaceSellOrder` on the orderbook. The grant is persistent — there is no revoke step — so skip it whenever the token already lists the orderbook as operator (the FA2 `is_operator` view; fall back to the operators big map, and to “not granted” as the worst case, which costs one free step and never a missed one). A fresh wallet signs twice, a returning one once. With the fee on, a top-up may precede the order.

Wait for `confirmed` before the next step: the top-up and the operator grant both consume the quote token's counter, and the backend serialises them (`409 PERMIT_IN_FLIGHT` otherwise). Never fan out permits on one contract. A failed or rejected step stops the plan; terminal alone is not permission to continue.

Signing rules the backend cannot enforce for you:

- Read the `%action` type from the live script, the counter from the contract immediately before signing, the chain id from the node; hash with `blake2b(pack(action))`; the packed payload starts with `05`.
- If the live entrypoint carries `%deadline`, include it in both the signed payload and the permit item. Ordinary submits accept a Michelson integer timestamp or RFC3339 string matching the schema; top-up JSON requires RFC3339.
- Never add, remove or regenerate a deadline after signing. A shape mismatch returns `INVALID_PERMIT`; expiry/signature checks remain with Gas Station/the chain.
- Verify the signature locally with the signer's supported key algorithm before posting; a wallet that alters the bytes shows up here, not as a `PERMIT_MISSIGNED` three seconds later.
- The signer must be the JWT wallet; a changed wallet mid-plan stops the plan.
- Refuse to sign a `permitTransfer` whose recipient is not `fee.collector` or whose token is not `fee.tokenContract`.
- Show the user a readable decode of the action (variant, contract, amounts, operator) in your own confirmation step: the wallet prompt shows opaque bytes and is not informed consent on its own.

## 4. Tracking an operation

| Status                                | Meaning                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pending`                             | Persisted and awaiting progress; the relayer ID may still be unknown during submit recovery                                                                                   |
| `batched` → `injecting` → `submitted` | The relayer's progress; the App shows “relaying…”                                                                                                                             |
| `confirmed`                           | This permit executed on chain; interpret success by `intentKind` (top-up, grant or order action). Refresh the relevant balances/feeds; an indexed order row may arrive later. |
| `failed`                              | The chain rejected it; `error` carries the verdict                                                                                                                            |
| `rejected`                            | Policy, funding, or our own gates after persistence; `error` carries the verdict                                                                                              |

Typical time to `confirmed` is 20–40 s (the relayer batches every 6 s and waits two blocks). The backend polls the relayer every 5 s and receives its webhook; every row reaches a terminal state without the App. After 10 minutes non-terminal, show “still processing” with the operation link — not an error; the backend keeps going.

- **Polling:** 3 s until terminal. Store the 202 identifiers immediately and fetch the full operation; acceptance responses are not complete GET rows, and the top-up response does not include a status.
- **Socket:** `RELAY_OPERATION_UPDATED` on `channel: "wallet"` carries `operationId`, `status`, `opHash`, `permitVariant`, `contractAddress`, `intentKind` (not `intent`), `feeChargedUnits`, `error` (`message` may be absent), `updatedAt`, `walletAddress`. Merge into the cached row by `updatedAt`, never replace: progress frames are published too, and a terminal frame can repeat with the same status when a later webhook amends the fee. Dedupe by `event_id`. While the socket is authenticated, slow the poll to 30 s and refetch open operations once on reconnect. Prod and test share the relay topic: a frame for an `operationId` you do not know is someone else's — ignore it.
- **On updates:** invalidate transaction history and relay queries on top-up progress, terminal outcomes and late amendments. On `confirmed`, also refresh open orders, order history and the activity summary as relevant to the intent. Refresh fee credits on chargeable-order outcomes and later fee amendments; refresh credits and the wallet fee-token balance after a top-up confirmation.
- **Inbox:** `relay_failed` and `relay_rejected` rows (entity `relay:<operationId>`, payload = the socket body). A confirmed relay is never a row — its order row is — and neither is a failure the route answered with `retry` (a relayer blip, not the user's news). `event_id` is null on these rows.
- **After a reload:** `GET …/relay/operations?status=open` on the pages that place or list orders; keep polling those ids; block a second operation on the same contract client-side with the in-flight copy; toast an unattended terminal once per `operationId`. The remaining steps of a plan are not resumed automatically — the user re-runs the action and the grant step skips itself.

## 5. Errors: `remedy` is the switch

Relay handler failures use `{error, message, remedy, detail?}`. Branch on the public code for UI meaning and on `remedy` for retry behaviour; never parse `message`. The common mapper now applies to REST submit, operation GET/list, newly published socket events and inbox reads, including older stored inbox payloads. Sponsor shortage and infrastructure failures normalize to `RELAY_UNAVAILABLE`; actionable permit/policy codes remain an open set. Raw upstream errors stay in backend diagnostics.

| `remedy`  | Action                                                                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `re-sign` | Reconcile the previous outcome, refresh counter/deadline/conditions, then request a new signature. Use a new idempotency key for ordinary submit; top-up has no key. Bound recovery attempts and preserve user review. |
| `retry`   | For safe reads, back off 1 s, 2 s, 4 s; for ordinary submit, retain the same payload and idempotency key; at most 3. Top-up POST needs operation recovery first because it has no client idempotency key.              |
| `give-up` | Policy, funding or malformed: surface it; nothing to retry.                                                                                                                                                            |

These codes require a UI decision in addition to the wire remedy:

| Status / code                 | UI                                                                                                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `409 PAYMENT_METHOD_MISMATCH` | Refetch the saved preference and let the user explicitly review/change it; never auto-save gasless or fall back to MVRK                                                                                                             |
| `409 PERMIT_IN_FLIGHT`        | Adopt `detail.operationId` and poll it; on confirmation refresh state instead of duplicating the successful action; retry only if still needed                                                                                      |
| `402 FEE_CREDIT_REQUIRED`     | The user's effective credit is insufficient for this action: refresh the config, open the top-up, re-run the step with a fresh signature                                                                                            |
| `503 RELAY_UNAVAILABLE`       | Drain, unknown tariff/preference, relayer failure or the sponsor's vault is empty: after bounded retries, show gasless unavailable and offer an explicit MVRK choice; do not auto-select it, and reconcile any pending submit first |
| `400 CONTRACT_NOT_RELAYABLE`  | Config drift the gate should have caught: refresh config, explain that gasless is unavailable for this asset/action, and offer an explicit MVRK choice                                                                              |

The rest, by code: `SIGNER_MISMATCH` (reconnect the wallet), `KYC_REQUIRED` (send to KYC, inline), `RELAY_QUOTA_EXCEEDED` / `QUOTA_EXCEEDED` (honour `Retry-After`, offer an explicit MVRK choice without bypassing other trading checks), `IDEMPOTENCY_KEY_REUSED`, `INTENT_MISMATCH`, `INVALID_PERMIT`, `UNSUPPORTED_BATCH`, `INVALID_ENTRYPOINT`, `AMOUNT_NOT_ZERO` (client bugs), `SIMULATION_FAILED` (show the readable failure and refresh action state; do not parse message text as a stable API). Refusals before the handler — 401, the ownership 403, the per-IP 429 — keep the service-wide `{ error, code }` envelope without a remedy: derive it (re-login, give up, retry).

A terminal row carries the verdict in `error{ code, message, remedy }`: `RELAY_SUBMIT_LOST` (our POST never reached the relayer) and `OPERATION_LOST` (the relayer forgot it) both mean re-sign; other errors use the same public normalization as submit. Preserve the terminal operation status even when its error remedy is `retry`; `retry` is not a request to keep polling a terminal row forever.

### Fee outcome in failure UI

The Figma failure note distinguishes user shortage from sponsor shortage. Keep the RWA API mapping: user shortage is `402 FEE_CREDIT_REQUIRED`; sponsor funding/availability is surfaced as `503 RELAY_UNAVAILABLE`, not a raw Gas Station `402 INSUFFICIENT_CREDITS`. Never ask the user to buy Credits to repair a sponsor outage.

`feeChargedUnits` is a legacy observed quote-token charge, not a complete settlement ledger. Preserve later `updatedAt` amendments. A positive value is the latest reported charge; it is not a promise that no later amendment will arrive. Null means unknown accounting: it does not prove a free action, a refund, zero retained fee or completed settlement. Even a prior positive value followed by null does not certify a refund amount.

Use neutral copy such as “Fee accounting unavailable” when no authoritative result exists and refresh credits. Do not display “No service fee retained”, “1 USDT returned” or “N Credits credited” from a null field or terminal chain status. The history fields `credited_units` and `credits_quantity` also remain null. Exact charge/refund/credit outcomes require the outstanding CRED-5 accounting contract.

## 6. Numbers to pin in the client

| What                               | Value                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| Default payment method             | gasless; independent of MVRK balance                                                 |
| `gaslessThresholdMumav`            | legacy API string; ignored for mode selection                                        |
| Per-wallet quota                   | 10 relays per minute, 200 per day                                                    |
| `?fresh=1` budget on the relay GET | 30 per wallet per minute                                                             |
| `/relay/config` cache              | 30 s total server lifetime by default; stale is display-only, refresh before signing |
| Poll interval / socket-backed poll | 3 s / 30 s                                                                           |
| “Still processing”                 | 10 min                                                                               |
| In flight                          | one per (signer, contract)                                                           |
| Cancels per permit                 | 10                                                                                   |
| `idempotencyKey`                   | 1–128 printable ASCII, no spaces                                                     |
| Unit-bearing values                | strings everywhere; `tokenId`, `decimals`, `freeAllowanceOps` are integers           |

## 7. Things that are not bugs

- Merged code and enabled history do not imply live relay/fee availability. Read `/relay/config` and action eligibility at runtime.
- A second permit on the same contract while one is open is a 409 naming our operation id, not the relayer's.
- The same terminal status arrives twice on the socket with a different `feeChargedUnits`; the later `updatedAt` wins.
- `gasStationOperationId` is null on a row whose submit never got a relayer id; `intentKind: fee_top_up` appears in lists and never on a submit.
- A confirmed relay makes no inbox row; the order row and its socket frame are the news. A failure the route answered with `retry` makes none either.
- 402 and 503 are different people's problems: the user's fee credit versus the sponsor's vault. The sponsor's `INSUFFICIENT_CREDITS` never reaches the App by name.
- The relay routes are camelCase; `fee` is always an object; additive fields appear without notice and must be ignored.

## 8. Frontend acceptance checks for this release

- Without a saved explicit preference, gasless is the default with zero, high, or unknown MVRK balance.
- The user can select MVRK; review shows its estimated network gas and the direct action uses the wallet, without submitting a relay or topping up credits.
- Switching before signing preserves order inputs and refreshes the fee review.
- Missing/failed config, unsupported contracts, relay outages and quotas explain why gasless cannot execute; none silently starts an MVRK-paid transaction.
- Missing authentication offers sign-in; insufficient/unknown native balance prevents an unvalidated direct submission without changing the selected mode.
- While a relay is pending or its submission outcome is unknown, the same intent cannot be sent through the direct path, including after reload.
- Failed operator grants/top-ups stop the plan. Confirmed setup steps alone never display order success; a fresh attempt rechecks current on-chain state.
- Service-fee UI is absent when disabled and is never applied to direct MVRK gas.
- Profile Payment Method edits take effect on Save, persist across visits, and replace the Credits badge with the Wallet badge in MVRK mode.
- All five badge variants, dropdown top-up entry and low/empty trade messages are driven by real wallet data; free allowance prevents false empty blocking.
- Top Up defaults to 20; 5/20/50/custom choices obey the agreed unit conversion, API bounds and USDT balance; displayed and signed payment amounts match.
- Pending top-up, minimized tracking, submitted details, confirmed history, rejected signing and failed settlement all preserve the user's order inputs.
- `actionsRemaining` includes free allowance exactly once; buy/sell counts are not summed. A 0.50 USDT tariff correctly prices 20 Credits at 10 USDT.
- A config timeout/503 never becomes fee-off or zero price; stale data cannot authorize a new signature.
- Preference conflicts and `PAYMENT_METHOD_MISMATCH` cause a reread and explicit review, including between signed-but-unsubmitted steps.
- A top-up signs/posts the same RFC3339 deadline; malformed/expired values are handled without editing a signature's payload.
- Top-up POST is not retried blindly after a lost response; accepted/in-flight IDs are reconciled first.
- Main history renders `gas_credit_top_up`, all its lifecycle states, nullable metadata/amounts, shared pagination and `truncated` without a second client-side feed merge.
- Null charge/credited quantities remain unknown, including after reload; no refund, zero fee or credit amount is fabricated from chain confirmation.
