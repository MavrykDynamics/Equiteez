# Secondary Market Order Flow

This document describes the current orderbook behavior implemented in the
marketplace secondary-market flow.

The active UI path is:

1. `SecondaryPriceBlock`
2. `PopupContent`
3. `BuySellScreen` for market orders or `BuySellLimitScreen` for limit orders
4. `orderbookBuy` or `orderbookSell`

The older `exchange.$id` buy/sell tab still has its order actions commented out
and its submit button disabled as `Coming Soon`, so it is not the source of
active order placement behavior.

## Order Types

The frontend submits all secondary-market orders through the orderbook contract:

- Buy orders call `placeBuyOrder`.
- Sell orders call `placeSellOrder`.
- Limit orders are submitted with `isMarketOrder: false`.
- Market orders are submitted with `isMarketOrder: true`.

Market orders are no longer implemented by inflating or discounting a limit
price, so the old examples using `125%`, `130%`, `75%`, or similar multipliers
are obsolete.

## Price Calculation

Prices from the orderbook are stored in raw atom units and converted to display
units with the quote token decimals:

```text
display price = raw price / 10 ^ quoteTokenDecimals
```

The market popup uses live open orders from `useOpenOrders`, not the slower REST
orderbook snapshot, when calculating the displayed market price.

Open orders are filtered to active orders only:

- not canceled
- not expired
- not fulfilled
- not refunded

The live price helper calculates:

- best ask: lowest real sell price
- best bid: highest real buy price

Sentinel-priced market orders are excluded from best-price calculations:

- market buy sentinel: `999_999_999_999`
- market sell sentinel: `0`

`resolveMarketPrice` then selects the quote shown to the user:

- Buy quote: best ask first, then fallback to best bid.
- Sell quote: best bid first, then fallback to best ask.
- Empty book: `0`.

This means a market sell now quotes the highest buy price when bids exist. It
does not use the lowest sell price. When only one side of the book exists, the
UI falls back to that real side instead of showing a placeholder such as `$1`.

`safeDivByPrice` is used whenever quote value is divided by price, so an empty
book price of `0` returns `undefined` instead of producing `Infinity`.

## Market Buy Flow

1. The user selects `Market` and `Buy`.
2. The displayed market price is resolved from the live orderbook:
   - primary: best ask
   - fallback: best bid
   - empty book: `0`
3. The user's input amount is treated as quote-token spend.
4. The estimated base-token amount is:

   ```text
   quote spend / displayed market price
   ```

5. The balance guard checks quote-token spend against the user's quote-token
   balance.
6. Buy requires a positive quote-token spend, a positive displayed market
   price, KYC, and no balance error.
7. The platform fee is `2%` of the quote-token spend. The network fee is
   estimated from the same contract batch that will be submitted.
8. Pressing Buy calls `orderbookBuy` with:
   - `tokensAmount = quote spend / displayed market price`
   - `pricePerToken = displayed market price`
   - `isMarketOrder = true`
9. The buy batch:
   - adds the orderbook as an operator for the quote token
   - calls `placeBuyOrder`
   - removes the quote-token operator

The frontend passes the displayed price as a reference value, but contract-side
market-order logic overwrites market buy pricing with the protected high
sentinel so the order has matching priority. Execution price and any settlement
adjustments are handled by the contract.

## Market Sell Flow

1. The user selects `Market` and `Sell`.
2. The displayed market price is resolved from the live orderbook:
   - primary: best bid
   - fallback: best ask
   - empty book: `0`
3. The user's input amount is treated as base-token quantity.
4. The displayed quote-token proceeds are:

   ```text
   base token amount * displayed market price
   ```

5. The balance guard checks base-token amount against the user's base-token
   balance.
6. Sell requires a positive base-token amount, a positive displayed market
   price, KYC, and no balance error.
7. The platform fee is `2%` of the displayed proceeds. The network fee is
   estimated from the same contract batch that will be submitted.
8. Pressing Sell calls `orderbookSell` with:
   - `tokensAmount = base token amount`
   - `pricePerToken = displayed market price`
   - `isMarketOrder = true`
9. The sell batch:
   - adds the orderbook as an operator for the RWA token
   - calls `placeSellOrder`
   - removes the RWA-token operator

The frontend passes the displayed price as a reference value, but contract-side
market-order logic overwrites market sell pricing with the protected zero
sentinel so the order has matching priority. Execution price and settlement are
handled by the contract.

## Limit Buy Flow

1. The user selects `Limit` and `Buy`.
2. The user enters:
   - limit price in the quote token
   - base-token amount to buy
3. Order total is:

   ```text
   base token amount * limit price
   ```

4. The percentage selector sizes the order by spending a percentage of the
   user's quote-token balance at the selected limit price:

   ```text
   token amount = quote balance * percent / limit price
   ```

5. The balance guard checks the order total against the user's quote-token
   balance.
6. The Buy button requires:
   - KYC enabled
   - positive amount
   - positive limit price
   - no balance error
   - limit price aligned to the contract tick size
7. Pressing Buy calls `orderbookBuy` with:
   - `tokensAmount = base token amount`
   - `pricePerToken = limit price`
   - `isMarketOrder = false`

## Limit Sell Flow

1. The user selects `Limit` and `Sell`.
2. The user enters:
   - base-token amount to sell
   - limit price in the quote token
3. Order total is:

   ```text
   base token amount * limit price
   ```

