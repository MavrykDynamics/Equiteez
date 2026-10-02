# Primary purchases

`BuySellPanel` receives the Trade route's existing `isPrimary` decision
(`asset.profile.lifecycle === "primary_issuance"`). Primary assets use a
route-local `PrimaryPurchasePanel`; secondary assets retain the existing
orderbook form and contract calls.

The primary branch reuses `BuySellScreen`, the fee
summary, and `useContractAction`. Its optional shared-component props have no
effect on secondary trading. It offers a fixed-price Buy flow and automatically uses the cheapest eligible
sale option at the live price, without a dropdown. It does not offer Sell, limit
orders, order expiry, or orderbook depth. Pressing Buy validates the current quote
and proceeds directly to the wallet purchase flow; the confirmation popup remains
exclusive to secondary trading.

## Data and contract boundaries

- `app/contracts/primaryPurchase.config.ts` contains the Basenet launchpad and
  membership deployments from `primary.md`. Other RPC networks fail closed;
  mainnet requires its own deployment configuration.
- `usePrimaryPurchase.ts` discovers the newest active launch name through
  `/assets/{address}/launch`, then reads authoritative contract storage on form
  load, at explicit review, and again before submission. Purchase storage does not
  poll or refetch on window focus/reconnect; launch-card display polling remains
  independent. Display prices
  from the API are never executable prices.
- `primaryPurchase.read.ts` checks the selected asset identity, launch and option
  windows, KYC expiry/freeze/blacklist, registrar-scoped membership and discount,
  and launch/option/per-wallet caps. Taquito `Some` option wrappers are unwrapped.
  Unsupported payment currencies are unavailable. This release supports the
  documented Basenet wUSDT FA2, token ID 0, six decimals, and six-decimal RWA assets.
  Payment keys, launch names, option names, prices, fees, and tiers come from data.
- `primaryPurchase.quote.ts` uses exact integer arithmetic with the contract's
  `1_000_000` divisor and `10_000` basis-point scale. The fee is included in the
  price. The signed operation's `maxTotalPayment` equals the reviewed payment
  exactly. Entering a payment budget finds an affordable raw token amount without
  exceeding caps; entering a token amount checks the inclusive minimum and maximum.
- `primaryPurchase.contract.ts` checks the connected wallet, re-reads the quote
  and limits, and reads the payment balance before estimation/signing. Quote
  changes require another review. It adds the launchpad as a persistent wUSDT
  operator only when needed, then calls `purchase` in the same wallet batch with
  zero MAV attached. It waits for one confirmation. No permits or relay requests
  are used.
- Editing amounts uses local exact quotes and never estimates a contract operation.
  Buy runs one explicit preflight estimation before the wallet batch; the wallet
  may also estimate internally. RPC gateway failures are reported as temporary
  network unavailability, not contract rejections.
- Contract failures are translated into purchase-specific messages. Estimation
  also catches transfer restrictions and paused entrypoints before the wallet
  prompt. A failed submission refreshes the launch before the next attempt.

## RPC 502 investigation (2026-10-02)

The reported `remote http://10.1.63.25:8732 unreachable ... invalid Read on
closed Body` is an HTTP gateway/upstream-node failure. It contains no Michelson
`failwith`; it does not establish that a purchase was rejected by the launchpad.
The internal addresses belong to the RPC infrastructure, not app configuration.

Previously, form entry read chain storage and polled it every ten seconds.
Entering a positive amount scheduled estimation after 400ms, and changed config
could schedule it again. Buy additionally estimated in the form and then again
in `primaryPurchase`. Read/estimate errors flowed into the shared screen's
`Order Cannot Be Submitted` alert, even without a submitted operation.

The fix removes background purchase-storage polling and amount-driven estimation,
uses one explicit Buy preflight, and gives primary failures a purchase-specific
heading and gateway message. Form-entry reads remain intentional per `primary.md`;
review, pre-sign validation, operator checks, exact payment caps and zero-MAV
batching remain. Fees become available after the Buy preflight. Secondary
execution and its alert heading are unchanged.

Configuration checks matched `primary.md`: launchpad
`KT1U6KXwy8vduoq86HBjGp9m2Czc8rZM85MN`, membership
`KT1U6z4YZPswGHcw7xAJsGZn4Wb7CZUKN1HL`, and wUSDT
`KT1Pn5Zpx1bJx5H51btk92pfwvUMCKtp2Q2v`, ID 0, six decimals.
Read-only live checks of the Basenet head and launchpad entrypoints returned HTTP
200. The live purchase schema matched the client's five named fields. No wallet
operation was submitted during investigation.

