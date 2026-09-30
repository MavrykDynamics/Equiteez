# Primary purchases

`BuySellPanel` receives the Trade route's existing `isPrimary` decision
(`asset.profile.lifecycle === "primary_issuance"`). Primary assets use a
route-local `PrimaryPurchasePanel`; secondary assets retain the existing
orderbook form and contract calls.

The primary branch reuses `BuySellScreen`, `TradeConfirmationPopup`, the fee
summary, and `useContractAction`. Its optional shared-component props have no
effect on secondary trading. It offers a fixed-price Buy flow and eligible sale
options, defaulting to the cheapest live price. It does not offer Sell, limit
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
`saleStart`, replacing the route's mock date. The separate primary-sale summary
remains outside this change.

## Validation

`primaryPurchase.test.ts` covers quotes/rounding, membership, windows, caps,
operator batching, wallet/balance changes, revalidation and contract errors.
`PrimaryPurchasePanel.test.tsx` covers amount → review → direct purchase → success,
changed-price rejection, and live countdown timing. Existing secondary contract,
fee summary, and route classification suites remain applicable.
