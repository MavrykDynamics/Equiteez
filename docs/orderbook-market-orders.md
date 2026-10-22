# Secondary order quantities

The selected-orderbook query loads `quantity_tick_size` separately from the
existing price `tick_size`. Both must be positive integer atom values. Missing
or invalid indexer settings use the existing read-only `getConfig` fallback,
cached by RPC network and orderbook. The deployed view's `priceTickSize` maps
to the frontend's existing `tickSize`; `quantityTickSize` remains separate.
No token-decimal or tick defaults are used.

Verified on Basenet on 2026-10-05 for
`KT1BjnZec6FGSm3g2ZnDmL7dGfBQTj4yy4yh`:

- RWA decimals: 6.
- Quantity tick: 10000 atoms (0.01 RWA).
- Price tick: 100000 quote atoms.
- The live GraphQL `orderbook` schema supports `quantity_tick_size`.

`getMarketOrderAmounts` derives the canonical quantity using BigNumber:

- Buy: convert the quote budget to atoms, divide by the best ask with the RWA
  decimal scale, and floor to the quantity tick.
- Sell: convert the requested RWA quantity to atoms and floor to the quantity tick.
- In both cases: `floor(rawQuantityAtoms / quantityTickSize) * quantityTickSize`.

The form uses those same quantity atoms for fee estimation and submission, and
converts them back to tokens for the receive preview and estimated consideration.
The Buy field is a budget; the order summary uses estimated spend from the aligned
quantity. Sell proceeds use the aligned quantity, and balance checks prevent
selling more than the available balance. Direct input, edited receive amounts,
and balance-percentage selections all pass through this calculation.

Invalid or missing quantity ticks, quantities rounded to zero, insufficient
balances, and post-rounding amount/value minimum violations block estimation
and submission. The contract adapter separately rejects off-tick Market and Limit
quantities; it never silently adjusts a submitted payload. Limit price-tick
validation and primary purchases retain their existing behavior.

Limit Buy and Sell apply the same downward quantity alignment to the requested
RWA amount. Direct Amount input and balance-percentage selections share the
aligned quantity for Total, the order summary, balance/minimum checks, fee
estimation, and submission. Buy consideration rounds up to quote atoms for the
balance check; Sell consideration rounds down. The Amount field retains the
requested quantity so users can edit it without losing precision while typing.
Limit prices still must align independently to the configured price tick.

For six RWA decimals, 966666 atoms becomes 960000 at tick 10000, or 966600 at
tick 100. The latter is test coverage, not a deployed configuration change.
A budget of 19 at price 20 yields the already-aligned quantity 0.95 at tick 10000.

Market consideration remains an estimate at the current best ask/bid, not a
multi-level fill simulation or a guarantee of the final execution price.

Focused regression coverage lives in `app/lib/orderbook`,
`app/contracts/orderbook*.test.ts`, `app/hooks/useOrderbookConfig.test.ts`, and
`app/lib/organisms/PriceSection/popups/marketOrders.test.tsx`.

## Fee summary

The Market and Limit fee tooltip shows Orderbook Fee and Gas Fee only. Gas Fee
uses the batch estimator's summed `suggestedFeeMumav` (`totalSuggestedFeeMutez`),
converted from MVRK atoms to MVRK and then USD. This includes the SDK's gas,
base/byte charges and fee buffer; storage burn is excluded. There is no custom
gas/network split. Platform Fee is Orderbook Fee plus Gas Fee, each added once
to the order value. Failed estimates clear the displayed gas fee.
Both Order Summary and Total display that calculated sum with two to six decimal
places, preserving small fees even for large orders. They update with the order
value and fee estimates; rounding applies only to the displayed sum.

## Payment preferences and direct network fees

Secondary order forms use the saved wallet/network-scoped payment method from
`GasPaymentProvider`; Profile edits are drafts until local persistence succeeds.
Changing the saved method preserves amount, limit price and expiry inputs.
Credits execution is not yet enabled; select and Save MVRK in Profile for direct
execution. There is no automatic fallback and no relay dependency in direct mode.

`useDirectOrderFee` keeps idle/loading/ready/error distinct and invalidates estimates
on argument or scope changes. A separate RPC read verifies native balance. The
review shows network fees and storage separately from the protocol-fee summary.
Buy/sell retain the existing shared payload validation and grant/order/revoke batch;
cancel/refund reuse transfer builders for preview and execution. The shared direct
sender freshly checks suggested fees, storage burns, reveal costs, native transfers,
wallet and chain before submission. Unknown or insufficient MVRK blocks execution.
Price/quantity tick alignment and raw unit conversion remain unchanged. See
[gasless trading](gasless-trading.md) for persistence and later transport phases.

## Shared payload validation

`app/contracts/orderbookPayload.ts::buildOrderPayload` owns raw order normalization and rule validation for both direct buy/sell batches and future verified permit construction. The extraction preserves quantity rejection without rounding, limit-only price-tick enforcement, exact nat values, currency trimming, nullable expiry and downward-rounded quote minimums. `orderbook.contract.ts` retains direct grant/order/revoke batches. Phase 3 ordinary permit builders reuse this validator. Permit review/signing is available as a reusable service/component; mode-aware relay execution remains deferred to Phase 5. This does not yet enable Credits execution in the trade panel.
