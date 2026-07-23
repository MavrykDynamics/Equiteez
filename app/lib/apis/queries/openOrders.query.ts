import { gql } from "@apollo/client/index";

const OPEN_ORDER_FIELDS = gql`
  fragment OpenOrderFields on orderbook_order {
    id
    orderbook {
      rwa_token {
        address
      }
    }
    is_canceled
    is_expired
    is_fulfilled
    is_refunded
    order_expiry
    order_id
    order_type
    created_at
    ended_at
    fulfilled_amount
    orderbook_id
    price_per_rwa_token
    refunded_amount
    rwa_token_amount
    total_paid_out
    total_usd_value_of_rwa_token_amount
    unfulfilled_amount
  }
`;

export const ALL_OPEN_ORDERS_QUERY = gql`
  ${OPEN_ORDER_FIELDS}

  query allOpenOrdersQuery(
    $rwaAddress: String
    $orderbookAddress: String
    $offset: Int = 0
    $limit: Int
  ) {
    buyOrders: orderbook_order(
      order_by: { price_per_rwa_token: desc, created_at: desc }
      where: {
        is_canceled: { _eq: false }
        is_expired: { _eq: false }
        is_fulfilled: { _eq: false }
        is_refunded: { _eq: false }
        order_type: { _eq: 0 }
        orderbook: {
          address: { _eq: $orderbookAddress }
          rwa_token: { address: { _eq: $rwaAddress } }
        }
      }
      offset: $offset
      limit: $limit
    ) {
      ...OpenOrderFields
    }
    sellOrders: orderbook_order(
      order_by: { price_per_rwa_token: asc, created_at: desc }
      where: {
        is_canceled: { _eq: false }
        is_expired: { _eq: false }
        is_fulfilled: { _eq: false }
        is_refunded: { _eq: false }
        order_type: { _eq: 1 }
        orderbook: {
          address: { _eq: $orderbookAddress }
          rwa_token: { address: { _eq: $rwaAddress } }
        }
      }
      offset: $offset
      limit: $limit
    ) {
      ...OpenOrderFields
    }
  }
`;

export const OPEN_ORDERS_BY_RWA_ADDRESSES_QUERY = gql`
  ${OPEN_ORDER_FIELDS}

  query openOrdersByRwaAddressesQuery($rwaAddresses: [String!]!) {
    buyOrders: orderbook_order(
      order_by: { price_per_rwa_token: desc, created_at: desc }
      where: {
        is_canceled: { _eq: false }
        is_expired: { _eq: false }
        is_fulfilled: { _eq: false }
        is_refunded: { _eq: false }
        order_type: { _eq: 0 }
        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }
      }
    ) {
      ...OpenOrderFields
    }
    sellOrders: orderbook_order(
      order_by: { price_per_rwa_token: asc, created_at: desc }
      where: {
        is_canceled: { _eq: false }
        is_expired: { _eq: false }
        is_fulfilled: { _eq: false }
        is_refunded: { _eq: false }
        order_type: { _eq: 1 }
        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }
      }
    ) {
      ...OpenOrderFields
    }
  }
`;