4. The percentage selector sizes the order by selling a percentage of the
   user's base-token balance.
5. The balance guard checks the base-token amount against the user's base-token
   balance.
6. The Sell button requires:
   - KYC enabled
   - positive amount
   - positive limit price
   - no balance error
   - limit price aligned to the contract tick size
7. Pressing Sell calls `orderbookSell` with:
   - `tokensAmount = base token amount`
   - `pricePerToken = limit price`
   - `isMarketOrder = false`

## Order Matching Flow

The frontend does not perform order matching. It only builds and submits the
contract calls. Matching priority and execution price are contract
responsibilities.

The current frontend assumptions for contract matching are:

- Market buy vs limit sell: match at the sell order price, starting from the
  lowest eligible ask.
- Market sell vs limit buy: match at the buy order price, starting from the
  highest eligible bid. This is the recent behavior change from using the lowest
  sell price.
- Limit buy vs limit sell: contract chooses the neutral policy, expected to be
  maker price.
- Market buy vs market sell: should not match without an external/reference
  price, because sentinel prices are priority markers, not executable prices.

Open-order display also treats market orders specially:

- Market rows are labeled `Market` instead of displaying the sentinel price.
- Market-order totals use the contract's
  `total_usd_value_of_rwa_token_amount`, not `amount * sentinel price`.
- Orderbook grouping and best-price helpers exclude sentinel prices so market
  orders do not distort the visible spread or grouping precision.

## Tick-Size Handling

The frontend reads each orderbook's tick size from the REST orderbook payload
when available. The contract `getConfig()` view through `getOrderbookTickSizes`
is retained as a fallback for payloads that do not include a tick size.

Current behavior:

- Tick size must be finite and greater than `0`, otherwise the read throws.
- `DexProvider` attaches REST orderbook storage as soon as each market has a
  valid REST tick size or contract-view fallback tick size.
- `AppGlobalLoader` waits for `DexProvider` orderbook readiness before routed
  pages render, so order placement cannot start against fallback `0` values.
- Stored orderbook data includes `tickSize`, `lowestSellPrice`,
  `highestBuyPrice`, buy/sell fees, token addresses, and the orderbook address.
- The active marketplace limit-order form validates user-entered limit prices
  against the contract tick size.
- Limit prices must be exact multiples of the display tick size:

  ```text
  display tick size = raw tick size / 10 ^ quoteTokenDecimals
  ```

- Invalid tick-size prices show an input error, disable the submit button, and skip
  network-fee estimation.
- The orderbook grouping dropdown uses dynamic display precision from open-order
  prices, with a `0.01` fallback, not the contract tick size.
- The frontend validates tick-size alignment but does not auto-round user input.

## Contract Interactions

`orderbookBuyBatch`:

1. Gets the sender address.
2. Loads the orderbook contract and quote-token contract.
3. Converts base-token amount with `tokensToAtoms(tokensAmount, decimals)`.
4. Converts price with `formatRWAPrice(pricePerToken, quoteTokenDecimals)`.
5. Adds the orderbook as quote-token operator.
6. Calls `placeBuyOrder` with:
   - `rwaTokenAmount`
   - `pricePerRwaToken`
   - `currency: "USDT"`
   - `orderExpiry: null`
   - `isMarketOrder`
7. Removes the quote-token operator.

`orderbookSellBatch`:

1. Gets the sender address.
2. Loads the orderbook contract and RWA-token contract.
3. Converts base-token amount with `tokensToAtoms(tokensAmount, decimals)`.
4. Converts price with `formatRWAPrice(pricePerToken, quoteTokenDecimals)`.
5. Adds the orderbook as RWA-token operator.
6. Calls `placeSellOrder` with:
   - `rwaTokenAmount`
   - `pricePerRwaToken`
   - `currency: "USDT"`
   - `orderExpiry: null`
   - `isMarketOrder`
7. Removes the RWA-token operator.

The quote-token address is selected from the orderbook configuration. The
`currency` payload field is currently hardcoded to `"USDT"`.

## Fees and Estimation

- Platform fee shown in the UI is `2%` of the order value.
- Market buy fee uses the quote-token spend.
- Market sell and limit orders use the calculated order total.
- REST orderbook data includes `buy_order_fee` and `sell_order_fee`, but the
  active marketplace popup fee card currently uses `PLATFORM_FEE_RATE` plus
  estimated network cost instead of those REST fee fields.
- Network fee is estimated with the same buy/sell batch that will be submitted.
- Estimation is debounced by `400ms`.
- If estimation fails, network fee falls back to `0`.

## Recent Logic Changes Reflected Here

- Removed the old percentage-buffer market-order approximation from the docs.
- Market orders now use `isMarketOrder: true` and contract sentinel pricing.
- Market sell now quotes the best bid when bids exist.
- One-sided books fall back to the real available side instead of a placeholder.
- Empty-book division is guarded so the UI does not display `Infinity`.
- Best-price and grouping logic exclude sentinel market-order prices.
- Market-order row totals use escrow/reference value from the contract data.
- Current price and market popup quotes use live open orders instead of the REST
  orderbook snapshot.
- Limit order balance checks are side-aware:
  - buy checks quote-token total
  - sell checks base-token amount
- Quote-token balances use the orderbook's configured quote token instead of a
  hardcoded stablecoin address.
- Limit-order prices are validated against the contract tick size before
  submission.
