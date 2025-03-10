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
    "\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n": types.DipDupHeadLvlDocument,
    "query MarketTokenAddresses {\n  dodo_mav {\n    base_token {\n      address\n    }\n  }\n  orderbook {\n    rwa_token {\n      address\n    }\n  }\n}\n\n  ": types.MarketTokenAddressesDocument,
    "query MarketTokens($addresses: [String!]) {\n    token(where: {address: {_in: $addresses}}) {\n      address\n      token_id\n      token_standard\n      token_metadata\n      metadata\n    }\n  }\n  ": types.MarketTokensDocument,
    "\n  query UserKycStatus($address: String!) {\n   kyc_member(where: {user: {address: {_eq: $address}}}) {\n    user {\n      address\n    }\n  }\n}\n\n  ": types.UserKycStatusDocument,
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
export function gql(source: "\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n"): (typeof documents)["\n  subscription DipDupHeadLvl {\n    dipdup_head {\n      level\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MarketTokenAddresses {\n  dodo_mav {\n    base_token {\n      address\n    }\n  }\n  orderbook {\n    rwa_token {\n      address\n    }\n  }\n}\n\n  "): (typeof documents)["query MarketTokenAddresses {\n  dodo_mav {\n    base_token {\n      address\n    }\n  }\n  orderbook {\n    rwa_token {\n      address\n    }\n  }\n}\n\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query MarketTokens($addresses: [String!]) {\n    token(where: {address: {_in: $addresses}}) {\n      address\n      token_id\n      token_standard\n      token_metadata\n      metadata\n    }\n  }\n  "): (typeof documents)["query MarketTokens($addresses: [String!]) {\n    token(where: {address: {_in: $addresses}}) {\n      address\n      token_id\n      token_standard\n      token_metadata\n      metadata\n    }\n  }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query UserKycStatus($address: String!) {\n   kyc_member(where: {user: {address: {_eq: $address}}}) {\n    user {\n      address\n    }\n  }\n}\n\n  "): (typeof documents)["\n  query UserKycStatus($address: String!) {\n   kyc_member(where: {user: {address: {_eq: $address}}}) {\n    user {\n      address\n    }\n  }\n}\n\n  "];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;