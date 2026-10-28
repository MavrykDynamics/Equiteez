# Gasless trading — backend answers

> Answers from the backend team to frontend integration questions (originally `questions.md`).
> Complements [gasless-trading-integration-guide.md](./gasless-trading-integration-guide.md).

## 1. Does actionsRemaining already include freeAllowanceRemaining, and which actions does the free allowance cover?

Yes. When service fees are enabled, `actionsRemaining` already includes `freeAllowanceRemaining`. RWA Backend proxies these values without recalculating them. The frontend must not add the free allowance again.

For each chargeable permit variant:

```
actionsRemaining[variant] =
  floor(balanceUnits / feeSchedule[variant]) + freeAllowanceRemaining
```

The allowance covers chargeable permit actions in the resolved `feeSchedule`. In the standard configuration, these are `permitPlaceBuyOrder` and `permitPlaceSellOrder`. It is shared per signer: five free actions means any combination of five buy/sell permit actions in total, not five of each.

The prepaid balance is also shared. Each per-variant count describes the capacity for that action using the same balance and allowance. Do not sum buy and sell counts.

Example: a 3 USDT prepaid balance, a 1 USDT buy/sell tariff and two free actions produce `actionsRemaining.permitPlaceBuyOrder = 5` and `actionsRemaining.permitPlaceSellOrder = 5`. This is five available placements in total under that equal-price schedule, not seven or ten. A useful display is “5 Credits available - 2 free”, alongside the 3 USDT prepaid balance.

In the standard schedule, cancellations, refunds, operator updates and other variants absent from `feeSchedule` incur no relay service fee and consume no free allowance. Top-ups do not require existing paid Credits. Read the current schedule: configuration can make another variant chargeable. Do not apply `defaultFeeUnits` to a variant absent from the resolved schedule.

Use the server's allowance, never a hardcoded five. Gas Station's source-code default for `FEE_FREE_ALLOWANCE_OPS` is 0. A successful fee-credits read returns `{ "enabled": false }` when charging is off; a lookup failure is an error, not zero Credits or proof that charging is off.

## 2. What is the price of one Credit? Do buy and sell cost one Credit, and can we keep one Credit balance?

The confirmed current product rule is:

- One Credit initially costs 1 USDT.
- One buy or sell placement should consume one Credit, unless free allowance covers it.
- Gas Station can change the service price, for example to 0.50 USDT per Credit, even if the network transaction costs only 0.01 USDT.

Configurable pricing is already supported. Gas Station exposes a fee schedule per permit variant, and RWA returns the effective schedule through:

```
GET /api/v1/relay/config
```

Read `fee.tokenContract`, `fee.tokenId`, `fee.decimals` and `fee.feeSchedule`. With USDT at six decimals, equal buy/sell prices of `1000000` mean 1 USDT per placement; `500000` mean 0.50 USDT. These are examples of the intended configurations, not evidence of a live deployment's settings. Fees also have to be enabled.

The default schedule gives buy and sell the same price, but the implementation permits independent prices and does not enforce equality. The expected product setup should configure them equally. `defaultFeeUnits` is not a separate public Credit exchange rate: use the resolved per-variant prices.

The backend stores prepaid fee-token units, not an independently denominated Credit currency. The frontend can keep the Credit label for the current equal-price product model:

```
P = common positive buy/sell price in raw fee-token units
paid order capacity = floor(balanceUnits / P)
available order capacity = actionsRemaining[selectedVariant]  // includes free allowance
amountUnits for N purchased Credits = N × P
prepaid token balance = balanceUnits / 10^decimals
```

Use exact decimal/BigInt arithmetic. Show the underlying prepaid USDT balance alongside the available Credit count so rounding remainders remain visible. Keep free allowance separate in the breakdown.

For example, at 0.50 USDT per placement, 20 Credits costs 10 USDT. The actual network cost does not enter this calculation. Refresh the tariff before signing and ask the user to review a changed price or payment amount. API top-up bounds are in token units, so they still apply after converting a Credit preset.

A tariff change changes how many placements an existing monetary balance can fund; it does not convert a stored fixed Credit balance. The current implementation does not lock a historical Credit quantity at purchase time. If the product requires Credits to retain their original quantity regardless of future tariffs, that needs an additional accounting contract.

If buy and sell prices differ in the future, there is no single order-based Credit balance valid for both. Use “Gasless balance: X USDT” and show per-action prices/counts, or define a new product conversion rule first. We do not need to drop the Credit label for the current equal-price model, but must not hardcode “1 Credit = $1” indefinitely. Use the configured fee token rather than assuming every deployment uses USDT, and distinguish token amounts from fiat quotes.

Billing is per extracted chargeable permit action, not per successful order fill. “One Credit per order placement” assumes the normal one-order-per-action flow; it is not a promise about arbitrary nested batches.

The tariff-fetch bug has also been fixed (CRED-1). If no usable tariff can be obtained, RWA returns `503 RELAY_UNAVAILABLE`, `remedy: retry`, `detail.reason: fee_config_unavailable`. It no longer invents `fee.enabled=false` on an outage. Stale tariff data is for display; refresh before signing.

