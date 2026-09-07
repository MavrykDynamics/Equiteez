/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  fragment OpenOrderFields on orderbook_order {\n    id\n    orderbook {\n      rwa_token {\n        address\n      }\n    }\n    is_canceled\n    is_expired\n    is_fulfilled\n    is_refunded\n    order_expiry\n    order_id\n    order_type\n    created_at\n    ended_at\n    fulfilled_amount\n    orderbook_id\n    price_per_rwa_token\n    refunded_amount\n    rwa_token_amount\n    total_paid_out\n    total_usd_value_of_rwa_token_amount\n    unfulfilled_amount\n  }\n": types.OpenOrderFieldsFragmentDoc,
    "\n  \n\n  query allOpenOrdersQuery($rwaAddress: String, $offset: Int = 0, $limit: Int) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n  }\n": types.AllOpenOrdersQueryDocument,
    "\n  \n\n  query openOrdersByRwaAddressesQuery($rwaAddresses: [String!]!) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n  }\n": types.OpenOrdersByRwaAddressesQueryDocument,
    "\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n": types.OrderbookLastTradesQueryDocument,
    "\n    query configQuery {\n      super_admin {\n        address\n    }\n}\n": types.ConfigQueryDocument,
    "\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n": types.DipDupHeadLvlDocument,
    "\n  query UserAccountStatus($address: String!) {\n    kyc_member(where: { user: { address: { _eq: $address } } }) {\n      user {\n        address\n        orderbook_order_events(limit: 1) {\n          counter\n        }\n      }\n    }\n  }\n": types.UserAccountStatusDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment OpenOrderFields on orderbook_order {\n    id\n    orderbook {\n      rwa_token {\n        address\n      }\n    }\n    is_canceled\n    is_expired\n    is_fulfilled\n    is_refunded\n    order_expiry\n    order_id\n    order_type\n    created_at\n    ended_at\n    fulfilled_amount\n    orderbook_id\n    price_per_rwa_token\n    refunded_amount\n    rwa_token_amount\n    total_paid_out\n    total_usd_value_of_rwa_token_amount\n    unfulfilled_amount\n  }\n"): (typeof documents)["\n  fragment OpenOrderFields on orderbook_order {\n    id\n    orderbook {\n      rwa_token {\n        address\n      }\n    }\n    is_canceled\n    is_expired\n    is_fulfilled\n    is_refunded\n    order_expiry\n    order_id\n    order_type\n    created_at\n    ended_at\n    fulfilled_amount\n    orderbook_id\n    price_per_rwa_token\n    refunded_amount\n    rwa_token_amount\n    total_paid_out\n    total_usd_value_of_rwa_token_amount\n    unfulfilled_amount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n\n  query allOpenOrdersQuery($rwaAddress: String, $offset: Int = 0, $limit: Int) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n  }\n"): (typeof documents)["\n  \n\n  query allOpenOrdersQuery($rwaAddress: String, $offset: Int = 0, $limit: Int) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      offset: $offset\n      limit: $limit\n    ) {\n      ...OpenOrderFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n\n  query openOrdersByRwaAddressesQuery($rwaAddresses: [String!]!) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n  }\n"): (typeof documents)["\n  \n\n  query openOrdersByRwaAddressesQuery($rwaAddresses: [String!]!) {\n    buyOrders: orderbook_order(\n      order_by: { price_per_rwa_token: desc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 0 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n    sellOrders: orderbook_order(\n      order_by: { price_per_rwa_token: asc, created_at: desc }\n      where: {\n        is_canceled: { _eq: false }\n        is_expired: { _eq: false }\n        is_fulfilled: { _eq: false }\n        is_refunded: { _eq: false }\n        order_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _in: $rwaAddresses } } }\n      }\n    ) {\n      ...OpenOrderFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n"): (typeof documents)["\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    query configQuery {\n      super_admin {\n        address\n    }\n}\n"): (typeof documents)["\n    query configQuery {\n      super_admin {\n        address\n    }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n"): (typeof documents)["\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserAccountStatus($address: String!) {\n    kyc_member(where: { user: { address: { _eq: $address } } }) {\n      user {\n        address\n        orderbook_order_events(limit: 1) {\n          counter\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserAccountStatus($address: String!) {\n    kyc_member(where: { user: { address: { _eq: $address } } }) {\n      user {\n        address\n        orderbook_order_events(limit: 1) {\n          counter\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;