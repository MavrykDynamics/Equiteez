import { gql } from "@apollo/client/index";

export const ORDERBOOK_LAST_TRADES_QUERY = gql`
  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {
    tradeEvents: orderbook_order_event(
      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]
      where: {
        event_type: { _eq: 1 }
        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }
      }
      limit: $limit
    ) {
      id
      counter
      currency_delta
      fulfilled_after
      fulfilled_before
      order_type
      timestamp
      order {
        created_at
        is_market_order
        price_per_rwa_token
      }
      operation_hash
    }
  }
`;