## 3. Will fee_top_up operations appear in the main transaction history, or should the frontend read them from GET /relay/operations?

Yes. It’s implemented in the merged backend, use the main transaction history:

```
GET /api/v1/wallets/{wallet_address}/transactions
GET /api/v1/wallets/{wallet_address}/transactions?types=gas_credit_top_up&page=1&per_page=20
```

The backend reads existing `relay_operations` top-ups, maps them to `type: "gas_credit_top_up"`, and includes them in the feed's shared filtering, sorting and pagination. The frontend does not need to merge two independently paginated histories.

Use these fields:

| Field                                                                                         | Meaning                                                                                   |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `id`                                                                                          | `relay:<operation_id>`; stable row identity                                               |
| `datetime`                                                                                    | Top-up creation time                                                                      |
| `status`                                                                                      | `pending` for all non-terminal states; `confirmed`, `failed` or `rejected` when terminal  |
| `operation_hash`                                                                              | Nullable transaction hash                                                                 |
| `gas_credit_top_up.operation_id`                                                              | RWA operation ID for details/polling                                                      |
| `gas_credit_top_up.relay_status`                                                              | Exact relay state, including `batched`, `injecting` or `submitted`                        |
| `gas_credit_top_up.amount_units`                                                              | Exact submitted token amount, as a decimal string                                         |
| `gas_credit_top_up.token_contract`, `token_id`, `token_decimals`, `token_symbol`, `collector` | Metadata captured on submission; missing metadata remains unknown                         |
| `amount`                                                                                      | Human token amount using recorded decimals; null for legacy rows without the scale        |
| `gas_credit_top_up.credited_units`, `credits_quantity`                                        | Currently null; no authoritative ledger credit or historical Credit quantity is available |
| `gas_credit_top_up.accounting_status`                                                         | `pending` before terminal status, `unknown` afterwards in this implementation             |
| `gas_credit_top_up.metadata_status`                                                           | `complete` or `unknown`; a symbol may still be null when other metadata is complete       |

Do not reconstruct old Credit quantities or missing decimals from today's tariff. A chain-confirmed operation does not certify the fee ledger's credited amount. Refresh `/relay/fee/credits` to obtain the current spendable balance. `price_per_token` is null on service rows; `total` is a quoted display value when available, otherwise null.

The feed uses `page`/`per_page`, not relay cursors. Existing token, type, date, search and sort options apply. `truncated=true` means older history lies outside its bounded source window, so totals are not lifetime counts. Optional `relay_read_at` dates the local SQL projection. After an operation update, refetch history and, if needed, use page 1 with `fresh=1` within the refresh budget.

A related on-chain withdrawal may also remain visible. The backend does not guess transfer identity from a shared batch hash; do not deduplicate all rows with the same hash or count a service row again in transfer/PnL totals.

Continue using `/relay/operations/{operationId}` and `/relay/operations?status=open` for progress and recovery. Before an environment receives the new release/flag, an explicit legacy history fallback can list `/relay/operations` and select `intentKind === "fee_top_up"`. That list accepts `status`, `limit` and `cursor`, but no intent-kind query filter; continue to `nextCursor` even when a page has no top-ups. The fallback is not required once main-history support is active.

## Additional integration updates in this release

- **Saved payment choice is implemented.** Use GET/PUT `/api/v1/wallets/{wallet_address}/payment-preference`; PUT sends `payment_method` (`gasless` or `mvrk`) and `expected_version`. Credits is the display name for `gasless`. New relay operations/top-ups with saved MVRK return `409 PAYMENT_METHOD_MISMATCH`; reread the preference and let the user choose explicitly. Existing operations keep settling and remain readable.
- **Top-ups require a signed deadline.** POST `/relay/fee/top-up` sends `{publicKey, signature, amountUnits, deadline}`. Use the same RFC3339 timestamp with seconds and an explicit offset that was signed. Missing/malformed values return `INVALID_REQUEST` at RWA; Gas Station rejects expired deadlines with `PERMIT_EXPIRED`. Deadline support is already merged in Gas Station PR #10.
- **Public errors are normalized.** Only `FEE_CREDIT_REQUIRED` means user credit shortage and should offer a top-up. Sponsor shortage and infrastructure failures become `RELAY_UNAVAILABLE` with `retry`, consistently across submit, GET/list, socket events and inbox reads. Do not infer user shortage from a generic HTTP 402 or error-message text.
- **Full top-up idempotency remains outstanding.** The top-up endpoint has no client `idempotencyKey`. Track accepted operation IDs and reconcile lost responses/in-flight conflicts before resubmitting. Ordinary relay-submit retry rules cannot be copied blindly to top-up POST.
- **Authoritative accounting remains outstanding.** `feeChargedUnits: null` does not establish a free action, zero retained fee, a refund or settled accounting. Keep unknown values neutral and refresh credits; do not display a fabricated refund or credited quantity from a terminal chain status.
