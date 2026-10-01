# Primary purchases

`BuySellPanel` receives the Trade route's existing `isPrimary` decision
(`asset.profile.lifecycle === "primary_issuance"`). Primary assets use a
route-local `PrimaryPurchasePanel`; secondary assets retain the existing
orderbook form and contract calls.

The primary branch reuses `BuySellScreen`, `TradeConfirmationPopup`, the fee
summary, and `useContractAction`. Its optional shared-component props have no
effect on secondary trading. It offers a fixed-price Buy flow and automatically uses the cheapest eligible
sale option at the live price, without a dropdown. It does not offer Sell, limit
orders, order expiry, or orderbook depth.

## Data and contract boundaries

- `app/contracts/primaryPurchase.config.ts` contains the Basenet launchpad and
  membership deployments from `primary.md`. Other RPC networks fail closed;
  mainnet requires its own deployment configuration.
- `usePrimaryPurchase.ts` discovers the newest active launch name through
  `/assets/{address}/launch`, then reads authoritative contract storage on form
  load, every ten seconds, at review, and again before submission. Display prices
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
- Contract failures are translated into purchase-specific messages. Estimation
  also catches transfer restrictions and paused entrypoints before the wallet
  prompt. A failed submission refreshes the launch before the next attempt.

## Confirmation and refresh

Each purchase confirmation shows the launch, option, exact token amount,
payment cap, and included fee. AUTO success reports delivery; MANUAL success and
outstanding allocations report pending distribution.

Confirmation and wallet `LAUNCHPAD_PURCHASE` events invalidate transaction and
activity queries through the existing `fresh=1` mechanism and refresh the launch.
A wallet-scoped portfolio invalidation runs after its 20-second API TTL and
survives route navigation. Existing balance updates still use TzKT.

The existing countdown is rendered inside the primary panel using the chain's
`saleStart`, replacing the route's mock date. The primary-only sale summary shares the dynamic
`/assets/{address}/launch` query and active-first selection with the purchase
flow, refreshing every ten seconds and on purchase refresh. It displays
`(max_amount_cap - total_bought) / 10^token.decimals` as Tokens Left (two
decimal places), the decimal-adjusted allocation, and the API
`progress_percent` directly. Loading uses placeholders; missing, invalid, or
failed sale data keeps the layout with unavailable values and an empty bar.

## Validation

`primaryPurchase.test.ts` covers quotes/rounding, membership, windows, caps,
operator batching, wallet/balance changes, revalidation and contract errors.
`PrimaryPurchasePanel.test.tsx` covers amount → review → direct purchase → success,
changed-price rejection, and live countdown timing. Existing secondary contract,
fee summary, and route classification suites remain applicable.

## Purchase history

Primary asset tabs replace Open Orders and Order History with Purchase History.
The shared `RAssetHistoryTable` preserves the secondary table presentation,
with Date, Asset, Type, Price, Amount, Status, and Total columns, sorting and
10-row pagination. Secondary data loading and order behavior are unchanged.

`RPurchaseHistoryTab` reads confirmed direct `purchase` operations from the
configured Basenet launchpad using the existing TzKT client. It verifies the
asset against the operation's historical `launchLedger` diff and sums the
matching wUSDT transfers from the buyer, scoped to the operation hash and
counter. Total includes the actual discounted purchase fee and excludes MAV
network fees. Price is Total divided by Amount; all arithmetic uses decimal
strings/BigInt/BigNumber. Current prices and signed payment caps are never used
as historical payments. Missing or unsupported historical data shows a retryable
error rather than invented totals. Admin allocations and token distributions
are excluded. Confirmed means the purchase succeeded; it does not imply a
MANUAL allocation has been distributed.

Wallet operations are read in cursor batches of 100, with at most 10 concurrent
detail requests and cached immutable operation groups. Rows are sorted and
paginated locally after filtering the asset. The query is wallet/network/asset
scoped, refreshes every 15 seconds while mounted, and is invalidated after
purchase confirmation or a wallet purchase event. This release covers the direct
purchase path; permit history must be added when the currently blocked relay ships.
