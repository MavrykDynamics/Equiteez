import { gql } from "~/utils/__generated__";

export const ORDERBOOK_CONFIG_QUERY = gql(`
  query OrderbookConfig($address: String!) {
    orderbook(where: {address: {_eq: $address}}) {
      address
      tick_size
      min_buy_order_amount
      min_buy_order_value
      min_sell_order_amount
      min_sell_order_value
      rwa_token { address token_id }
      currencies { currency_name token { address token_id } }
    }
  }
`);