The original failing request URL and RPC server logs were not available, so the
specific failed read/simulation and the server-side reason its body was closed
cannot be established. The fix removes unnecessary frontend triggers; an actual
RPC outage can still block required reads or Buy and requires the RPC operator
to investigate. There is no evidence that these extra calls caused the upstream
outage itself.

## Confirmation and refresh

Before submission, the primary flow revalidates the launch, option, exact token
amount, payment cap, and included fee without an intermediate popup. AUTO success
reports delivery; MANUAL success and
outstanding allocations report pending distribution.

Confirmation and wallet `LAUNCHPAD_PURCHASE` events invalidate transaction and
activity queries through the existing `fresh=1` mechanism and refresh the launch.
A wallet-scoped portfolio invalidation runs after its 20-second API TTL and
survives route navigation. Existing balance updates still use TzKT.

The primary panel countdown uses the selected `/assets/{address}/launch` card's
`sale_start` and `sale_end`. It counts down to `sale_start` only before the sale,
and stays hidden during and after the sale. Missing, invalid, or reversed dates
hide the countdown without falling back to chain dates. Contract-based purchase
validation remains independent and unchanged. The countdown shows a disabled
Start KYC action for users without `isKyced`, or the existing Deposit Funds
modal trigger for KYC-verified (Pro) users. Both actions use the deposit button
styles, with 16px gaps between title, timer, and action. The interactive overlay
sits above the purchase slider. The primary-only sale summary shares the dynamic
`/assets/{address}/launch` query and active-first selection with the purchase
flow, refreshing every ten seconds and on purchase refresh. It displays
`(max_amount_cap - total_bought) / 10^token.decimals` as Tokens Left (two
decimal places), the decimal-adjusted allocation, and the API
`progress_percent` directly. Loading uses placeholders; missing, invalid, or
failed sale data keeps the layout with unavailable values and an empty bar.

## Validation

`primaryPurchase.test.ts` covers quotes/rounding, membership, windows, caps,
operator batching, wallet/balance changes, revalidation and contract errors.
`PrimaryPurchasePanel.test.tsx` covers amount → Buy → direct purchase → success,
changed-price rejection, absence of amount-driven estimation, and live countdown
timing. `usePrimaryPurchase.test.tsx` verifies form-entry/explicit-refresh reads
without background chain polling. Existing secondary contract,
fee summary, and route classification suites remain applicable.

## Purchase history

Primary asset tabs retain Purchase History. `RPurchaseHistoryTab` uses the
configured authenticated RWA client through the existing transfer-history helper:

```http
GET /wallets/{wallet}/transactions?page=1&per_page=10&sort=date_desc&token_address={asset}&types=deposit
```

The query shares the `fetchWalletTransferHistory` freshness prefix. Existing
purchase confirmation invalidation and wallet `LAUNCHPAD_PURCHASE` events mark
the chain source for `fresh=1`, including confirmation while the tab is unmounted.
Secondary Order History and purchase execution are unchanged. No indexer fallback
or direct indexer requests remain in Purchase History.

The tab displays the returned deposits as incoming asset transactions using
`RAssetHistoryTable`, with server-side date/amount/total sorting and 10-row
pagination. Price and Total use the row's display currency (USD by default),
with null values shown as dashes. Type is Deposit and Status is a dash because
transfer rows provide no purchase status. A note identifies the values as
valuations rather than purchase payments. Truncated responses show an older
history notice. Empty, loading, authentication and retryable error states remain.

Deposits can be ordinary transfers, administrative distributions, or purchase
delivery; they are not verified purchase records. Null hashes are accepted.

### Backend contract required to enable purchase rows

The external RWA service must add a dedicated purchase endpoint or transaction
type (the current API rejects `types=purchase`). This backend is not implemented
in this frontend repository. The contract must provide:

- Stable purchase ID, operation hash, timestamp and purchaser (permit signer).
- Asset address/token ID, launchpad, launch and sale option.
- Exact quantity, payment-token address/ID/decimals, actual total paid including
  the paid fee, and effective unit price. Preserve precision using decimal strings.
- Purchase status and distribution state, including allocations awaiting delivery.
- Wallet/asset filtering, server pagination and date/amount/total sorting; disclose
  truncation and source freshness using the existing API conventions.
- Distinct purchase identity within a batched operation; exclude ordinary deposits,
  admin `setPurchaseRecord` allocations and subsequent distributions from purchases.

Once the backend contract is available, validate it and reuse `RAssetHistoryTable`
for Date (purchase timestamp), Asset (verified token identity), Type (Purchase),
Price (actual total divided by quantity), Amount (purchased quantity), Status
(purchase/distribution state), and Total (actual payment in its payment currency).
Use server pagination and sorting. Do not reuse display-currency valuations as
execution amounts or assume an applied MANUAL purchase was delivered.
