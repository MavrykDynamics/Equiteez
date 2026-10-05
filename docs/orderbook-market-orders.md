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
