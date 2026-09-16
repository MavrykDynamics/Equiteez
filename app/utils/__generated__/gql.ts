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
    "\n  query OrderbookConfig($address: String!) {\n    orderbook(where: {address: {_eq: $address}}) {\n      address\n      tick_size\n      min_buy_order_amount\n      min_buy_order_value\n      min_sell_order_amount\n      min_sell_order_value\n      rwa_token { address token_id }\n      currencies { currency_name token { address token_id } }\n    }\n  }\n": types.OrderbookConfigDocument,
    "\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n": types.OrderbookLastTradesQueryDocument,
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
export function gql(source: "\n  query OrderbookConfig($address: String!) {\n    orderbook(where: {address: {_eq: $address}}) {\n      address\n      tick_size\n      min_buy_order_amount\n      min_buy_order_value\n      min_sell_order_amount\n      min_sell_order_value\n      rwa_token { address token_id }\n      currencies { currency_name token { address token_id } }\n    }\n  }\n"): (typeof documents)["\n  query OrderbookConfig($address: String!) {\n    orderbook(where: {address: {_eq: $address}}) {\n      address\n      tick_size\n      min_buy_order_amount\n      min_buy_order_value\n      min_sell_order_amount\n      min_sell_order_value\n      rwa_token { address token_id }\n      currencies { currency_name token { address token_id } }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n"): (typeof documents)["\n  query orderbookLastTradesQuery($rwaAddress: String, $limit: Int) {\n    tradeEvents: orderbook_order_event(\n      order_by: [{ timestamp: desc }, { counter: desc }, { id: desc }]\n      where: {\n        event_type: { _eq: 1 }\n        orderbook: { rwa_token: { address: { _eq: $rwaAddress } } }\n      }\n      limit: $limit\n    ) {\n      id\n      counter\n      currency_delta\n      fulfilled_after\n      fulfilled_before\n      order_type\n      timestamp\n      order {\n        created_at\n        is_market_order\n        price_per_rwa_token\n      }\n      operation_hash\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserAccountStatus($address: String!) {\n    kyc_member(where: { user: { address: { _eq: $address } } }) {\n      user {\n        address\n        orderbook_order_events(limit: 1) {\n          counter\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query UserAccountStatus($address: String!) {\n    kyc_member(where: { user: { address: { _eq: $address } } }) {\n      user {\n        address\n        orderbook_order_events(limit: 1) {\n          counter\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;