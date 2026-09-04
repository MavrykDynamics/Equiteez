/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  bigint: { input: any; output: any; }
  float8: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  numeric: { input: any; output: any; }
  smallint: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  _eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  _gt?: InputMaybe<Array<Scalars['Int']['input']>>;
  _gte?: InputMaybe<Array<Scalars['Int']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['Int']['input']>>;
  _lte?: InputMaybe<Array<Scalars['Int']['input']>>;
  _neq?: InputMaybe<Array<Scalars['Int']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['Int']['input']>>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _eq?: InputMaybe<Array<Scalars['String']['input']>>;
  _gt?: InputMaybe<Array<Scalars['String']['input']>>;
  _gte?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['String']['input']>>;
  _lte?: InputMaybe<Array<Scalars['String']['input']>>;
  _neq?: InputMaybe<Array<Scalars['String']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']['input']>;
  _gt?: InputMaybe<Scalars['bigint']['input']>;
  _gte?: InputMaybe<Scalars['bigint']['input']>;
  _in?: InputMaybe<Array<Scalars['bigint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['bigint']['input']>;
  _lte?: InputMaybe<Scalars['bigint']['input']>;
  _neq?: InputMaybe<Scalars['bigint']['input']>;
  _nin?: InputMaybe<Array<Scalars['bigint']['input']>>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Boolean expression to filter rows from the table "dex_storage_view". All fields are combined with a logical 'AND'. */
export type Dex_Storage_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dex_Storage_View_Bool_Exp>>;
  _not?: InputMaybe<Dex_Storage_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dex_Storage_View_Bool_Exp>>;
  base_balance?: InputMaybe<Float8_Comparison_Exp>;
  base_balance_limit?: InputMaybe<Float8_Comparison_Exp>;
  base_lp_token_address?: InputMaybe<String_Comparison_Exp>;
  base_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  base_lp_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  base_token_address?: InputMaybe<String_Comparison_Exp>;
  base_token_id?: InputMaybe<Int_Comparison_Exp>;
  base_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  dodo_mav_id?: InputMaybe<Int_Comparison_Exp>;
  fee_decimals?: InputMaybe<Bigint_Comparison_Exp>;
  fixed_price_percent?: InputMaybe<Bigint_Comparison_Exp>;
  guide_price?: InputMaybe<Float8_Comparison_Exp>;
  maintainer_fee?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  price_model?: InputMaybe<Smallint_Comparison_Exp>;
  quote_balance?: InputMaybe<Float8_Comparison_Exp>;
  quote_balance_limit?: InputMaybe<Float8_Comparison_Exp>;
  quote_lp_token_address?: InputMaybe<String_Comparison_Exp>;
  quote_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  quote_lp_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  quote_token_address?: InputMaybe<String_Comparison_Exp>;
  quote_token_id?: InputMaybe<Int_Comparison_Exp>;
  quote_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  r_status?: InputMaybe<Bigint_Comparison_Exp>;
  slippage_factor?: InputMaybe<Bigint_Comparison_Exp>;
  target_base_token_amount?: InputMaybe<Float8_Comparison_Exp>;
  target_quote_token_amount?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dex_storage_view". */
export type Dex_Storage_View_Order_By = {
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_address?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_lp_token_token_id?: InputMaybe<Order_By>;
  base_token_address?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  base_token_token_id?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_address?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_lp_token_token_id?: InputMaybe<Order_By>;
  quote_token_address?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  quote_token_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** select columns of table "dex_storage_view" */
export enum Dex_Storage_View_Select_Column {
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  BaseLpTokenAddress = 'base_lp_token_address',
  /** column name */
  BaseLpTokenId = 'base_lp_token_id',
  /** column name */
  BaseLpTokenTokenId = 'base_lp_token_token_id',
  /** column name */
  BaseTokenAddress = 'base_token_address',
  /** column name */
  BaseTokenId = 'base_token_id',
  /** column name */
  BaseTokenTokenId = 'base_token_token_id',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  DodoMavId = 'dodo_mav_id',
  /** column name */
  FeeDecimals = 'fee_decimals',
  /** column name */
  FixedPricePercent = 'fixed_price_percent',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  MaintainerFee = 'maintainer_fee',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  PriceModel = 'price_model',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  QuoteLpTokenAddress = 'quote_lp_token_address',
  /** column name */
  QuoteLpTokenId = 'quote_lp_token_id',
  /** column name */
  QuoteLpTokenTokenId = 'quote_lp_token_token_id',
  /** column name */
  QuoteTokenAddress = 'quote_token_address',
  /** column name */
  QuoteTokenId = 'quote_token_id',
  /** column name */
  QuoteTokenTokenId = 'quote_token_token_id',
  /** column name */
  RStatus = 'r_status',
  /** column name */
  SlippageFactor = 'slippage_factor',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** Streaming cursor of the table "dex_storage_view" */
export type Dex_Storage_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dex_Storage_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dex_Storage_View_Stream_Cursor_Value_Input = {
  base_balance?: InputMaybe<Scalars['float8']['input']>;
  base_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  base_lp_token_address?: InputMaybe<Scalars['String']['input']>;
  base_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_lp_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  base_token_address?: InputMaybe<Scalars['String']['input']>;
  base_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  dodo_mav_id?: InputMaybe<Scalars['Int']['input']>;
  fee_decimals?: InputMaybe<Scalars['bigint']['input']>;
  fixed_price_percent?: InputMaybe<Scalars['bigint']['input']>;
  guide_price?: InputMaybe<Scalars['float8']['input']>;
  maintainer_fee?: InputMaybe<Scalars['bigint']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  price_model?: InputMaybe<Scalars['smallint']['input']>;
  quote_balance?: InputMaybe<Scalars['float8']['input']>;
  quote_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  quote_lp_token_address?: InputMaybe<Scalars['String']['input']>;
  quote_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_lp_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  quote_token_address?: InputMaybe<Scalars['String']['input']>;
  quote_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  r_status?: InputMaybe<Scalars['bigint']['input']>;
  slippage_factor?: InputMaybe<Scalars['bigint']['input']>;
  target_base_token_amount?: InputMaybe<Scalars['float8']['input']>;
  target_quote_token_amount?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_contract". All fields are combined with a logical 'AND'. */
export type Dipdup_Contract_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Contract_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Contract_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Contract_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  code_hash?: InputMaybe<Bigint_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  kind?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  typename?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Boolean expression to filter rows from the table "dipdup_contract_metadata". All fields are combined with a logical 'AND'. */
export type Dipdup_Contract_Metadata_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Contract_Metadata_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Contract_Metadata_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Contract_Metadata_Bool_Exp>>;
  contract?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  network?: InputMaybe<String_Comparison_Exp>;
  update_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_contract_metadata". */
export type Dipdup_Contract_Metadata_Order_By = {
  contract?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  update_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_contract_metadata" */
export enum Dipdup_Contract_Metadata_Select_Column {
  /** column name */
  Contract = 'contract',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Network = 'network',
  /** column name */
  UpdateId = 'update_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_contract_metadata" */
export type Dipdup_Contract_Metadata_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Contract_Metadata_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Contract_Metadata_Stream_Cursor_Value_Input = {
  contract?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  update_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Ordering options when selecting data from "dipdup_contract". */
export type Dipdup_Contract_Order_By = {
  address?: InputMaybe<Order_By>;
  code_hash?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  kind?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  typename?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_contract" */
export enum Dipdup_Contract_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  CodeHash = 'code_hash',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Kind = 'kind',
  /** column name */
  Name = 'name',
  /** column name */
  Typename = 'typename',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_contract" */
export type Dipdup_Contract_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Contract_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Contract_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  code_hash?: InputMaybe<Scalars['bigint']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  kind?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  typename?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_head". All fields are combined with a logical 'AND'. */
export type Dipdup_Head_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Head_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Head_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Head_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  hash?: InputMaybe<String_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_head". */
export type Dipdup_Head_Order_By = {
  created_at?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_head" */
export enum Dipdup_Head_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Hash = 'hash',
  /** column name */
  Level = 'level',
  /** column name */
  Name = 'name',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_head" */
export type Dipdup_Head_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Head_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Head_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_index". All fields are combined with a logical 'AND'. */
export type Dipdup_Index_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Index_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Index_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Index_Bool_Exp>>;
  config_hash?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  template?: InputMaybe<String_Comparison_Exp>;
  template_values?: InputMaybe<Jsonb_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_index". */
export type Dipdup_Index_Order_By = {
  config_hash?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  template?: InputMaybe<Order_By>;
  template_values?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_index" */
export enum Dipdup_Index_Select_Column {
  /** column name */
  ConfigHash = 'config_hash',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Level = 'level',
  /** column name */
  Name = 'name',
  /** column name */
  Status = 'status',
  /** column name */
  Template = 'template',
  /** column name */
  TemplateValues = 'template_values',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_index" */
export type Dipdup_Index_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Index_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Index_Stream_Cursor_Value_Input = {
  config_hash?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
  template_values?: InputMaybe<Scalars['jsonb']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_meta". All fields are combined with a logical 'AND'. */
export type Dipdup_Meta_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Meta_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Meta_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Meta_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  key?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  value?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_meta". */
export type Dipdup_Meta_Order_By = {
  created_at?: InputMaybe<Order_By>;
  key?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_meta" */
export enum Dipdup_Meta_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Key = 'key',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Value = 'value'
}

/** Streaming cursor of the table "dipdup_meta" */
export type Dipdup_Meta_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Meta_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Meta_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_model_update". All fields are combined with a logical 'AND'. */
export type Dipdup_Model_Update_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Model_Update_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Model_Update_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Model_Update_Bool_Exp>>;
  action?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  data?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  index?: InputMaybe<String_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  model_name?: InputMaybe<String_Comparison_Exp>;
  model_pk?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_model_update". */
export type Dipdup_Model_Update_Order_By = {
  action?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  data?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  index?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  model_name?: InputMaybe<Order_By>;
  model_pk?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_model_update" */
export enum Dipdup_Model_Update_Select_Column {
  /** column name */
  Action = 'action',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Data = 'data',
  /** column name */
  Id = 'id',
  /** column name */
  Index = 'index',
  /** column name */
  Level = 'level',
  /** column name */
  ModelName = 'model_name',
  /** column name */
  ModelPk = 'model_pk',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_model_update" */
export type Dipdup_Model_Update_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Model_Update_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Model_Update_Stream_Cursor_Value_Input = {
  action?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  data?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  index?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  model_name?: InputMaybe<Scalars['String']['input']>;
  model_pk?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_schema". All fields are combined with a logical 'AND'. */
export type Dipdup_Schema_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Schema_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Schema_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Schema_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  hash?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  reindex?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_schema". */
export type Dipdup_Schema_Order_By = {
  created_at?: InputMaybe<Order_By>;
  hash?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  reindex?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_schema" */
export enum Dipdup_Schema_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Hash = 'hash',
  /** column name */
  Name = 'name',
  /** column name */
  Reindex = 'reindex',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_schema" */
export type Dipdup_Schema_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Schema_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Schema_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  hash?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  reindex?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_status". All fields are combined with a logical 'AND'. */
export type Dipdup_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Status_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Status_Bool_Exp>>;
  level?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  size?: InputMaybe<Numeric_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_status". */
export type Dipdup_Status_Order_By = {
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  size?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_status" */
export enum Dipdup_Status_Select_Column {
  /** column name */
  Level = 'level',
  /** column name */
  Name = 'name',
  /** column name */
  Size = 'size',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_status" */
export type Dipdup_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Status_Stream_Cursor_Value_Input = {
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['numeric']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "dipdup_token_metadata". All fields are combined with a logical 'AND'. */
export type Dipdup_Token_Metadata_Bool_Exp = {
  _and?: InputMaybe<Array<Dipdup_Token_Metadata_Bool_Exp>>;
  _not?: InputMaybe<Dipdup_Token_Metadata_Bool_Exp>;
  _or?: InputMaybe<Array<Dipdup_Token_Metadata_Bool_Exp>>;
  contract?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  network?: InputMaybe<String_Comparison_Exp>;
  token_id?: InputMaybe<String_Comparison_Exp>;
  update_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "dipdup_token_metadata". */
export type Dipdup_Token_Metadata_Order_By = {
  contract?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  network?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  update_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dipdup_token_metadata" */
export enum Dipdup_Token_Metadata_Select_Column {
  /** column name */
  Contract = 'contract',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Network = 'network',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UpdateId = 'update_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "dipdup_token_metadata" */
export type Dipdup_Token_Metadata_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dipdup_Token_Metadata_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dipdup_Token_Metadata_Stream_Cursor_Value_Input = {
  contract?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  token_id?: InputMaybe<Scalars['String']['input']>;
  update_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type Dodo_Mav_Aggregate_Bool_Exp = {
  avg?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Avg>;
  corr?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Corr>;
  count?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Count>;
  covar_samp?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp>;
  max?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Max>;
  min?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Min>;
  stddev_samp?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Stddev_Samp>;
  sum?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Sum>;
  var_samp?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp_Var_Samp>;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Avg = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Avg_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Corr = {
  arguments: Dodo_Mav_Aggregate_Bool_Exp_Corr_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Corr_Arguments = {
  X: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Corr_Arguments_Columns;
  Y: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Corr_Arguments_Columns;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Dodo_Mav_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp = {
  arguments: Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp_Arguments = {
  X: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
  Y: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Max = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Max_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Min = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Min_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Stddev_Samp = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Sum = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Sum_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_Aggregate_Bool_Exp_Var_Samp = {
  arguments: Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

/** order by aggregate values of table "dodo_mav" */
export type Dodo_Mav_Aggregate_Order_By = {
  avg?: InputMaybe<Dodo_Mav_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Dodo_Mav_Max_Order_By>;
  min?: InputMaybe<Dodo_Mav_Min_Order_By>;
  stddev?: InputMaybe<Dodo_Mav_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Dodo_Mav_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Dodo_Mav_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Dodo_Mav_Sum_Order_By>;
  var_pop?: InputMaybe<Dodo_Mav_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Dodo_Mav_Var_Samp_Order_By>;
  variance?: InputMaybe<Dodo_Mav_Variance_Order_By>;
};

/** order by avg() on columns of table "dodo_mav" */
export type Dodo_Mav_Avg_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "dodo_mav". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  appraisal_price?: InputMaybe<Float8_Comparison_Exp>;
  base_balance?: InputMaybe<Float8_Comparison_Exp>;
  base_balance_limit?: InputMaybe<Float8_Comparison_Exp>;
  base_lp_token?: InputMaybe<Token_Bool_Exp>;
  base_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  base_token?: InputMaybe<Token_Bool_Exp>;
  base_token_id?: InputMaybe<Int_Comparison_Exp>;
  entrypoint_status?: InputMaybe<Dodo_Mav_Entrypoint_Status_Bool_Exp>;
  entrypoint_status_aggregate?: InputMaybe<Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp>;
  fee_decimals?: InputMaybe<Bigint_Comparison_Exp>;
  fixed_price_percent?: InputMaybe<Bigint_Comparison_Exp>;
  guide_price?: InputMaybe<Float8_Comparison_Exp>;
  history_data?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  history_data_aggregate?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambdas?: InputMaybe<Dodo_Mav_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Dodo_Mav_Lambda_Aggregate_Bool_Exp>;
  lp_fee?: InputMaybe<Bigint_Comparison_Exp>;
  maintainer_fee?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  orderbook_price_percent?: InputMaybe<Bigint_Comparison_Exp>;
  price_model?: InputMaybe<Smallint_Comparison_Exp>;
  quote_balance?: InputMaybe<Float8_Comparison_Exp>;
  quote_balance_limit?: InputMaybe<Float8_Comparison_Exp>;
  quote_lp_token?: InputMaybe<Token_Bool_Exp>;
  quote_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  quote_token?: InputMaybe<Token_Bool_Exp>;
  quote_token_id?: InputMaybe<Int_Comparison_Exp>;
  r_status?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  rwa_orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  slippage_factor?: InputMaybe<Bigint_Comparison_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
  target_base_token_amount?: InputMaybe<Float8_Comparison_Exp>;
  target_quote_token_amount?: InputMaybe<Float8_Comparison_Exp>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1d". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1d_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1d_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1d_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1d_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1d". */
export type Dodo_Mav_Candles_1d_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1d" */
export enum Dodo_Mav_Candles_1d_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1d" */
export type Dodo_Mav_Candles_1d_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1d_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1d_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1d_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1d_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1d_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1d_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1d_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1d_view". */
export type Dodo_Mav_Candles_1d_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1d_view" */
export enum Dodo_Mav_Candles_1d_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1d_view" */
export type Dodo_Mav_Candles_1d_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1d_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1d_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1h". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1h_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1h_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1h_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1h_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1h". */
export type Dodo_Mav_Candles_1h_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1h" */
export enum Dodo_Mav_Candles_1h_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1h" */
export type Dodo_Mav_Candles_1h_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1h_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1h_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1h_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1h_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1h_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1h_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1h_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1h_view". */
export type Dodo_Mav_Candles_1h_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1h_view" */
export enum Dodo_Mav_Candles_1h_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1h_view" */
export type Dodo_Mav_Candles_1h_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1h_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1h_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1m". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1m_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1m_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1m_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1m_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1m". */
export type Dodo_Mav_Candles_1m_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1m" */
export enum Dodo_Mav_Candles_1m_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1m" */
export type Dodo_Mav_Candles_1m_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1m_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1m_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1m_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1m_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1m_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1m_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1m_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1m_view". */
export type Dodo_Mav_Candles_1m_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1m_view" */
export enum Dodo_Mav_Candles_1m_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1m_view" */
export type Dodo_Mav_Candles_1m_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1m_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1m_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1w". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1w_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1w_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1w_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1w_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1w". */
export type Dodo_Mav_Candles_1w_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1w" */
export enum Dodo_Mav_Candles_1w_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1w" */
export type Dodo_Mav_Candles_1w_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1w_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1w_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1w_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1w_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1w_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1w_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1w_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1w_view". */
export type Dodo_Mav_Candles_1w_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1w_view" */
export enum Dodo_Mav_Candles_1w_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1w_view" */
export type Dodo_Mav_Candles_1w_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1w_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1w_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_1y_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_1y_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_1y_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_1y_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_1y_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_1y_view". */
export type Dodo_Mav_Candles_1y_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_1y_view" */
export enum Dodo_Mav_Candles_1y_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_1y_view" */
export type Dodo_Mav_Candles_1y_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_1y_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_1y_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

/** Boolean expression to filter rows from the table "dodo_mav_candles_3y_view". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Candles_3y_View_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Candles_3y_View_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Candles_3y_View_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Candles_3y_View_Bool_Exp>>;
  close?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  high?: InputMaybe<Float8_Comparison_Exp>;
  low?: InputMaybe<Float8_Comparison_Exp>;
  open?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trades?: InputMaybe<Bigint_Comparison_Exp>;
  volume?: InputMaybe<Float8_Comparison_Exp>;
};

/** Ordering options when selecting data from "dodo_mav_candles_3y_view". */
export type Dodo_Mav_Candles_3y_View_Order_By = {
  close?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  high?: InputMaybe<Order_By>;
  low?: InputMaybe<Order_By>;
  open?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trades?: InputMaybe<Order_By>;
  volume?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_candles_3y_view" */
export enum Dodo_Mav_Candles_3y_View_Select_Column {
  /** column name */
  Close = 'close',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  High = 'high',
  /** column name */
  Low = 'low',
  /** column name */
  Open = 'open',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  Trades = 'trades',
  /** column name */
  Volume = 'volume'
}

/** Streaming cursor of the table "dodo_mav_candles_3y_view" */
export type Dodo_Mav_Candles_3y_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Candles_3y_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Candles_3y_View_Stream_Cursor_Value_Input = {
  close?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  high?: InputMaybe<Scalars['float8']['input']>;
  low?: InputMaybe<Scalars['float8']['input']>;
  open?: InputMaybe<Scalars['float8']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trades?: InputMaybe<Scalars['bigint']['input']>;
  volume?: InputMaybe<Scalars['float8']['input']>;
};

export type Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Count>;
};

export type Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And = {
  arguments: Dodo_Mav_Entrypoint_Status_Select_Column_Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Dodo_Mav_Entrypoint_Status_Select_Column_Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Dodo_Mav_Entrypoint_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Entrypoint_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Aggregate_Order_By = {
  avg?: InputMaybe<Dodo_Mav_Entrypoint_Status_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Dodo_Mav_Entrypoint_Status_Max_Order_By>;
  min?: InputMaybe<Dodo_Mav_Entrypoint_Status_Min_Order_By>;
  stddev?: InputMaybe<Dodo_Mav_Entrypoint_Status_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Dodo_Mav_Entrypoint_Status_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Dodo_Mav_Entrypoint_Status_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Dodo_Mav_Entrypoint_Status_Sum_Order_By>;
  var_pop?: InputMaybe<Dodo_Mav_Entrypoint_Status_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Dodo_Mav_Entrypoint_Status_Var_Samp_Order_By>;
  variance?: InputMaybe<Dodo_Mav_Entrypoint_Status_Variance_Order_By>;
};

/** order by avg() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "dodo_mav_entrypoint_status". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Entrypoint_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Entrypoint_Status_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Entrypoint_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Entrypoint_Status_Bool_Exp>>;
  contract?: InputMaybe<Dodo_Mav_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  entrypoint?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  paused?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "dodo_mav_entrypoint_status". */
export type Dodo_Mav_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Dodo_Mav_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_entrypoint_status" */
export enum Dodo_Mav_Entrypoint_Status_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Entrypoint = 'entrypoint',
  /** column name */
  Id = 'id',
  /** column name */
  Paused = 'paused',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "dodo_mav_entrypoint_status_aggregate_bool_exp_bool_and_arguments_columns" columns of table "dodo_mav_entrypoint_status" */
export enum Dodo_Mav_Entrypoint_Status_Select_Column_Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** select "dodo_mav_entrypoint_status_aggregate_bool_exp_bool_or_arguments_columns" columns of table "dodo_mav_entrypoint_status" */
export enum Dodo_Mav_Entrypoint_Status_Select_Column_Dodo_Mav_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** order by stddev() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Entrypoint_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Entrypoint_Status_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  entrypoint?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp = {
  avg?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Avg>;
  corr?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr>;
  count?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Count>;
  covar_samp?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp>;
  max?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Max>;
  min?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Min>;
  stddev_samp?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Stddev_Samp>;
  sum?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Sum>;
  var_samp?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp_Var_Samp>;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Avg = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Avg_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr = {
  arguments: Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr_Arguments = {
  X: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr_Arguments_Columns;
  Y: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr_Arguments_Columns;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Dodo_Mav_History_Data_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp = {
  arguments: Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp_Arguments = {
  X: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
  Y: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Max = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Max_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Min = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Min_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Stddev_Samp = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Sum = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Sum_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Dodo_Mav_History_Data_Aggregate_Bool_Exp_Var_Samp = {
  arguments: Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

/** order by aggregate values of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Aggregate_Order_By = {
  avg?: InputMaybe<Dodo_Mav_History_Data_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Dodo_Mav_History_Data_Max_Order_By>;
  min?: InputMaybe<Dodo_Mav_History_Data_Min_Order_By>;
  stddev?: InputMaybe<Dodo_Mav_History_Data_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Dodo_Mav_History_Data_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Dodo_Mav_History_Data_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Dodo_Mav_History_Data_Sum_Order_By>;
  var_pop?: InputMaybe<Dodo_Mav_History_Data_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Dodo_Mav_History_Data_Var_Samp_Order_By>;
  variance?: InputMaybe<Dodo_Mav_History_Data_Variance_Order_By>;
};

/** order by avg() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Avg_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "dodo_mav_history_data". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_History_Data_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_History_Data_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_History_Data_Bool_Exp>>;
  base_token_pool?: InputMaybe<Float8_Comparison_Exp>;
  base_token_price?: InputMaybe<Float8_Comparison_Exp>;
  base_token_qty?: InputMaybe<Float8_Comparison_Exp>;
  dodo_mav?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mav_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Bigint_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  quote_token_pool?: InputMaybe<Float8_Comparison_Exp>;
  quote_token_qty?: InputMaybe<Float8_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  trader?: InputMaybe<Equiteez_User_Bool_Exp>;
  trader_id?: InputMaybe<Int_Comparison_Exp>;
  type?: InputMaybe<Smallint_Comparison_Exp>;
};

/** order by max() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Max_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  /** Trade timestamp */
  timestamp?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Min_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  /** Trade timestamp */
  timestamp?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "dodo_mav_history_data". */
export type Dodo_Mav_History_Data_Order_By = {
  base_token_pool?: InputMaybe<Order_By>;
  base_token_price?: InputMaybe<Order_By>;
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav?: InputMaybe<Dodo_Mav_Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  quote_token_pool?: InputMaybe<Order_By>;
  quote_token_qty?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  trader?: InputMaybe<Equiteez_User_Order_By>;
  trader_id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  DodoMavId = 'dodo_mav_id',
  /** column name */
  Id = 'id',
  /** column name */
  Level = 'level',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TraderId = 'trader_id',
  /** column name */
  Type = 'type'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_avg_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Avg_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_corr_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Corr_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_max_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Max_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_min_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Min_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_sum_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Sum_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** select "dodo_mav_history_data_aggregate_bool_exp_var_samp_arguments_columns" columns of table "dodo_mav_history_data" */
export enum Dodo_Mav_History_Data_Select_Column_Dodo_Mav_History_Data_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns {
  /** column name */
  BaseTokenPool = 'base_token_pool',
  /** column name */
  BaseTokenPrice = 'base_token_price',
  /** column name */
  BaseTokenQty = 'base_token_qty',
  /** column name */
  QuoteTokenPool = 'quote_token_pool',
  /** column name */
  QuoteTokenQty = 'quote_token_qty'
}

/** order by stddev() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Stddev_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Stddev_Pop_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Stddev_Samp_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_History_Data_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_History_Data_Stream_Cursor_Value_Input = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Scalars['float8']['input']>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Scalars['float8']['input']>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Scalars['float8']['input']>;
  dodo_mav_id?: InputMaybe<Scalars['Int']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['bigint']['input']>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Scalars['bigint']['input']>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Scalars['float8']['input']>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Scalars['float8']['input']>;
  /** Trade timestamp */
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  trader_id?: InputMaybe<Scalars['Int']['input']>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Scalars['smallint']['input']>;
};

/** order by sum() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Sum_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Var_Pop_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Var_Samp_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "dodo_mav_history_data" */
export type Dodo_Mav_History_Data_Variance_Order_By = {
  /** Base token pool balance after trade */
  base_token_pool?: InputMaybe<Order_By>;
  /** Base token price at trade time */
  base_token_price?: InputMaybe<Order_By>;
  /** Base token quantity traded */
  base_token_qty?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Quote token pool balance after trade */
  quote_token_pool?: InputMaybe<Order_By>;
  /** Quote token quantity traded */
  quote_token_qty?: InputMaybe<Order_By>;
  trader_id?: InputMaybe<Order_By>;
  /** Type of trade (BUY/SELL) */
  type?: InputMaybe<Order_By>;
};

export type Dodo_Mav_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Dodo_Mav_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Dodo_Mav_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Dodo_Mav_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Dodo_Mav_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Dodo_Mav_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Dodo_Mav_Lambda_Max_Order_By>;
  min?: InputMaybe<Dodo_Mav_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Dodo_Mav_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Dodo_Mav_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Dodo_Mav_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Dodo_Mav_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Dodo_Mav_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Dodo_Mav_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Dodo_Mav_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "dodo_mav_lambda". All fields are combined with a logical 'AND'. */
export type Dodo_Mav_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Dodo_Mav_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Dodo_Mav_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Dodo_Mav_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Dodo_Mav_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "dodo_mav_lambda". */
export type Dodo_Mav_Lambda_Order_By = {
  contract?: InputMaybe<Dodo_Mav_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav_lambda" */
export enum Dodo_Mav_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "dodo_mav_lambda" */
export type Dodo_Mav_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "dodo_mav" */
export type Dodo_Mav_Max_Order_By = {
  /** DodoMav contract address */
  address?: InputMaybe<Order_By>;
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav" */
export type Dodo_Mav_Min_Order_By = {
  /** DodoMav contract address */
  address?: InputMaybe<Order_By>;
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "dodo_mav". */
export type Dodo_Mav_Order_By = {
  address?: InputMaybe<Order_By>;
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token?: InputMaybe<Token_Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token?: InputMaybe<Token_Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  entrypoint_status_aggregate?: InputMaybe<Dodo_Mav_Entrypoint_Status_Aggregate_Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  history_data_aggregate?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Dodo_Mav_Lambda_Aggregate_Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token?: InputMaybe<Token_Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token?: InputMaybe<Token_Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook?: InputMaybe<Orderbook_Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** select columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  BaseLpTokenId = 'base_lp_token_id',
  /** column name */
  BaseTokenId = 'base_token_id',
  /** column name */
  FeeDecimals = 'fee_decimals',
  /** column name */
  FixedPricePercent = 'fixed_price_percent',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  Id = 'id',
  /** column name */
  LpFee = 'lp_fee',
  /** column name */
  MaintainerFee = 'maintainer_fee',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  OrderbookPricePercent = 'orderbook_price_percent',
  /** column name */
  PriceModel = 'price_model',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  QuoteLpTokenId = 'quote_lp_token_id',
  /** column name */
  QuoteTokenId = 'quote_token_id',
  /** column name */
  RStatus = 'r_status',
  /** column name */
  RwaOrderbookId = 'rwa_orderbook_id',
  /** column name */
  SlippageFactor = 'slippage_factor',
  /** column name */
  SuperAdmin = 'super_admin',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_avg_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Avg_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_corr_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Corr_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_max_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Max_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_min_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Min_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_sum_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Sum_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** select "dodo_mav_aggregate_bool_exp_var_samp_arguments_columns" columns of table "dodo_mav" */
export enum Dodo_Mav_Select_Column_Dodo_Mav_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns {
  /** column name */
  AppraisalPrice = 'appraisal_price',
  /** column name */
  BaseBalance = 'base_balance',
  /** column name */
  BaseBalanceLimit = 'base_balance_limit',
  /** column name */
  GuidePrice = 'guide_price',
  /** column name */
  QuoteBalance = 'quote_balance',
  /** column name */
  QuoteBalanceLimit = 'quote_balance_limit',
  /** column name */
  TargetBaseTokenAmount = 'target_base_token_amount',
  /** column name */
  TargetQuoteTokenAmount = 'target_quote_token_amount'
}

/** order by stddev() on columns of table "dodo_mav" */
export type Dodo_Mav_Stddev_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "dodo_mav" */
export type Dodo_Mav_Stddev_Pop_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "dodo_mav" */
export type Dodo_Mav_Stddev_Samp_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "dodo_mav" */
export type Dodo_Mav_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dodo_Mav_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dodo_Mav_Stream_Cursor_Value_Input = {
  /** DodoMav contract address */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Appraisal price */
  appraisal_price?: InputMaybe<Scalars['float8']['input']>;
  /** Current base token balance */
  base_balance?: InputMaybe<Scalars['float8']['input']>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  base_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_token_id?: InputMaybe<Scalars['Int']['input']>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Scalars['bigint']['input']>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Scalars['bigint']['input']>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Scalars['float8']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Scalars['bigint']['input']>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Scalars['bigint']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Scalars['bigint']['input']>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Scalars['smallint']['input']>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Scalars['float8']['input']>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  quote_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_token_id?: InputMaybe<Scalars['Int']['input']>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Scalars['bigint']['input']>;
  rwa_orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Scalars['bigint']['input']>;
  /** Current super admin address */
  super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Scalars['float8']['input']>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Scalars['float8']['input']>;
};

/** order by sum() on columns of table "dodo_mav" */
export type Dodo_Mav_Sum_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "dodo_mav" */
export type Dodo_Mav_Var_Pop_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "dodo_mav" */
export type Dodo_Mav_Var_Samp_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "dodo_mav" */
export type Dodo_Mav_Variance_Order_By = {
  /** Appraisal price */
  appraisal_price?: InputMaybe<Order_By>;
  /** Current base token balance */
  base_balance?: InputMaybe<Order_By>;
  /** Base token balance limit */
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  /** Fee decimal places */
  fee_decimals?: InputMaybe<Order_By>;
  /** Fixed price percentage */
  fixed_price_percent?: InputMaybe<Order_By>;
  /** Guide price for trading */
  guide_price?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Liquidity provider fee */
  lp_fee?: InputMaybe<Order_By>;
  /** Maintainer fee */
  maintainer_fee?: InputMaybe<Order_By>;
  /** Orderbook price percentage */
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** Pricing model (FIXED/DYNAMIC) */
  price_model?: InputMaybe<Order_By>;
  /** Current quote token balance */
  quote_balance?: InputMaybe<Order_By>;
  /** Quote token balance limit */
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  /** R status (balance indicator) */
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  /** Slippage factor */
  slippage_factor?: InputMaybe<Order_By>;
  /** Target base token amount */
  target_base_token_amount?: InputMaybe<Order_By>;
  /** Target quote token amount */
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "equiteez_user". All fields are combined with a logical 'AND'. */
export type Equiteez_User_Bool_Exp = {
  _and?: InputMaybe<Array<Equiteez_User_Bool_Exp>>;
  _not?: InputMaybe<Equiteez_User_Bool_Exp>;
  _or?: InputMaybe<Array<Equiteez_User_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  dodo_mav_history_datas?: InputMaybe<Dodo_Mav_History_Data_Bool_Exp>;
  dodo_mav_history_datas_aggregate?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc_blacklists?: InputMaybe<Kyc_Blacklisted_Bool_Exp>;
  kyc_blacklists_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Bool_Exp>;
  kyc_members?: InputMaybe<Kyc_Member_Bool_Exp>;
  kyc_members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  kyc_registrars?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  kyc_registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp>;
  kyc_whitelists?: InputMaybe<Kyc_Whitelisted_Bool_Exp>;
  kyc_whitelists_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Bool_Exp>;
  launchpad_distribution_events?: InputMaybe<Launchpad_Distribution_Event_Bool_Exp>;
  launchpad_distribution_events_aggregate?: InputMaybe<Launchpad_Distribution_Event_Aggregate_Bool_Exp>;
  launchpad_purchase_events?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  launchpad_purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Bool_Exp>;
  launchpad_purchases?: InputMaybe<Launchpad_Purchase_Bool_Exp>;
  launchpad_purchases_aggregate?: InputMaybe<Launchpad_Purchase_Aggregate_Bool_Exp>;
  marketplace_listings?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  marketplace_listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp>;
  marketplace_offers?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  marketplace_offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp>;
  orderbook_order_events?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  orderbook_order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Bool_Exp>;
  orderbook_orders?: InputMaybe<Orderbook_Order_Bool_Exp>;
  orderbook_orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp>;
  super_admin_signatories?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  super_admin_signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp>;
  super_admin_user_roles?: InputMaybe<Super_Admin_User_Role_Bool_Exp>;
  super_admin_user_roles_aggregate?: InputMaybe<Super_Admin_User_Role_Aggregate_Bool_Exp>;
  token_transfer_receivers?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  token_transfer_receivers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
  token_transfer_senders?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  token_transfer_senders_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "equiteez_user". */
export type Equiteez_User_Order_By = {
  address?: InputMaybe<Order_By>;
  dodo_mav_history_datas_aggregate?: InputMaybe<Dodo_Mav_History_Data_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_blacklists_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Order_By>;
  kyc_members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Order_By>;
  kyc_registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Order_By>;
  kyc_whitelists_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Order_By>;
  launchpad_distribution_events_aggregate?: InputMaybe<Launchpad_Distribution_Event_Aggregate_Order_By>;
  launchpad_purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Order_By>;
  launchpad_purchases_aggregate?: InputMaybe<Launchpad_Purchase_Aggregate_Order_By>;
  marketplace_listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Order_By>;
  marketplace_offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Order_By>;
  orderbook_order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Order_By>;
  orderbook_orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Order_By>;
  super_admin_signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Order_By>;
  super_admin_user_roles_aggregate?: InputMaybe<Super_Admin_User_Role_Aggregate_Order_By>;
  token_transfer_receivers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
  token_transfer_senders_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "equiteez_user" */
export enum Equiteez_User_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "equiteez_user" */
export type Equiteez_User_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Equiteez_User_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Equiteez_User_Stream_Cursor_Value_Input = {
  /** Public key hash of the user (Mavryk address) */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type Equiteez_User_Token_Transfer_Aggregate_Bool_Exp = {
  count?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp_Count>;
};

export type Equiteez_User_Token_Transfer_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Equiteez_User_Token_Transfer_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Aggregate_Order_By = {
  avg?: InputMaybe<Equiteez_User_Token_Transfer_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Equiteez_User_Token_Transfer_Max_Order_By>;
  min?: InputMaybe<Equiteez_User_Token_Transfer_Min_Order_By>;
  stddev?: InputMaybe<Equiteez_User_Token_Transfer_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Equiteez_User_Token_Transfer_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Equiteez_User_Token_Transfer_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Equiteez_User_Token_Transfer_Sum_Order_By>;
  var_pop?: InputMaybe<Equiteez_User_Token_Transfer_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Equiteez_User_Token_Transfer_Var_Samp_Order_By>;
  variance?: InputMaybe<Equiteez_User_Token_Transfer_Variance_Order_By>;
};

/** order by avg() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Avg_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "equiteez_user_token_transfer". All fields are combined with a logical 'AND'. */
export type Equiteez_User_Token_Transfer_Bool_Exp = {
  _and?: InputMaybe<Array<Equiteez_User_Token_Transfer_Bool_Exp>>;
  _not?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  _or?: InputMaybe<Array<Equiteez_User_Token_Transfer_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  from_user?: InputMaybe<Equiteez_User_Bool_Exp>;
  from_user_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  to_user?: InputMaybe<Equiteez_User_Bool_Exp>;
  to_user_id?: InputMaybe<Int_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Max_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Mavryk operation hash */
  operation_hash?: InputMaybe<Order_By>;
  /** Transfer timestamp */
  timestamp?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Min_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  /** Mavryk operation hash */
  operation_hash?: InputMaybe<Order_By>;
  /** Transfer timestamp */
  timestamp?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "equiteez_user_token_transfer". */
export type Equiteez_User_Token_Transfer_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user?: InputMaybe<Equiteez_User_Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  to_user?: InputMaybe<Equiteez_User_Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** select columns of table "equiteez_user_token_transfer" */
export enum Equiteez_User_Token_Transfer_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  FromUserId = 'from_user_id',
  /** column name */
  Id = 'id',
  /** column name */
  Level = 'level',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  ToUserId = 'to_user_id',
  /** column name */
  TokenId = 'token_id'
}

/** order by stddev() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Pop_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Samp_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Equiteez_User_Token_Transfer_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Equiteez_User_Token_Transfer_Stream_Cursor_Value_Input = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Scalars['numeric']['input']>;
  from_user_id?: InputMaybe<Scalars['Int']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Scalars['bigint']['input']>;
  /** Mavryk operation hash */
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  /** Transfer timestamp */
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  to_user_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Sum_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Var_Pop_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Var_Samp_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Variance_Order_By = {
  /** Transfer amount (in smallest unit). numeric(76,0) to fit raw on-chain amounts of high-decimal tokens that overflow int64. */
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Mavryk blockchain level */
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
export type Float8_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['float8']['input']>;
  _gt?: InputMaybe<Scalars['float8']['input']>;
  _gte?: InputMaybe<Scalars['float8']['input']>;
  _in?: InputMaybe<Array<Scalars['float8']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['float8']['input']>;
  _lte?: InputMaybe<Scalars['float8']['input']>;
  _neq?: InputMaybe<Scalars['float8']['input']>;
  _nin?: InputMaybe<Array<Scalars['float8']['input']>>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

export type Kyc_Blacklisted_Aggregate_Bool_Exp = {
  count?: InputMaybe<Kyc_Blacklisted_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Blacklisted_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Blacklisted_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Blacklisted_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Blacklisted_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Blacklisted_Max_Order_By>;
  min?: InputMaybe<Kyc_Blacklisted_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Blacklisted_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Blacklisted_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Blacklisted_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Blacklisted_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Blacklisted_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Blacklisted_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Blacklisted_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_blacklisted". All fields are combined with a logical 'AND'. */
export type Kyc_Blacklisted_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Blacklisted_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Blacklisted_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Blacklisted_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Max_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Min_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_blacklisted". */
export type Kyc_Blacklisted_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_blacklisted" */
export enum Kyc_Blacklisted_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Blacklisted_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Blacklisted_Stream_Cursor_Value_Input = {
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc". All fields are combined with a logical 'AND'. */
export type Kyc_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  blacklisted?: InputMaybe<Kyc_Blacklisted_Bool_Exp>;
  blacklisted_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Bool_Exp>;
  country_transfer_rules?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  country_transfer_rules_aggregate?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp>;
  enable_kyc?: InputMaybe<Boolean_Comparison_Exp>;
  enable_membership?: InputMaybe<Boolean_Comparison_Exp>;
  entrypoint_status?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  entrypoint_status_aggregate?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  lambdas?: InputMaybe<Kyc_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Kyc_Lambda_Aggregate_Bool_Exp>;
  launchpads?: InputMaybe<Launchpad_Bool_Exp>;
  launchpads_aggregate?: InputMaybe<Launchpad_Aggregate_Bool_Exp>;
  members?: InputMaybe<Kyc_Member_Bool_Exp>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  membership_tier_discounts?: InputMaybe<Kyc_Membership_Tier_Discount_Bool_Exp>;
  membership_tier_discounts_aggregate?: InputMaybe<Kyc_Membership_Tier_Discount_Aggregate_Bool_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  orderbooks?: InputMaybe<Orderbook_Bool_Exp>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Bool_Exp>;
  registrars?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  valid_inputs?: InputMaybe<Kyc_Valid_Input_Bool_Exp>;
  valid_inputs_aggregate?: InputMaybe<Kyc_Valid_Input_Aggregate_Bool_Exp>;
  whitelisted?: InputMaybe<Kyc_Whitelisted_Bool_Exp>;
  whitelisted_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Bool_Exp>;
};

export type Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_And = {
  arguments: Kyc_Country_Transfer_Rule_Select_Column_Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Kyc_Country_Transfer_Rule_Select_Column_Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Country_Transfer_Rule_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Country_Transfer_Rule_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Country_Transfer_Rule_Max_Order_By>;
  min?: InputMaybe<Kyc_Country_Transfer_Rule_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Country_Transfer_Rule_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Country_Transfer_Rule_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Country_Transfer_Rule_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Country_Transfer_Rule_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Country_Transfer_Rule_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Country_Transfer_Rule_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Country_Transfer_Rule_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_country_transfer_rule". All fields are combined with a logical 'AND'. */
export type Kyc_Country_Transfer_Rule_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Country_Transfer_Rule_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Country_Transfer_Rule_Bool_Exp>>;
  blacklist_countries?: InputMaybe<String_Array_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  receiving_frozen?: InputMaybe<Boolean_Comparison_Exp>;
  sending_frozen?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  whitelist_countries?: InputMaybe<String_Array_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Max_Order_By = {
  /** Countries blocked from transfers */
  blacklist_countries?: InputMaybe<Order_By>;
  /** Country code */
  country?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Countries allowed to receive transfers */
  whitelist_countries?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Min_Order_By = {
  /** Countries blocked from transfers */
  blacklist_countries?: InputMaybe<Order_By>;
  /** Country code */
  country?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Countries allowed to receive transfers */
  whitelist_countries?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_country_transfer_rule". */
export type Kyc_Country_Transfer_Rule_Order_By = {
  blacklist_countries?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  receiving_frozen?: InputMaybe<Order_By>;
  sending_frozen?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  whitelist_countries?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_country_transfer_rule" */
export enum Kyc_Country_Transfer_Rule_Select_Column {
  /** column name */
  BlacklistCountries = 'blacklist_countries',
  /** column name */
  Country = 'country',
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  ReceivingFrozen = 'receiving_frozen',
  /** column name */
  SendingFrozen = 'sending_frozen',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  WhitelistCountries = 'whitelist_countries'
}

/** select "kyc_country_transfer_rule_aggregate_bool_exp_bool_and_arguments_columns" columns of table "kyc_country_transfer_rule" */
export enum Kyc_Country_Transfer_Rule_Select_Column_Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  ReceivingFrozen = 'receiving_frozen',
  /** column name */
  SendingFrozen = 'sending_frozen'
}

/** select "kyc_country_transfer_rule_aggregate_bool_exp_bool_or_arguments_columns" columns of table "kyc_country_transfer_rule" */
export enum Kyc_Country_Transfer_Rule_Select_Column_Kyc_Country_Transfer_Rule_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  ReceivingFrozen = 'receiving_frozen',
  /** column name */
  SendingFrozen = 'sending_frozen'
}

/** order by stddev() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Country_Transfer_Rule_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Country_Transfer_Rule_Stream_Cursor_Value_Input = {
  /** Countries blocked from transfers */
  blacklist_countries?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Country code */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  /** Whether receiving to this country is frozen */
  receiving_frozen?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether sending from this country is frozen */
  sending_frozen?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Countries allowed to receive transfers */
  whitelist_countries?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** order by sum() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

export type Kyc_Entrypoint_Status_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And = {
  arguments: Kyc_Entrypoint_Status_Select_Column_Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Kyc_Entrypoint_Status_Select_Column_Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Entrypoint_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Entrypoint_Status_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Entrypoint_Status_Max_Order_By>;
  min?: InputMaybe<Kyc_Entrypoint_Status_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Entrypoint_Status_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Entrypoint_Status_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Entrypoint_Status_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Entrypoint_Status_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Entrypoint_Status_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Entrypoint_Status_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Entrypoint_Status_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_entrypoint_status". All fields are combined with a logical 'AND'. */
export type Kyc_Entrypoint_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Entrypoint_Status_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Entrypoint_Status_Bool_Exp>>;
  contract?: InputMaybe<Kyc_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  entrypoint?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  paused?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_entrypoint_status". */
export type Kyc_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Kyc_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_entrypoint_status" */
export enum Kyc_Entrypoint_Status_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Entrypoint = 'entrypoint',
  /** column name */
  Id = 'id',
  /** column name */
  Paused = 'paused',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "kyc_entrypoint_status_aggregate_bool_exp_bool_and_arguments_columns" columns of table "kyc_entrypoint_status" */
export enum Kyc_Entrypoint_Status_Select_Column_Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** select "kyc_entrypoint_status_aggregate_bool_exp_bool_or_arguments_columns" columns of table "kyc_entrypoint_status" */
export enum Kyc_Entrypoint_Status_Select_Column_Kyc_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** order by stddev() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Entrypoint_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Entrypoint_Status_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  entrypoint?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Kyc_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Kyc_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_lambda" */
export type Kyc_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Lambda_Max_Order_By>;
  min?: InputMaybe<Kyc_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_lambda". All fields are combined with a logical 'AND'. */
export type Kyc_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Kyc_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_lambda". */
export type Kyc_Lambda_Order_By = {
  contract?: InputMaybe<Kyc_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_lambda" */
export enum Kyc_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_lambda" */
export type Kyc_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_lambda" */
export type Kyc_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Kyc_Member_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Member_Aggregate_Bool_Exp_Bool_And = {
  arguments: Kyc_Member_Select_Column_Kyc_Member_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Member_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Member_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Kyc_Member_Select_Column_Kyc_Member_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Member_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Member_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Member_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Member_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_member" */
export type Kyc_Member_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Member_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Member_Max_Order_By>;
  min?: InputMaybe<Kyc_Member_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Member_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Member_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Member_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Member_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Member_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Member_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Member_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_member" */
export type Kyc_Member_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_member". All fields are combined with a logical 'AND'. */
export type Kyc_Member_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Member_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Member_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Member_Bool_Exp>>;
  country?: InputMaybe<String_Comparison_Exp>;
  expire_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  frozen?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  investor_type?: InputMaybe<String_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  kyc_registrar?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  kyc_registrar_id?: InputMaybe<Int_Comparison_Exp>;
  membership_tier?: InputMaybe<String_Comparison_Exp>;
  region?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_member" */
export type Kyc_Member_Max_Order_By = {
  /** Member's country */
  country?: InputMaybe<Order_By>;
  /** KYC verification expiry date */
  expire_at?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Type of investor (enterprise, accredited, institution) */
  investor_type?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  /** Membership tier assigned to the member (e.g., "none", "tierA") */
  membership_tier?: InputMaybe<Order_By>;
  /** Member's region (e.g., asia, north-america) */
  region?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_member" */
export type Kyc_Member_Min_Order_By = {
  /** Member's country */
  country?: InputMaybe<Order_By>;
  /** KYC verification expiry date */
  expire_at?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Type of investor (enterprise, accredited, institution) */
  investor_type?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  /** Membership tier assigned to the member (e.g., "none", "tierA") */
  membership_tier?: InputMaybe<Order_By>;
  /** Member's region (e.g., asia, north-america) */
  region?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_member". */
export type Kyc_Member_Order_By = {
  country?: InputMaybe<Order_By>;
  expire_at?: InputMaybe<Order_By>;
  frozen?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  investor_type?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar?: InputMaybe<Kyc_Registrar_Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  membership_tier?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_member" */
export enum Kyc_Member_Select_Column {
  /** column name */
  Country = 'country',
  /** column name */
  ExpireAt = 'expire_at',
  /** column name */
  Frozen = 'frozen',
  /** column name */
  Id = 'id',
  /** column name */
  InvestorType = 'investor_type',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  KycRegistrarId = 'kyc_registrar_id',
  /** column name */
  MembershipTier = 'membership_tier',
  /** column name */
  Region = 'region',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "kyc_member_aggregate_bool_exp_bool_and_arguments_columns" columns of table "kyc_member" */
export enum Kyc_Member_Select_Column_Kyc_Member_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Frozen = 'frozen'
}

/** select "kyc_member_aggregate_bool_exp_bool_or_arguments_columns" columns of table "kyc_member" */
export enum Kyc_Member_Select_Column_Kyc_Member_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Frozen = 'frozen'
}

/** Boolean expression to filter rows from the table "kyc_member_status_view". All fields are combined with a logical 'AND'. */
export type Kyc_Member_Status_View_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Member_Status_View_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Member_Status_View_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Member_Status_View_Bool_Exp>>;
  country?: InputMaybe<String_Comparison_Exp>;
  expire_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  frozen?: InputMaybe<Boolean_Comparison_Exp>;
  investor_type?: InputMaybe<String_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_expired?: InputMaybe<Boolean_Comparison_Exp>;
  kyc_address?: InputMaybe<String_Comparison_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  kyc_member_id?: InputMaybe<Int_Comparison_Exp>;
  kyc_registrar_id?: InputMaybe<Int_Comparison_Exp>;
  region?: InputMaybe<String_Comparison_Exp>;
  user_address?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "kyc_member_status_view". */
export type Kyc_Member_Status_View_Order_By = {
  country?: InputMaybe<Order_By>;
  expire_at?: InputMaybe<Order_By>;
  frozen?: InputMaybe<Order_By>;
  investor_type?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  is_expired?: InputMaybe<Order_By>;
  kyc_address?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_member_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  user_address?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_member_status_view" */
export enum Kyc_Member_Status_View_Select_Column {
  /** column name */
  Country = 'country',
  /** column name */
  ExpireAt = 'expire_at',
  /** column name */
  Frozen = 'frozen',
  /** column name */
  InvestorType = 'investor_type',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  IsExpired = 'is_expired',
  /** column name */
  KycAddress = 'kyc_address',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  KycMemberId = 'kyc_member_id',
  /** column name */
  KycRegistrarId = 'kyc_registrar_id',
  /** column name */
  Region = 'region',
  /** column name */
  UserAddress = 'user_address',
  /** column name */
  UserId = 'user_id'
}

/** Streaming cursor of the table "kyc_member_status_view" */
export type Kyc_Member_Status_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Member_Status_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Member_Status_View_Stream_Cursor_Value_Input = {
  country?: InputMaybe<Scalars['String']['input']>;
  expire_at?: InputMaybe<Scalars['timestamptz']['input']>;
  frozen?: InputMaybe<Scalars['Boolean']['input']>;
  investor_type?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_expired?: InputMaybe<Scalars['Boolean']['input']>;
  kyc_address?: InputMaybe<Scalars['String']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  kyc_member_id?: InputMaybe<Scalars['Int']['input']>;
  kyc_registrar_id?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  user_address?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by stddev() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_member" */
export type Kyc_Member_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Member_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Member_Stream_Cursor_Value_Input = {
  /** Member's country */
  country?: InputMaybe<Scalars['String']['input']>;
  /** KYC verification expiry date */
  expire_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Whether member account is frozen */
  frozen?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Type of investor (enterprise, accredited, institution) */
  investor_type?: InputMaybe<Scalars['String']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  kyc_registrar_id?: InputMaybe<Scalars['Int']['input']>;
  /** Membership tier assigned to the member (e.g., "none", "tierA") */
  membership_tier?: InputMaybe<Scalars['String']['input']>;
  /** Member's region (e.g., asia, north-america) */
  region?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_member" */
export type Kyc_Member_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_member" */
export type Kyc_Member_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_member" */
export type Kyc_Member_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_member" */
export type Kyc_Member_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Kyc_Membership_Tier_Discount_Aggregate_Bool_Exp = {
  count?: InputMaybe<Kyc_Membership_Tier_Discount_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Membership_Tier_Discount_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Membership_Tier_Discount_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Membership_Tier_Discount_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Membership_Tier_Discount_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Membership_Tier_Discount_Max_Order_By>;
  min?: InputMaybe<Kyc_Membership_Tier_Discount_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Membership_Tier_Discount_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Membership_Tier_Discount_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Membership_Tier_Discount_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Membership_Tier_Discount_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Membership_Tier_Discount_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Membership_Tier_Discount_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Membership_Tier_Discount_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Avg_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_membership_tier_discount". All fields are combined with a logical 'AND'. */
export type Kyc_Membership_Tier_Discount_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Membership_Tier_Discount_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Membership_Tier_Discount_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Membership_Tier_Discount_Bool_Exp>>;
  discount_name?: InputMaybe<String_Comparison_Exp>;
  discount_value?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  membership_tier?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Max_Order_By = {
  /** Discount name (e.g., "exitFee") */
  discount_name?: InputMaybe<Order_By>;
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Membership tier name (e.g., "tierA") */
  membership_tier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Min_Order_By = {
  /** Discount name (e.g., "exitFee") */
  discount_name?: InputMaybe<Order_By>;
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Membership tier name (e.g., "tierA") */
  membership_tier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_membership_tier_discount". */
export type Kyc_Membership_Tier_Discount_Order_By = {
  discount_name?: InputMaybe<Order_By>;
  discount_value?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  membership_tier?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_membership_tier_discount" */
export enum Kyc_Membership_Tier_Discount_Select_Column {
  /** column name */
  DiscountName = 'discount_name',
  /** column name */
  DiscountValue = 'discount_value',
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  MembershipTier = 'membership_tier',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Stddev_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Stddev_Pop_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Stddev_Samp_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Membership_Tier_Discount_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Membership_Tier_Discount_Stream_Cursor_Value_Input = {
  /** Discount name (e.g., "exitFee") */
  discount_name?: InputMaybe<Scalars['String']['input']>;
  /** Discount value */
  discount_value?: InputMaybe<Scalars['bigint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  /** Membership tier name (e.g., "tierA") */
  membership_tier?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Sum_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Var_Pop_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Var_Samp_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_membership_tier_discount" */
export type Kyc_Membership_Tier_Discount_Variance_Order_By = {
  /** Discount value */
  discount_value?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc". */
export type Kyc_Order_By = {
  address?: InputMaybe<Order_By>;
  blacklisted_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Order_By>;
  country_transfer_rules_aggregate?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Order_By>;
  enable_kyc?: InputMaybe<Order_By>;
  enable_membership?: InputMaybe<Order_By>;
  entrypoint_status_aggregate?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Kyc_Lambda_Aggregate_Order_By>;
  launchpads_aggregate?: InputMaybe<Launchpad_Aggregate_Order_By>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Order_By>;
  membership_tier_discounts_aggregate?: InputMaybe<Kyc_Membership_Tier_Discount_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Order_By>;
  registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Order_By>;
  super_admin?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  valid_inputs_aggregate?: InputMaybe<Kyc_Valid_Input_Aggregate_Order_By>;
  whitelisted_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Order_By>;
};

export type Kyc_Registrar_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Registrar_Aggregate_Bool_Exp_Bool_And = {
  arguments: Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Registrar_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Kyc_Registrar_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Registrar_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_registrar" */
export type Kyc_Registrar_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Registrar_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Registrar_Max_Order_By>;
  min?: InputMaybe<Kyc_Registrar_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Registrar_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Registrar_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Registrar_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Registrar_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Registrar_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Registrar_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Registrar_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_registrar". All fields are combined with a logical 'AND'. */
export type Kyc_Registrar_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Registrar_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Registrar_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  freeze_member_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_admins?: InputMaybe<String_Array_Comparison_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  member_verified?: InputMaybe<Bigint_Comparison_Exp>;
  members?: InputMaybe<Kyc_Member_Bool_Exp>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  set_member_kyc_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  unfreeze_member_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Max_Order_By = {
  /** Registrar creation timestamp */
  created_at?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** List of KYC admin addresses */
  kyc_admins?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  /** Registrar name */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Min_Order_By = {
  /** Registrar creation timestamp */
  created_at?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** List of KYC admin addresses */
  kyc_admins?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  /** Registrar name */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_registrar". */
export type Kyc_Registrar_Order_By = {
  created_at?: InputMaybe<Order_By>;
  freeze_member_is_paused?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_admins?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Order_By>;
  name?: InputMaybe<Order_By>;
  set_member_kyc_is_paused?: InputMaybe<Order_By>;
  unfreeze_member_is_paused?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_registrar" */
export enum Kyc_Registrar_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FreezeMemberIsPaused = 'freeze_member_is_paused',
  /** column name */
  Id = 'id',
  /** column name */
  KycAdmins = 'kyc_admins',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  MemberVerified = 'member_verified',
  /** column name */
  Name = 'name',
  /** column name */
  SetMemberKycIsPaused = 'set_member_kyc_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "kyc_registrar_aggregate_bool_exp_bool_and_arguments_columns" columns of table "kyc_registrar" */
export enum Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  FreezeMemberIsPaused = 'freeze_member_is_paused',
  /** column name */
  SetMemberKycIsPaused = 'set_member_kyc_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused'
}

/** select "kyc_registrar_aggregate_bool_exp_bool_or_arguments_columns" columns of table "kyc_registrar" */
export enum Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  FreezeMemberIsPaused = 'freeze_member_is_paused',
  /** column name */
  SetMemberKycIsPaused = 'set_member_kyc_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused'
}

/** order by stddev() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_registrar" */
export type Kyc_Registrar_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Registrar_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Registrar_Stream_Cursor_Value_Input = {
  /** Registrar creation timestamp */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Whether freeze_member entrypoint is paused */
  freeze_member_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** List of KYC admin addresses */
  kyc_admins?: InputMaybe<Array<Scalars['String']['input']>>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  /** Count of verified members */
  member_verified?: InputMaybe<Scalars['bigint']['input']>;
  /** Registrar name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether set_member_kyc entrypoint is paused */
  set_member_kyc_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether unfreeze_member entrypoint is paused */
  unfreeze_member_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Count of verified members */
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc" */
export enum Kyc_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  EnableKyc = 'enable_kyc',
  /** column name */
  EnableMembership = 'enable_membership',
  /** column name */
  Id = 'id',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  SuperAdmin = 'super_admin',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "kyc" */
export type Kyc_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  /** Whether KYC verification is enabled on the contract */
  enable_kyc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether the membership program is enabled on the contract */
  enable_membership?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Pending super admin address (for transfer) */
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Current super admin address */
  super_admin?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type Kyc_Valid_Input_Aggregate_Bool_Exp = {
  count?: InputMaybe<Kyc_Valid_Input_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Valid_Input_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Valid_Input_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Valid_Input_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_valid_input" */
export type Kyc_Valid_Input_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Valid_Input_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Valid_Input_Max_Order_By>;
  min?: InputMaybe<Kyc_Valid_Input_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Valid_Input_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Valid_Input_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Valid_Input_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Valid_Input_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Valid_Input_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Valid_Input_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Valid_Input_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Avg_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_valid_input". All fields are combined with a logical 'AND'. */
export type Kyc_Valid_Input_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Valid_Input_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Valid_Input_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Valid_Input_Bool_Exp>>;
  category?: InputMaybe<Smallint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  valid_inputs?: InputMaybe<String_Array_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Max_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Array of valid input values */
  valid_inputs?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Min_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  /** Array of valid input values */
  valid_inputs?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_valid_input". */
export type Kyc_Valid_Input_Order_By = {
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  valid_inputs?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_valid_input" */
export enum Kyc_Valid_Input_Select_Column {
  /** column name */
  Category = 'category',
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ValidInputs = 'valid_inputs'
}

/** order by stddev() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Pop_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Samp_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_valid_input" */
export type Kyc_Valid_Input_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Valid_Input_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Valid_Input_Stream_Cursor_Value_Input = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Scalars['smallint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Array of valid input values */
  valid_inputs?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** order by sum() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Sum_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Var_Pop_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Var_Samp_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Variance_Order_By = {
  /** Input category (COUNTRY/REGION/INVESTOR_TYPE) */
  category?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

export type Kyc_Whitelisted_Aggregate_Bool_Exp = {
  count?: InputMaybe<Kyc_Whitelisted_Aggregate_Bool_Exp_Count>;
};

export type Kyc_Whitelisted_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Kyc_Whitelisted_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Kyc_Whitelisted_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Aggregate_Order_By = {
  avg?: InputMaybe<Kyc_Whitelisted_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Kyc_Whitelisted_Max_Order_By>;
  min?: InputMaybe<Kyc_Whitelisted_Min_Order_By>;
  stddev?: InputMaybe<Kyc_Whitelisted_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Kyc_Whitelisted_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Kyc_Whitelisted_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Kyc_Whitelisted_Sum_Order_By>;
  var_pop?: InputMaybe<Kyc_Whitelisted_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Kyc_Whitelisted_Var_Samp_Order_By>;
  variance?: InputMaybe<Kyc_Whitelisted_Variance_Order_By>;
};

/** order by avg() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_whitelisted". All fields are combined with a logical 'AND'. */
export type Kyc_Whitelisted_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Whitelisted_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Whitelisted_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Whitelisted_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Max_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Min_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_whitelisted". */
export type Kyc_Whitelisted_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc_whitelisted" */
export enum Kyc_Whitelisted_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Kyc_Whitelisted_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Kyc_Whitelisted_Stream_Cursor_Value_Input = {
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Launchpad_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Launchpad_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Launchpad_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Launchpad_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Aggregate_Bool_Exp_Bool_And = {
  arguments: Launchpad_Select_Column_Launchpad_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Launchpad_Select_Column_Launchpad_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad" */
export type Launchpad_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Max_Order_By>;
  min?: InputMaybe<Launchpad_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad" */
export type Launchpad_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad". All fields are combined with a logical 'AND'. */
export type Launchpad_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  entrypoint_status?: InputMaybe<Launchpad_Entrypoint_Status_Bool_Exp>;
  entrypoint_status_aggregate?: InputMaybe<Launchpad_Entrypoint_Status_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  lambdas?: InputMaybe<Launchpad_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Launchpad_Lambda_Aggregate_Bool_Exp>;
  launches?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launches_aggregate?: InputMaybe<Launchpad_Launch_Aggregate_Bool_Exp>;
  membership_kyc?: InputMaybe<Kyc_Bool_Exp>;
  membership_kyc_id?: InputMaybe<Int_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
  treasuries?: InputMaybe<Launchpad_Treasury_Bool_Exp>;
  treasuries_aggregate?: InputMaybe<Launchpad_Treasury_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

export type Launchpad_Distribution_Event_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Distribution_Event_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Distribution_Event_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Distribution_Event_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Distribution_Event_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Distribution_Event_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Distribution_Event_Max_Order_By>;
  min?: InputMaybe<Launchpad_Distribution_Event_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Distribution_Event_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Distribution_Event_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Distribution_Event_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Distribution_Event_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Distribution_Event_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Distribution_Event_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Distribution_Event_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Avg_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_distribution_event". All fields are combined with a logical 'AND'. */
export type Launchpad_Distribution_Event_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Distribution_Event_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Distribution_Event_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Distribution_Event_Bool_Exp>>;
  amount?: InputMaybe<Bigint_Comparison_Exp>;
  batch_index?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  launch?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Max_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Min_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_distribution_event". */
export type Launchpad_Distribution_Event_Order_By = {
  amount?: InputMaybe<Order_By>;
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch?: InputMaybe<Launchpad_Launch_Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_distribution_event" */
export enum Launchpad_Distribution_Event_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BatchIndex = 'batch_index',
  /** column name */
  Id = 'id',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  Level = 'level',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Stddev_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Stddev_Pop_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Stddev_Samp_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Distribution_Event_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Distribution_Event_Stream_Cursor_Value_Input = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['bigint']['input']>;
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Sum_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Var_Pop_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Var_Samp_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_distribution_event" */
export type Launchpad_Distribution_Event_Variance_Order_By = {
  /** Tokens distributed in this event */
  amount?: InputMaybe<Order_By>;
  /** Position in the distributeTokens parameter batch. See LaunchpadPurchaseEvent for the rationale. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Launchpad_Entrypoint_Status_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And = {
  arguments: Launchpad_Entrypoint_Status_Select_Column_Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Launchpad_Entrypoint_Status_Select_Column_Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Entrypoint_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Entrypoint_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Entrypoint_Status_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Entrypoint_Status_Max_Order_By>;
  min?: InputMaybe<Launchpad_Entrypoint_Status_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Entrypoint_Status_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Entrypoint_Status_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Entrypoint_Status_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Entrypoint_Status_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Entrypoint_Status_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Entrypoint_Status_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Entrypoint_Status_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_entrypoint_status". All fields are combined with a logical 'AND'. */
export type Launchpad_Entrypoint_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Entrypoint_Status_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Entrypoint_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Entrypoint_Status_Bool_Exp>>;
  contract?: InputMaybe<Launchpad_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  entrypoint?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  paused?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_entrypoint_status". */
export type Launchpad_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Launchpad_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_entrypoint_status" */
export enum Launchpad_Entrypoint_Status_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Entrypoint = 'entrypoint',
  /** column name */
  Id = 'id',
  /** column name */
  Paused = 'paused',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "launchpad_entrypoint_status_aggregate_bool_exp_bool_and_arguments_columns" columns of table "launchpad_entrypoint_status" */
export enum Launchpad_Entrypoint_Status_Select_Column_Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** select "launchpad_entrypoint_status_aggregate_bool_exp_bool_or_arguments_columns" columns of table "launchpad_entrypoint_status" */
export enum Launchpad_Entrypoint_Status_Select_Column_Launchpad_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** order by stddev() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Entrypoint_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Entrypoint_Status_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  entrypoint?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_entrypoint_status" */
export type Launchpad_Entrypoint_Status_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Launchpad_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_lambda" */
export type Launchpad_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Lambda_Max_Order_By>;
  min?: InputMaybe<Launchpad_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_lambda". All fields are combined with a logical 'AND'. */
export type Launchpad_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Launchpad_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_lambda". */
export type Launchpad_Lambda_Order_By = {
  contract?: InputMaybe<Launchpad_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_lambda" */
export enum Launchpad_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_lambda" */
export type Launchpad_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_lambda" */
export type Launchpad_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Launchpad_Launch_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Launchpad_Launch_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Launchpad_Launch_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Launchpad_Launch_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Launch_Aggregate_Bool_Exp_Bool_And = {
  arguments: Launchpad_Launch_Select_Column_Launchpad_Launch_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Launch_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Launchpad_Launch_Select_Column_Launchpad_Launch_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Launch_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Launch_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_launch" */
export type Launchpad_Launch_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Launch_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Launch_Max_Order_By>;
  min?: InputMaybe<Launchpad_Launch_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Launch_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Launch_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Launch_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Launch_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Launch_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Launch_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Launch_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_launch". All fields are combined with a logical 'AND'. */
export type Launchpad_Launch_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Launch_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Launch_Bool_Exp>>;
  distribution_events?: InputMaybe<Launchpad_Distribution_Event_Bool_Exp>;
  distribution_events_aggregate?: InputMaybe<Launchpad_Distribution_Event_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  launchpad?: InputMaybe<Launchpad_Bool_Exp>;
  launchpad_id?: InputMaybe<Int_Comparison_Exp>;
  max_amount_cap?: InputMaybe<Bigint_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  purchase_events?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Bool_Exp>;
  purchase_fee_percent?: InputMaybe<Bigint_Comparison_Exp>;
  purchases?: InputMaybe<Launchpad_Purchase_Bool_Exp>;
  purchases_aggregate?: InputMaybe<Launchpad_Purchase_Aggregate_Bool_Exp>;
  sale_closed?: InputMaybe<Timestamptz_Comparison_Exp>;
  sale_end?: InputMaybe<Timestamptz_Comparison_Exp>;
  sale_options?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  sale_options_aggregate?: InputMaybe<Launchpad_Sale_Option_Aggregate_Bool_Exp>;
  sale_start?: InputMaybe<Timestamptz_Comparison_Exp>;
  status?: InputMaybe<Smallint_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_distribution_type?: InputMaybe<Smallint_Comparison_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  token_issuance_type?: InputMaybe<Smallint_Comparison_Exp>;
  total_bought?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Launch name (PK part in launchLedger) */
  name?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  sale_closed?: InputMaybe<Order_By>;
  sale_end?: InputMaybe<Order_By>;
  /** Schedule */
  sale_start?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Launch name (PK part in launchLedger) */
  name?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  sale_closed?: InputMaybe<Order_By>;
  sale_end?: InputMaybe<Order_By>;
  /** Schedule */
  sale_start?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_launch". */
export type Launchpad_Launch_Order_By = {
  distribution_events_aggregate?: InputMaybe<Launchpad_Distribution_Event_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  is_paused?: InputMaybe<Order_By>;
  launchpad?: InputMaybe<Launchpad_Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  max_amount_cap?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Order_By>;
  purchase_fee_percent?: InputMaybe<Order_By>;
  purchases_aggregate?: InputMaybe<Launchpad_Purchase_Aggregate_Order_By>;
  sale_closed?: InputMaybe<Order_By>;
  sale_end?: InputMaybe<Order_By>;
  sale_options_aggregate?: InputMaybe<Launchpad_Sale_Option_Aggregate_Order_By>;
  sale_start?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  token_issuance_type?: InputMaybe<Order_By>;
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_launch" */
export enum Launchpad_Launch_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  IsPaused = 'is_paused',
  /** column name */
  LaunchpadId = 'launchpad_id',
  /** column name */
  MaxAmountCap = 'max_amount_cap',
  /** column name */
  Name = 'name',
  /** column name */
  PurchaseFeePercent = 'purchase_fee_percent',
  /** column name */
  SaleClosed = 'sale_closed',
  /** column name */
  SaleEnd = 'sale_end',
  /** column name */
  SaleStart = 'sale_start',
  /** column name */
  Status = 'status',
  /** column name */
  TokenDistributionType = 'token_distribution_type',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TokenIssuanceType = 'token_issuance_type',
  /** column name */
  TotalBought = 'total_bought',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "launchpad_launch_aggregate_bool_exp_bool_and_arguments_columns" columns of table "launchpad_launch" */
export enum Launchpad_Launch_Select_Column_Launchpad_Launch_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsPaused = 'is_paused'
}

/** select "launchpad_launch_aggregate_bool_exp_bool_or_arguments_columns" columns of table "launchpad_launch" */
export enum Launchpad_Launch_Select_Column_Launchpad_Launch_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsPaused = 'is_paused'
}

/** Boolean expression to filter rows from the table "launchpad_launch_stats". All fields are combined with a logical 'AND'. */
export type Launchpad_Launch_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Launch_Stats_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Launch_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Launch_Stats_Bool_Exp>>;
  last_purchase_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  participant_count?: InputMaybe<Bigint_Comparison_Exp>;
  purchase_event_count?: InputMaybe<Bigint_Comparison_Exp>;
  total_raised_by_token?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_launch_stats". */
export type Launchpad_Launch_Stats_Order_By = {
  last_purchase_at?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  participant_count?: InputMaybe<Order_By>;
  purchase_event_count?: InputMaybe<Order_By>;
  total_raised_by_token?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_launch_stats" */
export enum Launchpad_Launch_Stats_Select_Column {
  /** column name */
  LastPurchaseAt = 'last_purchase_at',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  ParticipantCount = 'participant_count',
  /** column name */
  PurchaseEventCount = 'purchase_event_count',
  /** column name */
  TotalRaisedByToken = 'total_raised_by_token'
}

/** Streaming cursor of the table "launchpad_launch_stats" */
export type Launchpad_Launch_Stats_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Launch_Stats_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Launch_Stats_Stream_Cursor_Value_Input = {
  last_purchase_at?: InputMaybe<Scalars['timestamptz']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  participant_count?: InputMaybe<Scalars['bigint']['input']>;
  purchase_event_count?: InputMaybe<Scalars['bigint']['input']>;
  total_raised_by_token?: InputMaybe<Scalars['jsonb']['input']>;
};

/** order by stddev() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_launch" */
export type Launchpad_Launch_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Launch_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Launch_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Convenience flag: true iff any pause entry covers this launch */
  is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  launchpad_id?: InputMaybe<Scalars['Int']['input']>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Scalars['bigint']['input']>;
  /** Launch name (PK part in launchLedger) */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Scalars['bigint']['input']>;
  sale_closed?: InputMaybe<Scalars['timestamptz']['input']>;
  sale_end?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Schedule */
  sale_start?: InputMaybe<Scalars['timestamptz']['input']>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Scalars['smallint']['input']>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Scalars['smallint']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Scalars['smallint']['input']>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_launch" */
export type Launchpad_Launch_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Total supply cap for this launch */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Fee percent for purchases (basis points or nat as stored on chain) */
  purchase_fee_percent?: InputMaybe<Order_By>;
  /** ACTIVE / INACTIVE / PAUSED / CLOSED */
  status?: InputMaybe<Order_By>;
  /** auto / manual */
  token_distribution_type?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** mint / transfer */
  token_issuance_type?: InputMaybe<Order_By>;
  /** Running tally of purchased tokens (all sale options combined) */
  total_bought?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "launchpad" */
export type Launchpad_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
  /** Pending super admin address (2-step rotation) */
  new_super_admin?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad" */
export type Launchpad_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
  /** Pending super admin address (2-step rotation) */
  new_super_admin?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad". */
export type Launchpad_Order_By = {
  address?: InputMaybe<Order_By>;
  entrypoint_status_aggregate?: InputMaybe<Launchpad_Entrypoint_Status_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Launchpad_Lambda_Aggregate_Order_By>;
  launches_aggregate?: InputMaybe<Launchpad_Launch_Aggregate_Order_By>;
  membership_kyc?: InputMaybe<Kyc_Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  treasuries_aggregate?: InputMaybe<Launchpad_Treasury_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

export type Launchpad_Purchase_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Purchase_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Purchase_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Purchase_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Purchase_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_purchase" */
export type Launchpad_Purchase_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Purchase_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Purchase_Max_Order_By>;
  min?: InputMaybe<Launchpad_Purchase_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Purchase_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Purchase_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Purchase_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Purchase_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Purchase_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Purchase_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Purchase_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Bool_Exp>>;
  by_option?: InputMaybe<Launchpad_Purchase_By_Option_Bool_Exp>;
  by_option_aggregate?: InputMaybe<Launchpad_Purchase_By_Option_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  launch?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  total_distributed?: InputMaybe<Bigint_Comparison_Exp>;
  total_purchased?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

export type Launchpad_Purchase_By_Option_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Purchase_By_Option_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Purchase_By_Option_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Purchase_By_Option_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Purchase_By_Option_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Purchase_By_Option_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Purchase_By_Option_Max_Order_By>;
  min?: InputMaybe<Launchpad_Purchase_By_Option_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Purchase_By_Option_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Purchase_By_Option_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Purchase_By_Option_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Purchase_By_Option_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Purchase_By_Option_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Purchase_By_Option_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Purchase_By_Option_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_by_option". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_By_Option_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_By_Option_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_By_Option_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_By_Option_Bool_Exp>>;
  amount?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  purchase?: InputMaybe<Launchpad_Purchase_Bool_Exp>;
  purchase_id?: InputMaybe<Int_Comparison_Exp>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  sale_option_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_purchase_by_option". */
export type Launchpad_Purchase_By_Option_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase?: InputMaybe<Launchpad_Purchase_Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_by_option" */
export enum Launchpad_Purchase_By_Option_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  Id = 'id',
  /** column name */
  PurchaseId = 'purchase_id',
  /** column name */
  SaleOptionId = 'sale_option_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_By_Option_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_By_Option_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  purchase_id?: InputMaybe<Scalars['Int']['input']>;
  sale_option_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_purchase_by_option" */
export type Launchpad_Purchase_By_Option_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  purchase_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

export type Launchpad_Purchase_Event_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Purchase_Event_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Purchase_Event_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Purchase_Event_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Purchase_Event_Max_Order_By>;
  min?: InputMaybe<Launchpad_Purchase_Event_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Purchase_Event_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Purchase_Event_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Purchase_Event_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Purchase_Event_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Purchase_Event_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Purchase_Event_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Purchase_Event_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Avg_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_event". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Event_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Event_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Event_Bool_Exp>>;
  amount?: InputMaybe<Bigint_Comparison_Exp>;
  batch_index?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  launch?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  payment_name?: InputMaybe<String_Comparison_Exp>;
  payment_token?: InputMaybe<Token_Bool_Exp>;
  payment_token_id?: InputMaybe<Int_Comparison_Exp>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  sale_option_id?: InputMaybe<Int_Comparison_Exp>;
  source?: InputMaybe<Smallint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Max_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  /** Mavryk operation hash for traceability */
  operation_hash?: InputMaybe<Order_By>;
  /** Payment name used (key in saleOption.payments) */
  payment_name?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Min_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  /** Mavryk operation hash for traceability */
  operation_hash?: InputMaybe<Order_By>;
  /** Payment name used (key in saleOption.payments) */
  payment_name?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_purchase_event". */
export type Launchpad_Purchase_Event_Order_By = {
  amount?: InputMaybe<Order_By>;
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch?: InputMaybe<Launchpad_Launch_Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  payment_name?: InputMaybe<Order_By>;
  payment_token?: InputMaybe<Token_Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_event" */
export enum Launchpad_Purchase_Event_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  BatchIndex = 'batch_index',
  /** column name */
  Id = 'id',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  Level = 'level',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  PaymentName = 'payment_name',
  /** column name */
  PaymentTokenId = 'payment_token_id',
  /** column name */
  SaleOptionId = 'sale_option_id',
  /** column name */
  Source = 'source',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Stddev_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Stddev_Pop_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Stddev_Samp_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Event_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Event_Stream_Cursor_Value_Input = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['bigint']['input']>;
  /** Mavryk operation hash for traceability */
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  /** Payment name used (key in saleOption.payments) */
  payment_name?: InputMaybe<Scalars['String']['input']>;
  payment_token_id?: InputMaybe<Scalars['Int']['input']>;
  sale_option_id?: InputMaybe<Scalars['Int']['input']>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Scalars['smallint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Sum_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Var_Pop_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Var_Samp_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_purchase_event" */
export type Launchpad_Purchase_Event_Variance_Order_By = {
  /** Tokens purchased in this single event */
  amount?: InputMaybe<Order_By>;
  /** Position in the parameter batch (0 for single-purchase entrypoint, 0..N-1 for items in a setPurchaseRecord batch). Together with operation_hash, launch, user, sale_option and source forms the dedup key — see unique_together below. Without it, two purchases by the same user in the same option within one admin batch would collide. */
  batch_index?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  payment_token_id?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  /** USER (on-chain) vs ADMIN (off-chain reconciliation) */
  source?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_purchase". */
export type Launchpad_Purchase_Order_By = {
  by_option_aggregate?: InputMaybe<Launchpad_Purchase_By_Option_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  launch?: InputMaybe<Launchpad_Launch_Order_By>;
  launch_id?: InputMaybe<Order_By>;
  total_distributed?: InputMaybe<Order_By>;
  total_purchased?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase" */
export enum Launchpad_Purchase_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  TotalDistributed = 'total_distributed',
  /** column name */
  TotalPurchased = 'total_purchased',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1d". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1d_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1d_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1d_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1d_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  bucket?: InputMaybe<Timestamptz_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1d". */
export type Launchpad_Purchase_Stats_1d_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  bucket?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1d" */
export enum Launchpad_Purchase_Stats_1d_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1d" */
export type Launchpad_Purchase_Stats_1d_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1d_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1d_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  bucket?: InputMaybe<Scalars['timestamptz']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1d_view". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1d_View_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1d_View_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1d_View_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1d_View_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1d_view". */
export type Launchpad_Purchase_Stats_1d_View_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1d_view" */
export enum Launchpad_Purchase_Stats_1d_View_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1d_view" */
export type Launchpad_Purchase_Stats_1d_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1d_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1d_View_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1h". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1h_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1h_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1h_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1h_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  bucket?: InputMaybe<Timestamptz_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1h". */
export type Launchpad_Purchase_Stats_1h_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  bucket?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1h" */
export enum Launchpad_Purchase_Stats_1h_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1h" */
export type Launchpad_Purchase_Stats_1h_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1h_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1h_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  bucket?: InputMaybe<Scalars['timestamptz']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1h_view". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1h_View_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1h_View_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1h_View_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1h_View_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1h_view". */
export type Launchpad_Purchase_Stats_1h_View_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1h_view" */
export enum Launchpad_Purchase_Stats_1h_View_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1h_view" */
export type Launchpad_Purchase_Stats_1h_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1h_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1h_View_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1w". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1w_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1w_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1w_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1w_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  bucket?: InputMaybe<Timestamptz_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1w". */
export type Launchpad_Purchase_Stats_1w_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  bucket?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1w" */
export enum Launchpad_Purchase_Stats_1w_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  Bucket = 'bucket',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1w" */
export type Launchpad_Purchase_Stats_1w_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1w_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1w_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  bucket?: InputMaybe<Scalars['timestamptz']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "launchpad_purchase_stats_1w_view". All fields are combined with a logical 'AND'. */
export type Launchpad_Purchase_Stats_1w_View_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Purchase_Stats_1w_View_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Purchase_Stats_1w_View_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Purchase_Stats_1w_View_Bool_Exp>>;
  avg_amount?: InputMaybe<Bigint_Comparison_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  purchase_count?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  total_amount?: InputMaybe<Numeric_Comparison_Exp>;
  unique_buyers?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "launchpad_purchase_stats_1w_view". */
export type Launchpad_Purchase_Stats_1w_View_Order_By = {
  avg_amount?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  purchase_count?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  total_amount?: InputMaybe<Order_By>;
  unique_buyers?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_purchase_stats_1w_view" */
export enum Launchpad_Purchase_Stats_1w_View_Select_Column {
  /** column name */
  AvgAmount = 'avg_amount',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  PurchaseCount = 'purchase_count',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TotalAmount = 'total_amount',
  /** column name */
  UniqueBuyers = 'unique_buyers'
}

/** Streaming cursor of the table "launchpad_purchase_stats_1w_view" */
export type Launchpad_Purchase_Stats_1w_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stats_1w_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stats_1w_View_Stream_Cursor_Value_Input = {
  avg_amount?: InputMaybe<Scalars['bigint']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  purchase_count?: InputMaybe<Scalars['bigint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  total_amount?: InputMaybe<Scalars['numeric']['input']>;
  unique_buyers?: InputMaybe<Scalars['bigint']['input']>;
};

/** order by stddev() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_purchase" */
export type Launchpad_Purchase_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Purchase_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Purchase_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Scalars['bigint']['input']>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_purchase" */
export type Launchpad_Purchase_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Total tokens already distributed to the user */
  total_distributed?: InputMaybe<Order_By>;
  /** Total tokens purchased across all sale options */
  total_purchased?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Launchpad_Sale_Option_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Launchpad_Sale_Option_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_And = {
  arguments: Launchpad_Sale_Option_Select_Column_Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Launchpad_Sale_Option_Select_Column_Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Launchpad_Sale_Option_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Sale_Option_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Sale_Option_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Sale_Option_Max_Order_By>;
  min?: InputMaybe<Launchpad_Sale_Option_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Sale_Option_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Sale_Option_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Sale_Option_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Sale_Option_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Sale_Option_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Sale_Option_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Sale_Option_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_sale_option". All fields are combined with a logical 'AND'. */
export type Launchpad_Sale_Option_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Sale_Option_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Sale_Option_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  launch?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launch_id?: InputMaybe<Int_Comparison_Exp>;
  max_amount_cap?: InputMaybe<Bigint_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  payments?: InputMaybe<Launchpad_Sale_Option_Payment_Bool_Exp>;
  payments_aggregate?: InputMaybe<Launchpad_Sale_Option_Payment_Aggregate_Bool_Exp>;
  purchase_breakdowns?: InputMaybe<Launchpad_Purchase_By_Option_Bool_Exp>;
  purchase_breakdowns_aggregate?: InputMaybe<Launchpad_Purchase_By_Option_Aggregate_Bool_Exp>;
  purchase_events?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Bool_Exp>;
  sale_end?: InputMaybe<Timestamptz_Comparison_Exp>;
  sale_start?: InputMaybe<Timestamptz_Comparison_Exp>;
  tiers?: InputMaybe<Launchpad_Sale_Option_Tier_Bool_Exp>;
  tiers_aggregate?: InputMaybe<Launchpad_Sale_Option_Tier_Aggregate_Bool_Exp>;
  total_bought?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Sale option name (key in saleOptions map) */
  name?: InputMaybe<Order_By>;
  sale_end?: InputMaybe<Order_By>;
  /** Per-option schedule overrides */
  sale_start?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Sale option name (key in saleOptions map) */
  name?: InputMaybe<Order_By>;
  sale_end?: InputMaybe<Order_By>;
  /** Per-option schedule overrides */
  sale_start?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_sale_option". */
export type Launchpad_Sale_Option_Order_By = {
  id?: InputMaybe<Order_By>;
  is_paused?: InputMaybe<Order_By>;
  launch?: InputMaybe<Launchpad_Launch_Order_By>;
  launch_id?: InputMaybe<Order_By>;
  max_amount_cap?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  payments_aggregate?: InputMaybe<Launchpad_Sale_Option_Payment_Aggregate_Order_By>;
  purchase_breakdowns_aggregate?: InputMaybe<Launchpad_Purchase_By_Option_Aggregate_Order_By>;
  purchase_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Order_By>;
  sale_end?: InputMaybe<Order_By>;
  sale_start?: InputMaybe<Order_By>;
  tiers_aggregate?: InputMaybe<Launchpad_Sale_Option_Tier_Aggregate_Order_By>;
  total_bought?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

export type Launchpad_Sale_Option_Payment_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Sale_Option_Payment_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Sale_Option_Payment_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Sale_Option_Payment_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Sale_Option_Payment_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Sale_Option_Payment_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Sale_Option_Payment_Max_Order_By>;
  min?: InputMaybe<Launchpad_Sale_Option_Payment_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Sale_Option_Payment_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Sale_Option_Payment_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Sale_Option_Payment_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Sale_Option_Payment_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Sale_Option_Payment_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Sale_Option_Payment_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Sale_Option_Payment_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_sale_option_payment". All fields are combined with a logical 'AND'. */
export type Launchpad_Sale_Option_Payment_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Sale_Option_Payment_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Sale_Option_Payment_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Sale_Option_Payment_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  sale_option_id?: InputMaybe<Int_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Payment name (key in payments map, e.g. "usdt") */
  name?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Payment name (key in payments map, e.g. "usdt") */
  name?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_sale_option_payment". */
export type Launchpad_Sale_Option_Payment_Order_By = {
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_sale_option_payment" */
export enum Launchpad_Sale_Option_Payment_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Price = 'price',
  /** column name */
  SaleOptionId = 'sale_option_id',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Sale_Option_Payment_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Sale_Option_Payment_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Payment name (key in payments map, e.g. "usdt") */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Scalars['bigint']['input']>;
  sale_option_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_sale_option_payment" */
export type Launchpad_Sale_Option_Payment_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Unit price in the payment token's smallest unit */
  price?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_sale_option" */
export enum Launchpad_Sale_Option_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  IsPaused = 'is_paused',
  /** column name */
  LaunchId = 'launch_id',
  /** column name */
  MaxAmountCap = 'max_amount_cap',
  /** column name */
  Name = 'name',
  /** column name */
  SaleEnd = 'sale_end',
  /** column name */
  SaleStart = 'sale_start',
  /** column name */
  TotalBought = 'total_bought',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "launchpad_sale_option_aggregate_bool_exp_bool_and_arguments_columns" columns of table "launchpad_sale_option" */
export enum Launchpad_Sale_Option_Select_Column_Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsPaused = 'is_paused'
}

/** select "launchpad_sale_option_aggregate_bool_exp_bool_or_arguments_columns" columns of table "launchpad_sale_option" */
export enum Launchpad_Sale_Option_Select_Column_Launchpad_Sale_Option_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsPaused = 'is_paused'
}

/** order by stddev() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Sale_Option_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Sale_Option_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  launch_id?: InputMaybe<Scalars['Int']['input']>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Scalars['bigint']['input']>;
  /** Sale option name (key in saleOptions map) */
  name?: InputMaybe<Scalars['String']['input']>;
  sale_end?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Per-option schedule overrides */
  sale_start?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

export type Launchpad_Sale_Option_Tier_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Sale_Option_Tier_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Sale_Option_Tier_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Sale_Option_Tier_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Sale_Option_Tier_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Sale_Option_Tier_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Sale_Option_Tier_Max_Order_By>;
  min?: InputMaybe<Launchpad_Sale_Option_Tier_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Sale_Option_Tier_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Sale_Option_Tier_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Sale_Option_Tier_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Sale_Option_Tier_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Sale_Option_Tier_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Sale_Option_Tier_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Sale_Option_Tier_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_sale_option_tier". All fields are combined with a logical 'AND'. */
export type Launchpad_Sale_Option_Tier_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Sale_Option_Tier_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Sale_Option_Tier_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Sale_Option_Tier_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  max_amount_per_wallet_total?: InputMaybe<Bigint_Comparison_Exp>;
  min_purchase_amount?: InputMaybe<Bigint_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Bool_Exp>;
  sale_option_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  /** Tier name (key in allowedMembershipTiers). "none" denotes public sale. */
  name?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  /** Tier name (key in allowedMembershipTiers). "none" denotes public sale. */
  name?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_sale_option_tier". */
export type Launchpad_Sale_Option_Tier_Order_By = {
  id?: InputMaybe<Order_By>;
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  min_purchase_amount?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  sale_option?: InputMaybe<Launchpad_Sale_Option_Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_sale_option_tier" */
export enum Launchpad_Sale_Option_Tier_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  MaxAmountPerWalletTotal = 'max_amount_per_wallet_total',
  /** column name */
  MinPurchaseAmount = 'min_purchase_amount',
  /** column name */
  Name = 'name',
  /** column name */
  SaleOptionId = 'sale_option_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Sale_Option_Tier_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Sale_Option_Tier_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Scalars['bigint']['input']>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Tier name (key in allowedMembershipTiers). "none" denotes public sale. */
  name?: InputMaybe<Scalars['String']['input']>;
  sale_option_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_sale_option_tier" */
export type Launchpad_Sale_Option_Tier_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  /** Optional per-tier per-wallet cumulative cap (null = unlimited) */
  max_amount_per_wallet_total?: InputMaybe<Order_By>;
  /** Optional per-tier minimum purchase (null = no minimum) */
  min_purchase_amount?: InputMaybe<Order_By>;
  sale_option_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_sale_option" */
export type Launchpad_Sale_Option_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  launch_id?: InputMaybe<Order_By>;
  /** Optional global cap (null = unlimited) */
  max_amount_cap?: InputMaybe<Order_By>;
  /** Running tally for this sale option */
  total_bought?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad" */
export enum Launchpad_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  MembershipKycId = 'membership_kyc_id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  SuperAdmin = 'super_admin',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "launchpad_aggregate_bool_exp_bool_and_arguments_columns" columns of table "launchpad" */
export enum Launchpad_Select_Column_Launchpad_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  InAllowlist = 'in_allowlist'
}

/** select "launchpad_aggregate_bool_exp_bool_or_arguments_columns" columns of table "launchpad" */
export enum Launchpad_Select_Column_Launchpad_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  InAllowlist = 'in_allowlist'
}

/** order by stddev() on columns of table "launchpad" */
export type Launchpad_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad" */
export type Launchpad_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad" */
export type Launchpad_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad" */
export type Launchpad_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  membership_kyc_id?: InputMaybe<Scalars['Int']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Pending super admin address (2-step rotation) */
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Current super admin address */
  super_admin?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad" */
export type Launchpad_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

export type Launchpad_Treasury_Aggregate_Bool_Exp = {
  count?: InputMaybe<Launchpad_Treasury_Aggregate_Bool_Exp_Count>;
};

export type Launchpad_Treasury_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Launchpad_Treasury_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Launchpad_Treasury_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "launchpad_treasury" */
export type Launchpad_Treasury_Aggregate_Order_By = {
  avg?: InputMaybe<Launchpad_Treasury_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Launchpad_Treasury_Max_Order_By>;
  min?: InputMaybe<Launchpad_Treasury_Min_Order_By>;
  stddev?: InputMaybe<Launchpad_Treasury_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Launchpad_Treasury_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Launchpad_Treasury_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Launchpad_Treasury_Sum_Order_By>;
  var_pop?: InputMaybe<Launchpad_Treasury_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Launchpad_Treasury_Var_Samp_Order_By>;
  variance?: InputMaybe<Launchpad_Treasury_Variance_Order_By>;
};

/** order by avg() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "launchpad_treasury". All fields are combined with a logical 'AND'. */
export type Launchpad_Treasury_Bool_Exp = {
  _and?: InputMaybe<Array<Launchpad_Treasury_Bool_Exp>>;
  _not?: InputMaybe<Launchpad_Treasury_Bool_Exp>;
  _or?: InputMaybe<Array<Launchpad_Treasury_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  launchpad?: InputMaybe<Launchpad_Bool_Exp>;
  launchpad_id?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Max_Order_By = {
  /** Destination address */
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Treasury name (key in treasuryLedger) */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Min_Order_By = {
  /** Destination address */
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  /** Treasury name (key in treasuryLedger) */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "launchpad_treasury". */
export type Launchpad_Treasury_Order_By = {
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  launchpad?: InputMaybe<Launchpad_Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "launchpad_treasury" */
export enum Launchpad_Treasury_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  LaunchpadId = 'launchpad_id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "launchpad_treasury" */
export type Launchpad_Treasury_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Launchpad_Treasury_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Launchpad_Treasury_Stream_Cursor_Value_Input = {
  /** Destination address */
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  launchpad_id?: InputMaybe<Scalars['Int']['input']>;
  /** Treasury name (key in treasuryLedger) */
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad_treasury" */
export type Launchpad_Treasury_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  launchpad_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "launchpad" */
export type Launchpad_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "launchpad" */
export type Launchpad_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "launchpad" */
export type Launchpad_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  membership_kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "market_addresses_view". All fields are combined with a logical 'AND'. */
export type Market_Addresses_View_Bool_Exp = {
  _and?: InputMaybe<Array<Market_Addresses_View_Bool_Exp>>;
  _not?: InputMaybe<Market_Addresses_View_Bool_Exp>;
  _or?: InputMaybe<Array<Market_Addresses_View_Bool_Exp>>;
  base_lp_token_address?: InputMaybe<String_Comparison_Exp>;
  base_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  base_lp_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  base_token_address?: InputMaybe<String_Comparison_Exp>;
  base_token_id?: InputMaybe<Int_Comparison_Exp>;
  base_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  dodo_mav_address?: InputMaybe<String_Comparison_Exp>;
  dodo_mav_id?: InputMaybe<Int_Comparison_Exp>;
  orderbook_address?: InputMaybe<String_Comparison_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  quote_lp_token_address?: InputMaybe<String_Comparison_Exp>;
  quote_lp_token_id?: InputMaybe<Int_Comparison_Exp>;
  quote_lp_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  quote_token_address?: InputMaybe<String_Comparison_Exp>;
  quote_token_id?: InputMaybe<Int_Comparison_Exp>;
  quote_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  rwa_token_address?: InputMaybe<String_Comparison_Exp>;
  rwa_token_id?: InputMaybe<Int_Comparison_Exp>;
  rwa_token_token_id?: InputMaybe<Smallint_Comparison_Exp>;
};

/** Ordering options when selecting data from "market_addresses_view". */
export type Market_Addresses_View_Order_By = {
  base_lp_token_address?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_lp_token_token_id?: InputMaybe<Order_By>;
  base_token_address?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  base_token_token_id?: InputMaybe<Order_By>;
  dodo_mav_address?: InputMaybe<Order_By>;
  dodo_mav_id?: InputMaybe<Order_By>;
  orderbook_address?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  quote_lp_token_address?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_lp_token_token_id?: InputMaybe<Order_By>;
  quote_token_address?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  quote_token_token_id?: InputMaybe<Order_By>;
  rwa_token_address?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  rwa_token_token_id?: InputMaybe<Order_By>;
};

/** select columns of table "market_addresses_view" */
export enum Market_Addresses_View_Select_Column {
  /** column name */
  BaseLpTokenAddress = 'base_lp_token_address',
  /** column name */
  BaseLpTokenId = 'base_lp_token_id',
  /** column name */
  BaseLpTokenTokenId = 'base_lp_token_token_id',
  /** column name */
  BaseTokenAddress = 'base_token_address',
  /** column name */
  BaseTokenId = 'base_token_id',
  /** column name */
  BaseTokenTokenId = 'base_token_token_id',
  /** column name */
  DodoMavAddress = 'dodo_mav_address',
  /** column name */
  DodoMavId = 'dodo_mav_id',
  /** column name */
  OrderbookAddress = 'orderbook_address',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  QuoteLpTokenAddress = 'quote_lp_token_address',
  /** column name */
  QuoteLpTokenId = 'quote_lp_token_id',
  /** column name */
  QuoteLpTokenTokenId = 'quote_lp_token_token_id',
  /** column name */
  QuoteTokenAddress = 'quote_token_address',
  /** column name */
  QuoteTokenId = 'quote_token_id',
  /** column name */
  QuoteTokenTokenId = 'quote_token_token_id',
  /** column name */
  RwaTokenAddress = 'rwa_token_address',
  /** column name */
  RwaTokenId = 'rwa_token_id',
  /** column name */
  RwaTokenTokenId = 'rwa_token_token_id'
}

/** Streaming cursor of the table "market_addresses_view" */
export type Market_Addresses_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Market_Addresses_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Market_Addresses_View_Stream_Cursor_Value_Input = {
  base_lp_token_address?: InputMaybe<Scalars['String']['input']>;
  base_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_lp_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  base_token_address?: InputMaybe<Scalars['String']['input']>;
  base_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  dodo_mav_address?: InputMaybe<Scalars['String']['input']>;
  dodo_mav_id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_address?: InputMaybe<Scalars['String']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  quote_lp_token_address?: InputMaybe<Scalars['String']['input']>;
  quote_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_lp_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  quote_token_address?: InputMaybe<Scalars['String']['input']>;
  quote_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
  rwa_token_address?: InputMaybe<Scalars['String']['input']>;
  rwa_token_id?: InputMaybe<Scalars['Int']['input']>;
  rwa_token_token_id?: InputMaybe<Scalars['smallint']['input']>;
};

/** Boolean expression to filter rows from the table "marketplace". All fields are combined with a logical 'AND'. */
export type Marketplace_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Bool_Exp>>;
  accept_offer_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  address?: InputMaybe<String_Comparison_Exp>;
  admins?: InputMaybe<String_Array_Comparison_Exp>;
  create_listing_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  currencies?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  currencies_aggregate?: InputMaybe<Marketplace_Currency_Aggregate_Bool_Exp>;
  edit_listing_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  general_contracts?: InputMaybe<Marketplace_General_Contract_Bool_Exp>;
  general_contracts_aggregate?: InputMaybe<Marketplace_General_Contract_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambdas?: InputMaybe<Marketplace_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Marketplace_Lambda_Aggregate_Bool_Exp>;
  listings?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp>;
  marketplace_fee?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  min_offer_amount?: InputMaybe<Bigint_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  next_listing_id?: InputMaybe<Bigint_Comparison_Exp>;
  next_offer_id?: InputMaybe<Bigint_Comparison_Exp>;
  offer_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  offers?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp>;
  purchase_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  remove_listing_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  remove_offer_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  royalty?: InputMaybe<Bigint_Comparison_Exp>;
  set_currency_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  standard_unit?: InputMaybe<Bigint_Comparison_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
  whitelist_contracts?: InputMaybe<Marketplace_Whitelist_Contract_Bool_Exp>;
  whitelist_contracts_aggregate?: InputMaybe<Marketplace_Whitelist_Contract_Aggregate_Bool_Exp>;
};

export type Marketplace_Currency_Aggregate_Bool_Exp = {
  count?: InputMaybe<Marketplace_Currency_Aggregate_Bool_Exp_Count>;
};

export type Marketplace_Currency_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_Currency_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_currency" */
export type Marketplace_Currency_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_Currency_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_Currency_Max_Order_By>;
  min?: InputMaybe<Marketplace_Currency_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_Currency_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_Currency_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_Currency_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_Currency_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_Currency_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_Currency_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_Currency_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_currency". All fields are combined with a logical 'AND'. */
export type Marketplace_Currency_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Currency_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Currency_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  listings?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp>;
  marketplace?: InputMaybe<Marketplace_Bool_Exp>;
  marketplace_id?: InputMaybe<Int_Comparison_Exp>;
  offers?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Max_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Min_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_currency". */
export type Marketplace_Currency_Order_By = {
  id?: InputMaybe<Order_By>;
  listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Order_By>;
  marketplace?: InputMaybe<Marketplace_Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_currency" */
export enum Marketplace_Currency_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  MarketplaceId = 'marketplace_id',
  /** column name */
  TokenId = 'token_id'
}

/** order by stddev() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_currency" */
export type Marketplace_Currency_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Currency_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Currency_Stream_Cursor_Value_Input = {
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

export type Marketplace_General_Contract_Aggregate_Bool_Exp = {
  count?: InputMaybe<Marketplace_General_Contract_Aggregate_Bool_Exp_Count>;
};

export type Marketplace_General_Contract_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_General_Contract_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_General_Contract_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_General_Contract_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_General_Contract_Max_Order_By>;
  min?: InputMaybe<Marketplace_General_Contract_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_General_Contract_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_General_Contract_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_General_Contract_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_General_Contract_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_General_Contract_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_General_Contract_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_General_Contract_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_general_contract". All fields are combined with a logical 'AND'. */
export type Marketplace_General_Contract_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_General_Contract_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_General_Contract_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_General_Contract_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  marketplace?: InputMaybe<Marketplace_Bool_Exp>;
  marketplace_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Max_Order_By = {
  /** Address of the general contract */
  address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Min_Order_By = {
  /** Address of the general contract */
  address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_general_contract". */
export type Marketplace_General_Contract_Order_By = {
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  marketplace?: InputMaybe<Marketplace_Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_general_contract" */
export enum Marketplace_General_Contract_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  MarketplaceId = 'marketplace_id'
}

/** order by stddev() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_General_Contract_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_General_Contract_Stream_Cursor_Value_Input = {
  /** Address of the general contract */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

export type Marketplace_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Marketplace_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Marketplace_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_lambda" */
export type Marketplace_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_Lambda_Max_Order_By>;
  min?: InputMaybe<Marketplace_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_lambda". All fields are combined with a logical 'AND'. */
export type Marketplace_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Marketplace_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_lambda". */
export type Marketplace_Lambda_Order_By = {
  contract?: InputMaybe<Marketplace_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_lambda" */
export enum Marketplace_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_lambda" */
export type Marketplace_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_lambda" */
export type Marketplace_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Marketplace_Listing_Aggregate_Bool_Exp = {
  avg?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Avg>;
  corr?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Corr>;
  count?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Count>;
  covar_samp?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp>;
  max?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Max>;
  min?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Min>;
  stddev_samp?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Stddev_Samp>;
  sum?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Sum>;
  var_samp?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp_Var_Samp>;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Avg = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Avg_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Corr = {
  arguments: Marketplace_Listing_Aggregate_Bool_Exp_Corr_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Corr_Arguments = {
  X: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Corr_Arguments_Columns;
  Y: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Corr_Arguments_Columns;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_Listing_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp = {
  arguments: Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp_Arguments = {
  X: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
  Y: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Max = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Max_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Min = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Min_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Stddev_Samp = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Sum = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Sum_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Listing_Aggregate_Bool_Exp_Var_Samp = {
  arguments: Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_listing" */
export type Marketplace_Listing_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_Listing_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_Listing_Max_Order_By>;
  min?: InputMaybe<Marketplace_Listing_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_Listing_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_Listing_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_Listing_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_Listing_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_Listing_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_Listing_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_Listing_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Avg_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_listing". All fields are combined with a logical 'AND'. */
export type Marketplace_Listing_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Listing_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Listing_Bool_Exp>>;
  amount?: InputMaybe<Float8_Comparison_Exp>;
  currency?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  currency_id?: InputMaybe<Int_Comparison_Exp>;
  expiry_time?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<Equiteez_User_Bool_Exp>;
  initiator_id?: InputMaybe<Int_Comparison_Exp>;
  listing_id?: InputMaybe<Bigint_Comparison_Exp>;
  marketplace?: InputMaybe<Marketplace_Bool_Exp>;
  marketplace_id?: InputMaybe<Int_Comparison_Exp>;
  offers?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp>;
  price_per_unit?: InputMaybe<Bigint_Comparison_Exp>;
  quick_buy_price?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<Smallint_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Max_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Listing expiry timestamp */
  expiry_time?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Min_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Listing expiry timestamp */
  expiry_time?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_listing". */
export type Marketplace_Listing_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency?: InputMaybe<Marketplace_Currency_Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Equiteez_User_Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace?: InputMaybe<Marketplace_Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  CurrencyId = 'currency_id',
  /** column name */
  ExpiryTime = 'expiry_time',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorId = 'initiator_id',
  /** column name */
  ListingId = 'listing_id',
  /** column name */
  MarketplaceId = 'marketplace_id',
  /** column name */
  PricePerUnit = 'price_per_unit',
  /** column name */
  QuickBuyPrice = 'quick_buy_price',
  /** column name */
  Status = 'status',
  /** column name */
  TokenId = 'token_id'
}

/** select "marketplace_listing_aggregate_bool_exp_avg_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Avg_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_corr_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Corr_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_max_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Max_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_min_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Min_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_sum_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Sum_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_listing_aggregate_bool_exp_var_samp_arguments_columns" columns of table "marketplace_listing" */
export enum Marketplace_Listing_Select_Column_Marketplace_Listing_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** order by stddev() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Stddev_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Stddev_Pop_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Stddev_Samp_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_listing" */
export type Marketplace_Listing_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Listing_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Listing_Stream_Cursor_Value_Input = {
  /** Token amount listed */
  amount?: InputMaybe<Scalars['float8']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  /** Listing expiry timestamp */
  expiry_time?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Scalars['bigint']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Scalars['bigint']['input']>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Scalars['bigint']['input']>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Scalars['smallint']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Sum_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Var_Pop_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Var_Samp_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Variance_Order_By = {
  /** Token amount listed */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique listing identifier */
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Price per token unit */
  price_per_unit?: InputMaybe<Order_By>;
  /** Quick buy price (if available) */
  quick_buy_price?: InputMaybe<Order_By>;
  /** Listing status (CLOSED/ACTIVE) */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

export type Marketplace_Offer_Aggregate_Bool_Exp = {
  avg?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Avg>;
  corr?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Corr>;
  count?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Count>;
  covar_samp?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp>;
  max?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Max>;
  min?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Min>;
  stddev_samp?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Stddev_Samp>;
  sum?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Sum>;
  var_samp?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp_Var_Samp>;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Avg = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Avg_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Corr = {
  arguments: Marketplace_Offer_Aggregate_Bool_Exp_Corr_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Corr_Arguments = {
  X: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Corr_Arguments_Columns;
  Y: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Corr_Arguments_Columns;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_Offer_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp = {
  arguments: Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp_Arguments;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp_Arguments = {
  X: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
  Y: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Max = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Max_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Min = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Min_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Stddev_Samp = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Sum = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Sum_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

export type Marketplace_Offer_Aggregate_Bool_Exp_Var_Samp = {
  arguments: Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  predicate: Float8_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_offer" */
export type Marketplace_Offer_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_Offer_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_Offer_Max_Order_By>;
  min?: InputMaybe<Marketplace_Offer_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_Offer_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_Offer_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_Offer_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_Offer_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_Offer_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_Offer_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_Offer_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Avg_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_offer". All fields are combined with a logical 'AND'. */
export type Marketplace_Offer_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Offer_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Offer_Bool_Exp>>;
  amount?: InputMaybe<Float8_Comparison_Exp>;
  currency?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  currency_id?: InputMaybe<Int_Comparison_Exp>;
  expiry_time?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<Equiteez_User_Bool_Exp>;
  initiator_id?: InputMaybe<Int_Comparison_Exp>;
  listing?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  listing_id?: InputMaybe<Int_Comparison_Exp>;
  marketplace?: InputMaybe<Marketplace_Bool_Exp>;
  marketplace_id?: InputMaybe<Int_Comparison_Exp>;
  offer_id?: InputMaybe<Bigint_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<Smallint_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Max_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Offer expiry timestamp */
  expiry_time?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Min_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Offer expiry timestamp */
  expiry_time?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_offer". */
export type Marketplace_Offer_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency?: InputMaybe<Marketplace_Currency_Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Equiteez_User_Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing?: InputMaybe<Marketplace_Listing_Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace?: InputMaybe<Marketplace_Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  CurrencyId = 'currency_id',
  /** column name */
  ExpiryTime = 'expiry_time',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorId = 'initiator_id',
  /** column name */
  ListingId = 'listing_id',
  /** column name */
  MarketplaceId = 'marketplace_id',
  /** column name */
  OfferId = 'offer_id',
  /** column name */
  Price = 'price',
  /** column name */
  Status = 'status'
}

/** select "marketplace_offer_aggregate_bool_exp_avg_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Avg_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_corr_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Corr_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_covar_samp_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Covar_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_max_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Max_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_min_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Min_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_stddev_samp_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Stddev_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_sum_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Sum_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** select "marketplace_offer_aggregate_bool_exp_var_samp_arguments_columns" columns of table "marketplace_offer" */
export enum Marketplace_Offer_Select_Column_Marketplace_Offer_Aggregate_Bool_Exp_Var_Samp_Arguments_Columns {
  /** column name */
  Amount = 'amount'
}

/** order by stddev() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Stddev_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Stddev_Pop_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Stddev_Samp_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_offer" */
export type Marketplace_Offer_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Offer_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Offer_Stream_Cursor_Value_Input = {
  /** Token amount offered */
  amount?: InputMaybe<Scalars['float8']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  /** Offer expiry timestamp */
  expiry_time?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  listing_id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Offer price */
  price?: InputMaybe<Scalars['bigint']['input']>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Scalars['smallint']['input']>;
};

/** order by sum() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Sum_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Var_Pop_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Var_Samp_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Variance_Order_By = {
  /** Token amount offered */
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  /** Unique offer identifier */
  offer_id?: InputMaybe<Order_By>;
  /** Offer price */
  price?: InputMaybe<Order_By>;
  /** Offer status (CLOSED/OPEN/ACCEPTED) */
  status?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace". */
export type Marketplace_Order_By = {
  accept_offer_is_paused?: InputMaybe<Order_By>;
  address?: InputMaybe<Order_By>;
  admins?: InputMaybe<Order_By>;
  create_listing_is_paused?: InputMaybe<Order_By>;
  currencies_aggregate?: InputMaybe<Marketplace_Currency_Aggregate_Order_By>;
  edit_listing_is_paused?: InputMaybe<Order_By>;
  general_contracts_aggregate?: InputMaybe<Marketplace_General_Contract_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Marketplace_Lambda_Aggregate_Order_By>;
  listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Order_By>;
  marketplace_fee?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  min_offer_amount?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  next_listing_id?: InputMaybe<Order_By>;
  next_offer_id?: InputMaybe<Order_By>;
  offer_is_paused?: InputMaybe<Order_By>;
  offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Order_By>;
  purchase_is_paused?: InputMaybe<Order_By>;
  remove_listing_is_paused?: InputMaybe<Order_By>;
  remove_offer_is_paused?: InputMaybe<Order_By>;
  royalty?: InputMaybe<Order_By>;
  set_currency_is_paused?: InputMaybe<Order_By>;
  standard_unit?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  whitelist_contracts_aggregate?: InputMaybe<Marketplace_Whitelist_Contract_Aggregate_Order_By>;
};

/** select columns of table "marketplace" */
export enum Marketplace_Select_Column {
  /** column name */
  AcceptOfferIsPaused = 'accept_offer_is_paused',
  /** column name */
  Address = 'address',
  /** column name */
  Admins = 'admins',
  /** column name */
  CreateListingIsPaused = 'create_listing_is_paused',
  /** column name */
  EditListingIsPaused = 'edit_listing_is_paused',
  /** column name */
  Id = 'id',
  /** column name */
  MarketplaceFee = 'marketplace_fee',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  MinOfferAmount = 'min_offer_amount',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  NextListingId = 'next_listing_id',
  /** column name */
  NextOfferId = 'next_offer_id',
  /** column name */
  OfferIsPaused = 'offer_is_paused',
  /** column name */
  PurchaseIsPaused = 'purchase_is_paused',
  /** column name */
  RemoveListingIsPaused = 'remove_listing_is_paused',
  /** column name */
  RemoveOfferIsPaused = 'remove_offer_is_paused',
  /** column name */
  Royalty = 'royalty',
  /** column name */
  SetCurrencyIsPaused = 'set_currency_is_paused',
  /** column name */
  StandardUnit = 'standard_unit',
  /** column name */
  SuperAdmin = 'super_admin'
}

/** Streaming cursor of the table "marketplace" */
export type Marketplace_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Stream_Cursor_Value_Input = {
  /** Whether offer acceptance is paused */
  accept_offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Marketplace contract address */
  address?: InputMaybe<Scalars['String']['input']>;
  /** List of admin addresses */
  admins?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether create_listing is paused */
  create_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether edit_listing is paused */
  edit_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Marketplace fee percentage */
  marketplace_fee?: InputMaybe<Scalars['bigint']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Minimum offer amount */
  min_offer_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Next available listing ID */
  next_listing_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Next available offer ID */
  next_offer_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Whether offer creation is paused */
  offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether purchase is paused */
  purchase_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether remove_listing is paused */
  remove_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether offer removal is paused */
  remove_offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Royalty percentage */
  royalty?: InputMaybe<Scalars['bigint']['input']>;
  /** Whether currency setting is paused */
  set_currency_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  /** Standard unit for pricing */
  standard_unit?: InputMaybe<Scalars['bigint']['input']>;
  /** Current super admin address */
  super_admin?: InputMaybe<Scalars['String']['input']>;
};

export type Marketplace_Whitelist_Contract_Aggregate_Bool_Exp = {
  count?: InputMaybe<Marketplace_Whitelist_Contract_Aggregate_Bool_Exp_Count>;
};

export type Marketplace_Whitelist_Contract_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Marketplace_Whitelist_Contract_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Marketplace_Whitelist_Contract_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Aggregate_Order_By = {
  avg?: InputMaybe<Marketplace_Whitelist_Contract_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Marketplace_Whitelist_Contract_Max_Order_By>;
  min?: InputMaybe<Marketplace_Whitelist_Contract_Min_Order_By>;
  stddev?: InputMaybe<Marketplace_Whitelist_Contract_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Marketplace_Whitelist_Contract_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Marketplace_Whitelist_Contract_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Marketplace_Whitelist_Contract_Sum_Order_By>;
  var_pop?: InputMaybe<Marketplace_Whitelist_Contract_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Marketplace_Whitelist_Contract_Var_Samp_Order_By>;
  variance?: InputMaybe<Marketplace_Whitelist_Contract_Variance_Order_By>;
};

/** order by avg() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace_whitelist_contract". All fields are combined with a logical 'AND'. */
export type Marketplace_Whitelist_Contract_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Whitelist_Contract_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Whitelist_Contract_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Whitelist_Contract_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  marketplace?: InputMaybe<Marketplace_Bool_Exp>;
  marketplace_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Max_Order_By = {
  /** Address of the whitelisted contract */
  address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Min_Order_By = {
  /** Address of the whitelisted contract */
  address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "marketplace_whitelist_contract". */
export type Marketplace_Whitelist_Contract_Order_By = {
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  marketplace?: InputMaybe<Marketplace_Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** select columns of table "marketplace_whitelist_contract" */
export enum Marketplace_Whitelist_Contract_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  MarketplaceId = 'marketplace_id'
}

/** order by stddev() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Marketplace_Whitelist_Contract_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Marketplace_Whitelist_Contract_Stream_Cursor_Value_Input = {
  /** Address of the whitelisted contract */
  address?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Orderbook_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Orderbook_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Orderbook_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Orderbook_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Aggregate_Bool_Exp_Bool_And = {
  arguments: Orderbook_Select_Column_Orderbook_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Orderbook_Select_Column_Orderbook_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook" */
export type Orderbook_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Max_Order_By>;
  min?: InputMaybe<Orderbook_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook" */
export type Orderbook_Avg_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook". All fields are combined with a logical 'AND'. */
export type Orderbook_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  buy_order_counter?: InputMaybe<Bigint_Comparison_Exp>;
  buy_order_fee?: InputMaybe<Bigint_Comparison_Exp>;
  currencies?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  currencies_aggregate?: InputMaybe<Orderbook_Currency_Aggregate_Bool_Exp>;
  dodo_mavs?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mavs_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp>;
  entrypoint_status?: InputMaybe<Orderbook_Entrypoint_Status_Bool_Exp>;
  entrypoint_status_aggregate?: InputMaybe<Orderbook_Entrypoint_Status_Aggregate_Bool_Exp>;
  fees?: InputMaybe<Orderbook_Fee_Bool_Exp>;
  fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Bool_Exp>;
  highest_buy_price?: InputMaybe<Bigint_Comparison_Exp>;
  highest_buy_price_market_order_exists?: InputMaybe<Boolean_Comparison_Exp>;
  highest_buy_price_order_id?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  lambdas?: InputMaybe<Orderbook_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Orderbook_Lambda_Aggregate_Bool_Exp>;
  last_matched_price?: InputMaybe<Bigint_Comparison_Exp>;
  last_matched_price_timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  lowest_sell_price?: InputMaybe<Bigint_Comparison_Exp>;
  lowest_sell_price_market_order_exists?: InputMaybe<Boolean_Comparison_Exp>;
  lowest_sell_price_order_id?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  min_buy_order_amount?: InputMaybe<Bigint_Comparison_Exp>;
  min_buy_order_value?: InputMaybe<Bigint_Comparison_Exp>;
  min_expiry_time?: InputMaybe<Bigint_Comparison_Exp>;
  min_sell_order_amount?: InputMaybe<Bigint_Comparison_Exp>;
  min_sell_order_value?: InputMaybe<Bigint_Comparison_Exp>;
  min_time_before_closing_order?: InputMaybe<Bigint_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  order_events?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Bool_Exp>;
  orders?: InputMaybe<Orderbook_Order_Bool_Exp>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp>;
  rwa_orders?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Bool_Exp>;
  rwa_token?: InputMaybe<Token_Bool_Exp>;
  rwa_token_id?: InputMaybe<Int_Comparison_Exp>;
  sell_order_counter?: InputMaybe<Bigint_Comparison_Exp>;
  sell_order_fee?: InputMaybe<Bigint_Comparison_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
  tick_size?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

export type Orderbook_Currency_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Currency_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Currency_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Currency_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_currency" */
export type Orderbook_Currency_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Currency_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Currency_Max_Order_By>;
  min?: InputMaybe<Orderbook_Currency_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Currency_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Currency_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Currency_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Currency_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Currency_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Currency_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Currency_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_currency". All fields are combined with a logical 'AND'. */
export type Orderbook_Currency_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Currency_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Currency_Bool_Exp>>;
  currency_name?: InputMaybe<String_Comparison_Exp>;
  fees?: InputMaybe<Orderbook_Fee_Bool_Exp>;
  fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  order_events?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Bool_Exp>;
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  orders?: InputMaybe<Orderbook_Order_Bool_Exp>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Max_Order_By = {
  /** Name of the currency */
  currency_name?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Min_Order_By = {
  /** Name of the currency */
  currency_name?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_currency". */
export type Orderbook_Currency_Order_By = {
  currency_name?: InputMaybe<Order_By>;
  fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_currency" */
export enum Orderbook_Currency_Select_Column {
  /** column name */
  CurrencyName = 'currency_name',
  /** column name */
  Id = 'id',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_currency" */
export type Orderbook_Currency_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Currency_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Currency_Stream_Cursor_Value_Input = {
  /** Name of the currency */
  currency_name?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_depth_level_view". All fields are combined with a logical 'AND'. */
export type Orderbook_Depth_Level_View_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Depth_Level_View_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Depth_Level_View_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Depth_Level_View_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  order_type?: InputMaybe<Smallint_Comparison_Exp>;
  orderbook_address?: InputMaybe<String_Comparison_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  orders_count?: InputMaybe<Bigint_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "orderbook_depth_level_view". */
export type Orderbook_Depth_Level_View_Order_By = {
  amount?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  order_type?: InputMaybe<Order_By>;
  orderbook_address?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  orders_count?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_depth_level_view" */
export enum Orderbook_Depth_Level_View_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  OrderType = 'order_type',
  /** column name */
  OrderbookAddress = 'orderbook_address',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  OrdersCount = 'orders_count',
  /** column name */
  Price = 'price'
}

/** Streaming cursor of the table "orderbook_depth_level_view" */
export type Orderbook_Depth_Level_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Depth_Level_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Depth_Level_View_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  order_type?: InputMaybe<Scalars['smallint']['input']>;
  orderbook_address?: InputMaybe<Scalars['String']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  orders_count?: InputMaybe<Scalars['bigint']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
};

export type Orderbook_Entrypoint_Status_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And = {
  arguments: Orderbook_Entrypoint_Status_Select_Column_Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Orderbook_Entrypoint_Status_Select_Column_Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Entrypoint_Status_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Entrypoint_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Entrypoint_Status_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Entrypoint_Status_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Entrypoint_Status_Max_Order_By>;
  min?: InputMaybe<Orderbook_Entrypoint_Status_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Entrypoint_Status_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Entrypoint_Status_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Entrypoint_Status_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Entrypoint_Status_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Entrypoint_Status_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Entrypoint_Status_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Entrypoint_Status_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_entrypoint_status". All fields are combined with a logical 'AND'. */
export type Orderbook_Entrypoint_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Entrypoint_Status_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Entrypoint_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Entrypoint_Status_Bool_Exp>>;
  contract?: InputMaybe<Orderbook_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  entrypoint?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  paused?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_entrypoint_status". */
export type Orderbook_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Orderbook_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_entrypoint_status" */
export enum Orderbook_Entrypoint_Status_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Entrypoint = 'entrypoint',
  /** column name */
  Id = 'id',
  /** column name */
  Paused = 'paused',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "orderbook_entrypoint_status_aggregate_bool_exp_bool_and_arguments_columns" columns of table "orderbook_entrypoint_status" */
export enum Orderbook_Entrypoint_Status_Select_Column_Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** select "orderbook_entrypoint_status_aggregate_bool_exp_bool_or_arguments_columns" columns of table "orderbook_entrypoint_status" */
export enum Orderbook_Entrypoint_Status_Select_Column_Orderbook_Entrypoint_Status_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Paused = 'paused'
}

/** order by stddev() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Entrypoint_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Entrypoint_Status_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  entrypoint?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  paused?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

export type Orderbook_Fee_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Fee_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Fee_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Fee_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Fee_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_fee" */
export type Orderbook_Fee_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Fee_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Fee_Max_Order_By>;
  min?: InputMaybe<Orderbook_Fee_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Fee_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Fee_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Fee_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Fee_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Fee_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Fee_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Fee_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Avg_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_fee". All fields are combined with a logical 'AND'. */
export type Orderbook_Fee_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Fee_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Fee_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Fee_Bool_Exp>>;
  currency?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  currency_id?: InputMaybe<Int_Comparison_Exp>;
  fee_amount?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  paid_fee?: InputMaybe<Bigint_Comparison_Exp>;
  related_token?: InputMaybe<Token_Bool_Exp>;
  related_token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Max_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Min_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_fee". */
export type Orderbook_Fee_Order_By = {
  currency?: InputMaybe<Orderbook_Currency_Order_By>;
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token?: InputMaybe<Token_Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_fee" */
export enum Orderbook_Fee_Select_Column {
  /** column name */
  CurrencyId = 'currency_id',
  /** column name */
  FeeAmount = 'fee_amount',
  /** column name */
  Id = 'id',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  PaidFee = 'paid_fee',
  /** column name */
  RelatedTokenId = 'related_token_id'
}

/** order by stddev() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Stddev_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Stddev_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Stddev_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_fee" */
export type Orderbook_Fee_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Fee_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Fee_Stream_Cursor_Value_Input = {
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  /** Fee amount */
  fee_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Scalars['bigint']['input']>;
  related_token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Sum_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Var_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Var_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Variance_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Fee amount */
  fee_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Amount of fee that has been paid */
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

export type Orderbook_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_lambda" */
export type Orderbook_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Lambda_Max_Order_By>;
  min?: InputMaybe<Orderbook_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_lambda". All fields are combined with a logical 'AND'. */
export type Orderbook_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Orderbook_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_lambda". */
export type Orderbook_Lambda_Order_By = {
  contract?: InputMaybe<Orderbook_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_lambda" */
export enum Orderbook_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_lambda" */
export type Orderbook_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_lambda" */
export type Orderbook_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "orderbook" */
export type Orderbook_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Timestamp of last matched price */
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook" */
export type Orderbook_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Timestamp of last matched price */
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Current super admin address */
  super_admin?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

export type Orderbook_Order_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Order_Aggregate_Bool_Exp_Bool_And = {
  arguments: Orderbook_Order_Select_Column_Orderbook_Order_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Order_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Order_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Orderbook_Order_Select_Column_Orderbook_Order_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Order_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Orderbook_Order_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Order_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Order_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_order" */
export type Orderbook_Order_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Order_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Order_Max_Order_By>;
  min?: InputMaybe<Orderbook_Order_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Order_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Order_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Order_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Order_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Order_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Order_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Order_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_order" */
export type Orderbook_Order_Avg_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_order". All fields are combined with a logical 'AND'. */
export type Orderbook_Order_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Order_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Order_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Order_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  currency_id?: InputMaybe<Int_Comparison_Exp>;
  ended_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  events?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Bool_Exp>;
  fulfilled_amount?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<Equiteez_User_Bool_Exp>;
  initiator_id?: InputMaybe<Int_Comparison_Exp>;
  is_canceled?: InputMaybe<Boolean_Comparison_Exp>;
  is_expired?: InputMaybe<Boolean_Comparison_Exp>;
  is_fulfilled?: InputMaybe<Boolean_Comparison_Exp>;
  is_market_order?: InputMaybe<Boolean_Comparison_Exp>;
  is_refunded?: InputMaybe<Boolean_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  order_expiry?: InputMaybe<Timestamptz_Comparison_Exp>;
  order_id?: InputMaybe<Bigint_Comparison_Exp>;
  order_type?: InputMaybe<Smallint_Comparison_Exp>;
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  price_per_rwa_token?: InputMaybe<Bigint_Comparison_Exp>;
  refunded_amount?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_token_amount?: InputMaybe<Bigint_Comparison_Exp>;
  total_paid_out?: InputMaybe<Bigint_Comparison_Exp>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Bigint_Comparison_Exp>;
  unfulfilled_amount?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Ordering options when selecting data from "orderbook". */
export type Orderbook_Order_By = {
  address?: InputMaybe<Order_By>;
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  currencies_aggregate?: InputMaybe<Orderbook_Currency_Aggregate_Order_By>;
  dodo_mavs_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  entrypoint_status_aggregate?: InputMaybe<Orderbook_Entrypoint_Status_Aggregate_Order_By>;
  fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_market_order_exists?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Orderbook_Lambda_Aggregate_Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_market_order_exists?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  order_events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Order_By>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Order_By>;
  rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Order_By>;
  rwa_token?: InputMaybe<Token_Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  tick_size?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

export type Orderbook_Order_Event_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Order_Event_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Order_Event_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Order_Event_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_order_event" */
export type Orderbook_Order_Event_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Order_Event_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Order_Event_Max_Order_By>;
  min?: InputMaybe<Orderbook_Order_Event_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Order_Event_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Order_Event_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Order_Event_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Order_Event_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Order_Event_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Order_Event_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Order_Event_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Avg_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_order_event". All fields are combined with a logical 'AND'. */
export type Orderbook_Order_Event_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Order_Event_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Order_Event_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Order_Event_Bool_Exp>>;
  batch_index?: InputMaybe<Int_Comparison_Exp>;
  counter?: InputMaybe<Bigint_Comparison_Exp>;
  currency?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  currency_delta?: InputMaybe<Bigint_Comparison_Exp>;
  currency_id?: InputMaybe<Int_Comparison_Exp>;
  event_seq?: InputMaybe<Int_Comparison_Exp>;
  event_type?: InputMaybe<Smallint_Comparison_Exp>;
  fulfilled_after?: InputMaybe<Bigint_Comparison_Exp>;
  fulfilled_before?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<Equiteez_User_Bool_Exp>;
  initiator_id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  order?: InputMaybe<Orderbook_Order_Bool_Exp>;
  order_id?: InputMaybe<Int_Comparison_Exp>;
  order_type?: InputMaybe<Smallint_Comparison_Exp>;
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  refunded_delta?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_delta?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  unfulfilled_after?: InputMaybe<Bigint_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Max_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Min_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_order_event". */
export type Orderbook_Order_Event_Order_By = {
  batch_index?: InputMaybe<Order_By>;
  counter?: InputMaybe<Order_By>;
  currency?: InputMaybe<Orderbook_Currency_Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  event_seq?: InputMaybe<Order_By>;
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Equiteez_User_Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  order?: InputMaybe<Orderbook_Order_Order_By>;
  order_id?: InputMaybe<Order_By>;
  order_type?: InputMaybe<Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_order_event" */
export enum Orderbook_Order_Event_Select_Column {
  /** column name */
  BatchIndex = 'batch_index',
  /** column name */
  Counter = 'counter',
  /** column name */
  CurrencyDelta = 'currency_delta',
  /** column name */
  CurrencyId = 'currency_id',
  /** column name */
  EventSeq = 'event_seq',
  /** column name */
  EventType = 'event_type',
  /** column name */
  FulfilledAfter = 'fulfilled_after',
  /** column name */
  FulfilledBefore = 'fulfilled_before',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorId = 'initiator_id',
  /** column name */
  Level = 'level',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  OrderId = 'order_id',
  /** column name */
  OrderType = 'order_type',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  RefundedDelta = 'refunded_delta',
  /** column name */
  RwaDelta = 'rwa_delta',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  UnfulfilledAfter = 'unfulfilled_after'
}

/** order by stddev() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Stddev_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Stddev_Pop_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Stddev_Samp_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_order_event" */
export type Orderbook_Order_Event_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Order_Event_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Order_Event_Stream_Cursor_Value_Input = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Scalars['Int']['input']>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Scalars['bigint']['input']>;
  currency_delta?: InputMaybe<Scalars['bigint']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Scalars['Int']['input']>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Scalars['smallint']['input']>;
  fulfilled_after?: InputMaybe<Scalars['bigint']['input']>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['bigint']['input']>;
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['Int']['input']>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Scalars['smallint']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  refunded_delta?: InputMaybe<Scalars['bigint']['input']>;
  rwa_delta?: InputMaybe<Scalars['bigint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  unfulfilled_after?: InputMaybe<Scalars['bigint']['input']>;
};

/** order by sum() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Sum_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Var_Pop_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Var_Samp_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_order_event" */
export type Orderbook_Order_Event_Variance_Order_By = {
  /** Internal-operation nonce, -1 for a top-level transaction */
  batch_index?: InputMaybe<Order_By>;
  /** Sender counter of the transaction within the operation group */
  counter?: InputMaybe<Order_By>;
  currency_delta?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Position of this event among those the same transaction produced for the same order: 0 for the operation's own event, 1 for a terminal transition riding along with it */
  event_seq?: InputMaybe<Order_By>;
  /** PLACE: 0\nFILL: 1\nCANCEL: 2\nEXPIRE: 3\nREFUND: 4\nSEED: 5 */
  event_type?: InputMaybe<Order_By>;
  fulfilled_after?: InputMaybe<Order_By>;
  /** Fill trajectory (RWA token amounts) */
  fulfilled_before?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  refunded_delta?: InputMaybe<Order_By>;
  rwa_delta?: InputMaybe<Order_By>;
  unfulfilled_after?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "orderbook_order" */
export type Orderbook_Order_Max_Order_By = {
  /** Order creation timestamp */
  created_at?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Order completion timestamp */
  ended_at?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Mavryk operation hash of the tx that placed the order — or, for an order the indexer first met mid-life, of the tx that first revealed it */
  operation_hash?: InputMaybe<Order_By>;
  /** Order expiry timestamp */
  order_expiry?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_order" */
export type Orderbook_Order_Min_Order_By = {
  /** Order creation timestamp */
  created_at?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  /** Order completion timestamp */
  ended_at?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Mavryk operation hash of the tx that placed the order — or, for an order the indexer first met mid-life, of the tx that first revealed it */
  operation_hash?: InputMaybe<Order_By>;
  /** Order expiry timestamp */
  order_expiry?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_order". */
export type Orderbook_Order_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Orderbook_Currency_Order_By>;
  currency_id?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  events_aggregate?: InputMaybe<Orderbook_Order_Event_Aggregate_Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Equiteez_User_Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  is_canceled?: InputMaybe<Order_By>;
  is_expired?: InputMaybe<Order_By>;
  is_fulfilled?: InputMaybe<Order_By>;
  is_market_order?: InputMaybe<Order_By>;
  is_refunded?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  order_expiry?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  order_type?: InputMaybe<Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_order" */
export enum Orderbook_Order_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrencyId = 'currency_id',
  /** column name */
  EndedAt = 'ended_at',
  /** column name */
  FulfilledAmount = 'fulfilled_amount',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorId = 'initiator_id',
  /** column name */
  IsCanceled = 'is_canceled',
  /** column name */
  IsExpired = 'is_expired',
  /** column name */
  IsFulfilled = 'is_fulfilled',
  /** column name */
  IsMarketOrder = 'is_market_order',
  /** column name */
  IsRefunded = 'is_refunded',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  OrderExpiry = 'order_expiry',
  /** column name */
  OrderId = 'order_id',
  /** column name */
  OrderType = 'order_type',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  PricePerRwaToken = 'price_per_rwa_token',
  /** column name */
  RefundedAmount = 'refunded_amount',
  /** column name */
  RwaTokenAmount = 'rwa_token_amount',
  /** column name */
  TotalPaidOut = 'total_paid_out',
  /** column name */
  TotalUsdValueOfRwaTokenAmount = 'total_usd_value_of_rwa_token_amount',
  /** column name */
  UnfulfilledAmount = 'unfulfilled_amount',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "orderbook_order_aggregate_bool_exp_bool_and_arguments_columns" columns of table "orderbook_order" */
export enum Orderbook_Order_Select_Column_Orderbook_Order_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsCanceled = 'is_canceled',
  /** column name */
  IsExpired = 'is_expired',
  /** column name */
  IsFulfilled = 'is_fulfilled',
  /** column name */
  IsMarketOrder = 'is_market_order',
  /** column name */
  IsRefunded = 'is_refunded'
}

/** select "orderbook_order_aggregate_bool_exp_bool_or_arguments_columns" columns of table "orderbook_order" */
export enum Orderbook_Order_Select_Column_Orderbook_Order_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsCanceled = 'is_canceled',
  /** column name */
  IsExpired = 'is_expired',
  /** column name */
  IsFulfilled = 'is_fulfilled',
  /** column name */
  IsMarketOrder = 'is_market_order',
  /** column name */
  IsRefunded = 'is_refunded'
}

/** order by stddev() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_order" */
export type Orderbook_Order_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Order_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Order_Stream_Cursor_Value_Input = {
  /** Order creation timestamp */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  /** Order completion timestamp */
  ended_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  /** Whether order has been canceled */
  is_canceled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether order has expired */
  is_expired?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether order is completely fulfilled */
  is_fulfilled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether order was placed as a market order */
  is_market_order?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether order has been refunded */
  is_refunded?: InputMaybe<Scalars['Boolean']['input']>;
  /** Mavryk operation hash of the tx that placed the order — or, for an order the indexer first met mid-life, of the tx that first revealed it */
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  /** Order expiry timestamp */
  order_expiry?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Unique order identifier */
  order_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Scalars['smallint']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Scalars['bigint']['input']>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Scalars['bigint']['input']>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_order" */
export type Orderbook_Order_Sum_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_order" */
export type Orderbook_Order_Var_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_order" */
export type Orderbook_Order_Var_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_order" */
export type Orderbook_Order_Variance_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  /** Amount that has been fulfilled */
  fulfilled_amount?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Unique order identifier */
  order_id?: InputMaybe<Order_By>;
  /** Type of order (BUY/SELL) */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  /** Price per RWA token */
  price_per_rwa_token?: InputMaybe<Order_By>;
  /** Amount refunded */
  refunded_amount?: InputMaybe<Order_By>;
  /** Amount of RWA tokens */
  rwa_token_amount?: InputMaybe<Order_By>;
  /** Total amount paid out */
  total_paid_out?: InputMaybe<Order_By>;
  /** USD value of RWA token amount */
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  /** Amount remaining to be fulfilled */
  unfulfilled_amount?: InputMaybe<Order_By>;
};

export type Orderbook_Rwa_Order_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Rwa_Order_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Rwa_Order_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Rwa_Order_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Rwa_Order_Max_Order_By>;
  min?: InputMaybe<Orderbook_Rwa_Order_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Rwa_Order_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Rwa_Order_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Rwa_Order_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Rwa_Order_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Rwa_Order_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Rwa_Order_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Rwa_Order_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_rwa_order". All fields are combined with a logical 'AND'. */
export type Orderbook_Rwa_Order_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Rwa_Order_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Rwa_Order_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  orderbook_rwa_order_buy_orders?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Bool_Exp>;
  orderbook_rwa_order_buy_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Aggregate_Bool_Exp>;
  orderbook_rwa_order_buy_prices?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Bool_Exp>;
  orderbook_rwa_order_buy_prices_aggregate?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Aggregate_Bool_Exp>;
  orderbook_rwa_order_sell_orders?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Bool_Exp>;
  orderbook_rwa_order_sell_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Aggregate_Bool_Exp>;
  orderbook_rwa_order_sell_prices?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Bool_Exp>;
  orderbook_rwa_order_sell_prices_aggregate?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Aggregate_Bool_Exp>;
  rwa_token?: InputMaybe<Token_Bool_Exp>;
  rwa_token_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

export type Orderbook_Rwa_Order_Buy_Order_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Rwa_Order_Buy_Order_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Order_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Max_Order_By>;
  min?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_rwa_order_buy_order". All fields are combined with a logical 'AND'. */
export type Orderbook_Rwa_Order_Buy_Order_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Order_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Order_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  order_ids?: InputMaybe<Int_Array_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_buy_order". */
export type Orderbook_Rwa_Order_Buy_Order_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_rwa_order_buy_order" */
export enum Orderbook_Rwa_Order_Buy_Order_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  OrderIds = 'order_ids',
  /** column name */
  Price = 'price',
  /** column name */
  RwaOrderId = 'rwa_order_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Rwa_Order_Buy_Order_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Rwa_Order_Buy_Order_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  order_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

export type Orderbook_Rwa_Order_Buy_Price_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Rwa_Order_Buy_Price_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Price_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Max_Order_By>;
  min?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Avg_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_rwa_order_buy_price". All fields are combined with a logical 'AND'. */
export type Orderbook_Rwa_Order_Buy_Price_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Price_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Rwa_Order_Buy_Price_Bool_Exp>>;
  counter?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Max_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Min_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_buy_price". */
export type Orderbook_Rwa_Order_Buy_Price_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_rwa_order_buy_price" */
export enum Orderbook_Rwa_Order_Buy_Price_Select_Column {
  /** column name */
  Counter = 'counter',
  /** column name */
  Id = 'id',
  /** column name */
  Price = 'price',
  /** column name */
  RwaOrderId = 'rwa_order_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Pop_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Samp_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Rwa_Order_Buy_Price_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Rwa_Order_Buy_Price_Stream_Cursor_Value_Input = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Scalars['bigint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Buy price level */
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Sum_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Var_Pop_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Var_Samp_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Variance_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Buy price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Max_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Min_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order". */
export type Orderbook_Rwa_Order_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  orderbook_rwa_order_buy_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Buy_Order_Aggregate_Order_By>;
  orderbook_rwa_order_buy_prices_aggregate?: InputMaybe<Orderbook_Rwa_Order_Buy_Price_Aggregate_Order_By>;
  orderbook_rwa_order_sell_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Aggregate_Order_By>;
  orderbook_rwa_order_sell_prices_aggregate?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Aggregate_Order_By>;
  rwa_token?: InputMaybe<Token_Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_rwa_order" */
export enum Orderbook_Rwa_Order_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  RwaTokenId = 'rwa_token_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Orderbook_Rwa_Order_Sell_Order_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Rwa_Order_Sell_Order_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Order_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Max_Order_By>;
  min?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_rwa_order_sell_order". All fields are combined with a logical 'AND'. */
export type Orderbook_Rwa_Order_Sell_Order_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Order_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Rwa_Order_Sell_Order_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Order_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  order_ids?: InputMaybe<Int_Array_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_sell_order". */
export type Orderbook_Rwa_Order_Sell_Order_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_rwa_order_sell_order" */
export enum Orderbook_Rwa_Order_Sell_Order_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  OrderIds = 'order_ids',
  /** column name */
  Price = 'price',
  /** column name */
  RwaOrderId = 'rwa_order_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Rwa_Order_Sell_Order_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Rwa_Order_Sell_Order_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  order_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

export type Orderbook_Rwa_Order_Sell_Price_Aggregate_Bool_Exp = {
  count?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Aggregate_Bool_Exp_Count>;
};

export type Orderbook_Rwa_Order_Sell_Price_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Price_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Aggregate_Order_By = {
  avg?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Max_Order_By>;
  min?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Min_Order_By>;
  stddev?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Sum_Order_By>;
  var_pop?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Var_Samp_Order_By>;
  variance?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Variance_Order_By>;
};

/** order by avg() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Avg_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_rwa_order_sell_price". All fields are combined with a logical 'AND'. */
export type Orderbook_Rwa_Order_Sell_Price_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Price_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Rwa_Order_Sell_Price_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Rwa_Order_Sell_Price_Bool_Exp>>;
  counter?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Max_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Min_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_sell_price". */
export type Orderbook_Rwa_Order_Sell_Price_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_rwa_order_sell_price" */
export enum Orderbook_Rwa_Order_Sell_Price_Select_Column {
  /** column name */
  Counter = 'counter',
  /** column name */
  Id = 'id',
  /** column name */
  Price = 'price',
  /** column name */
  RwaOrderId = 'rwa_order_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Pop_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Samp_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Rwa_Order_Sell_Price_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Rwa_Order_Sell_Price_Stream_Cursor_Value_Input = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Scalars['bigint']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Sell price level */
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Sum_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Var_Pop_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Var_Samp_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Variance_Order_By = {
  /** Number of orders at this price level */
  counter?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Sell price level */
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Rwa_Order_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Rwa_Order_Stream_Cursor_Value_Input = {
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  rwa_token_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook" */
export enum Orderbook_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  BuyOrderCounter = 'buy_order_counter',
  /** column name */
  BuyOrderFee = 'buy_order_fee',
  /** column name */
  HighestBuyPrice = 'highest_buy_price',
  /** column name */
  HighestBuyPriceMarketOrderExists = 'highest_buy_price_market_order_exists',
  /** column name */
  HighestBuyPriceOrderId = 'highest_buy_price_order_id',
  /** column name */
  Id = 'id',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  LastMatchedPrice = 'last_matched_price',
  /** column name */
  LastMatchedPriceTimestamp = 'last_matched_price_timestamp',
  /** column name */
  LowestSellPrice = 'lowest_sell_price',
  /** column name */
  LowestSellPriceMarketOrderExists = 'lowest_sell_price_market_order_exists',
  /** column name */
  LowestSellPriceOrderId = 'lowest_sell_price_order_id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  MinBuyOrderAmount = 'min_buy_order_amount',
  /** column name */
  MinBuyOrderValue = 'min_buy_order_value',
  /** column name */
  MinExpiryTime = 'min_expiry_time',
  /** column name */
  MinSellOrderAmount = 'min_sell_order_amount',
  /** column name */
  MinSellOrderValue = 'min_sell_order_value',
  /** column name */
  MinTimeBeforeClosingOrder = 'min_time_before_closing_order',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  RwaTokenId = 'rwa_token_id',
  /** column name */
  SellOrderCounter = 'sell_order_counter',
  /** column name */
  SellOrderFee = 'sell_order_fee',
  /** column name */
  SuperAdmin = 'super_admin',
  /** column name */
  TickSize = 'tick_size',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "orderbook_aggregate_bool_exp_bool_and_arguments_columns" columns of table "orderbook" */
export enum Orderbook_Select_Column_Orderbook_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  HighestBuyPriceMarketOrderExists = 'highest_buy_price_market_order_exists',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  LowestSellPriceMarketOrderExists = 'lowest_sell_price_market_order_exists'
}

/** select "orderbook_aggregate_bool_exp_bool_or_arguments_columns" columns of table "orderbook" */
export enum Orderbook_Select_Column_Orderbook_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  HighestBuyPriceMarketOrderExists = 'highest_buy_price_market_order_exists',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  LowestSellPriceMarketOrderExists = 'lowest_sell_price_market_order_exists'
}

/** order by stddev() on columns of table "orderbook" */
export type Orderbook_Stddev_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook" */
export type Orderbook_Stddev_Pop_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook" */
export type Orderbook_Stddev_Samp_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "orderbook" */
export type Orderbook_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Scalars['bigint']['input']>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Scalars['bigint']['input']>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Scalars['bigint']['input']>;
  /** Whether a market buy order rests at the protected price */
  highest_buy_price_market_order_exists?: InputMaybe<Scalars['Boolean']['input']>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Scalars['bigint']['input']>;
  /** Timestamp of last matched price */
  last_matched_price_timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Scalars['bigint']['input']>;
  /** Whether a market sell order rests at the protected price */
  lowest_sell_price_market_order_exists?: InputMaybe<Scalars['Boolean']['input']>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Scalars['bigint']['input']>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Scalars['bigint']['input']>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Scalars['bigint']['input']>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Scalars['bigint']['input']>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Scalars['bigint']['input']>;
  /** Pending super admin address */
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  rwa_token_id?: InputMaybe<Scalars['Int']['input']>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Scalars['bigint']['input']>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Scalars['bigint']['input']>;
  /** Current super admin address */
  super_admin?: InputMaybe<Scalars['String']['input']>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "orderbook" */
export type Orderbook_Sum_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "orderbook_summary_view". All fields are combined with a logical 'AND'. */
export type Orderbook_Summary_View_Bool_Exp = {
  _and?: InputMaybe<Array<Orderbook_Summary_View_Bool_Exp>>;
  _not?: InputMaybe<Orderbook_Summary_View_Bool_Exp>;
  _or?: InputMaybe<Array<Orderbook_Summary_View_Bool_Exp>>;
  active_buy_orders_count?: InputMaybe<Bigint_Comparison_Exp>;
  active_sell_orders_count?: InputMaybe<Bigint_Comparison_Exp>;
  highest_buy_price?: InputMaybe<Bigint_Comparison_Exp>;
  last_matched_price?: InputMaybe<Bigint_Comparison_Exp>;
  last_matched_price_timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  lowest_sell_price?: InputMaybe<Bigint_Comparison_Exp>;
  orderbook_address?: InputMaybe<String_Comparison_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  rwa_token_address?: InputMaybe<String_Comparison_Exp>;
  rwa_token_id?: InputMaybe<Smallint_Comparison_Exp>;
  rwa_token_metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  volume_24h?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "orderbook_summary_view". */
export type Orderbook_Summary_View_Order_By = {
  active_buy_orders_count?: InputMaybe<Order_By>;
  active_sell_orders_count?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  orderbook_address?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_address?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  rwa_token_metadata?: InputMaybe<Order_By>;
  volume_24h?: InputMaybe<Order_By>;
};

/** select columns of table "orderbook_summary_view" */
export enum Orderbook_Summary_View_Select_Column {
  /** column name */
  ActiveBuyOrdersCount = 'active_buy_orders_count',
  /** column name */
  ActiveSellOrdersCount = 'active_sell_orders_count',
  /** column name */
  HighestBuyPrice = 'highest_buy_price',
  /** column name */
  LastMatchedPrice = 'last_matched_price',
  /** column name */
  LastMatchedPriceTimestamp = 'last_matched_price_timestamp',
  /** column name */
  LowestSellPrice = 'lowest_sell_price',
  /** column name */
  OrderbookAddress = 'orderbook_address',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  RwaTokenAddress = 'rwa_token_address',
  /** column name */
  RwaTokenId = 'rwa_token_id',
  /** column name */
  RwaTokenMetadata = 'rwa_token_metadata',
  /** column name */
  Volume_24h = 'volume_24h'
}

/** Streaming cursor of the table "orderbook_summary_view" */
export type Orderbook_Summary_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orderbook_Summary_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orderbook_Summary_View_Stream_Cursor_Value_Input = {
  active_buy_orders_count?: InputMaybe<Scalars['bigint']['input']>;
  active_sell_orders_count?: InputMaybe<Scalars['bigint']['input']>;
  highest_buy_price?: InputMaybe<Scalars['bigint']['input']>;
  last_matched_price?: InputMaybe<Scalars['bigint']['input']>;
  last_matched_price_timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  lowest_sell_price?: InputMaybe<Scalars['bigint']['input']>;
  orderbook_address?: InputMaybe<Scalars['String']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  rwa_token_address?: InputMaybe<Scalars['String']['input']>;
  rwa_token_id?: InputMaybe<Scalars['smallint']['input']>;
  rwa_token_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  volume_24h?: InputMaybe<Scalars['numeric']['input']>;
};

/** order by var_pop() on columns of table "orderbook" */
export type Orderbook_Var_Pop_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook" */
export type Orderbook_Var_Samp_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook" */
export type Orderbook_Variance_Order_By = {
  /** Counter for buy orders */
  buy_order_counter?: InputMaybe<Order_By>;
  /** Fee for buy orders */
  buy_order_fee?: InputMaybe<Order_By>;
  /** Highest buy price */
  highest_buy_price?: InputMaybe<Order_By>;
  /** ID of highest buy price order */
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  /** Last matched order price */
  last_matched_price?: InputMaybe<Order_By>;
  /** Lowest sell price */
  lowest_sell_price?: InputMaybe<Order_By>;
  /** ID of lowest sell price order */
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  /** Minimum buy order amount */
  min_buy_order_amount?: InputMaybe<Order_By>;
  /** Minimum buy order value */
  min_buy_order_value?: InputMaybe<Order_By>;
  /** Minimum order expiry time (seconds) */
  min_expiry_time?: InputMaybe<Order_By>;
  /** Minimum sell order amount */
  min_sell_order_amount?: InputMaybe<Order_By>;
  /** Minimum sell order value */
  min_sell_order_value?: InputMaybe<Order_By>;
  /** Minimum time before order can be closed */
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  /** Counter for sell orders */
  sell_order_counter?: InputMaybe<Order_By>;
  /** Fee for sell orders */
  sell_order_fee?: InputMaybe<Order_By>;
  /** Minimum price increment for orders (tick size) */
  tick_size?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "rwa_volume_24h_tokens". All fields are combined with a logical 'AND'. */
export type Rwa_Volume_24h_Tokens_Bool_Exp = {
  _and?: InputMaybe<Array<Rwa_Volume_24h_Tokens_Bool_Exp>>;
  _not?: InputMaybe<Rwa_Volume_24h_Tokens_Bool_Exp>;
  _or?: InputMaybe<Array<Rwa_Volume_24h_Tokens_Bool_Exp>>;
  computed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  volume_24h_tokens?: InputMaybe<Numeric_Comparison_Exp>;
};

/** Ordering options when selecting data from "rwa_volume_24h_tokens". */
export type Rwa_Volume_24h_Tokens_Order_By = {
  computed_at?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  volume_24h_tokens?: InputMaybe<Order_By>;
};

/** select columns of table "rwa_volume_24h_tokens" */
export enum Rwa_Volume_24h_Tokens_Select_Column {
  /** column name */
  ComputedAt = 'computed_at',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  Volume_24hTokens = 'volume_24h_tokens'
}

/** Streaming cursor of the table "rwa_volume_24h_tokens" */
export type Rwa_Volume_24h_Tokens_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Rwa_Volume_24h_Tokens_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Rwa_Volume_24h_Tokens_Stream_Cursor_Value_Input = {
  computed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  volume_24h_tokens?: InputMaybe<Scalars['numeric']['input']>;
};

/** Boolean expression to compare columns of type "smallint". All fields are combined with logical 'AND'. */
export type Smallint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['smallint']['input']>;
  _gt?: InputMaybe<Scalars['smallint']['input']>;
  _gte?: InputMaybe<Scalars['smallint']['input']>;
  _in?: InputMaybe<Array<Scalars['smallint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['smallint']['input']>;
  _lte?: InputMaybe<Scalars['smallint']['input']>;
  _neq?: InputMaybe<Scalars['smallint']['input']>;
  _nin?: InputMaybe<Array<Scalars['smallint']['input']>>;
};

/** Boolean expression to filter rows from the table "super_admin". All fields are combined with a logical 'AND'. */
export type Super_Admin_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Bool_Exp>>;
  action_counter?: InputMaybe<Bigint_Comparison_Exp>;
  action_expiry_in_seconds?: InputMaybe<Bigint_Comparison_Exp>;
  address?: InputMaybe<String_Comparison_Exp>;
  baker?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  lambdas?: InputMaybe<Super_Admin_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Super_Admin_Lambda_Aggregate_Bool_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  signatories?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp>;
  signatory_actions?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp>;
  signatory_size?: InputMaybe<Bigint_Comparison_Exp>;
  signatures?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp>;
  threshold?: InputMaybe<Bigint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_roles?: InputMaybe<Super_Admin_User_Role_Bool_Exp>;
  user_roles_aggregate?: InputMaybe<Super_Admin_User_Role_Aggregate_Bool_Exp>;
};

export type Super_Admin_Lambda_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_Lambda_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Lambda_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Lambda_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Lambda_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_lambda" */
export type Super_Admin_Lambda_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Lambda_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Lambda_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Lambda_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Lambda_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Lambda_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Lambda_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Lambda_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Lambda_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Lambda_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Lambda_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Avg_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_lambda". All fields are combined with a logical 'AND'. */
export type Super_Admin_Lambda_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Lambda_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Lambda_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Lambda_Bool_Exp>>;
  contract?: InputMaybe<Super_Admin_Bool_Exp>;
  contract_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambda_bytes?: InputMaybe<String_Comparison_Exp>;
  lambda_name?: InputMaybe<String_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_lambda". */
export type Super_Admin_Lambda_Order_By = {
  contract?: InputMaybe<Super_Admin_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lambda_bytes?: InputMaybe<Order_By>;
  lambda_name?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_lambda" */
export enum Super_Admin_Lambda_Select_Column {
  /** column name */
  ContractId = 'contract_id',
  /** column name */
  Id = 'id',
  /** column name */
  LambdaBytes = 'lambda_bytes',
  /** column name */
  LambdaName = 'lambda_name',
  /** column name */
  LastUpdatedAt = 'last_updated_at'
}

/** order by stddev() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Stddev_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Stddev_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Stddev_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_lambda" */
export type Super_Admin_Lambda_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Lambda_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Lambda_Stream_Cursor_Value_Input = {
  contract_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lambda_bytes?: InputMaybe<Scalars['String']['input']>;
  lambda_name?: InputMaybe<Scalars['String']['input']>;
  last_updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Sum_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Var_Pop_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Var_Samp_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_lambda" */
export type Super_Admin_Lambda_Variance_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin". */
export type Super_Admin_Order_By = {
  action_counter?: InputMaybe<Order_By>;
  action_expiry_in_seconds?: InputMaybe<Order_By>;
  address?: InputMaybe<Order_By>;
  baker?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Super_Admin_Lambda_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Order_By>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Order_By>;
  signatory_size?: InputMaybe<Order_By>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  threshold?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_roles_aggregate?: InputMaybe<Super_Admin_User_Role_Aggregate_Order_By>;
};

/** select columns of table "super_admin" */
export enum Super_Admin_Select_Column {
  /** column name */
  ActionCounter = 'action_counter',
  /** column name */
  ActionExpiryInSeconds = 'action_expiry_in_seconds',
  /** column name */
  Address = 'address',
  /** column name */
  Baker = 'baker',
  /** column name */
  Id = 'id',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  SignatorySize = 'signatory_size',
  /** column name */
  Threshold = 'threshold',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Super_Admin_Signatory_Action_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_And = {
  arguments: Super_Admin_Signatory_Action_Select_Column_Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Super_Admin_Signatory_Action_Select_Column_Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Signatory_Action_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Signatory_Action_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Signatory_Action_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Signatory_Action_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Signatory_Action_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Signatory_Action_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Signatory_Action_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Signatory_Action_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Signatory_Action_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Signatory_Action_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Signatory_Action_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Avg_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_signatory_action". All fields are combined with a logical 'AND'. */
export type Super_Admin_Signatory_Action_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Signatory_Action_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Signatory_Action_Bool_Exp>>;
  action_id?: InputMaybe<Bigint_Comparison_Exp>;
  action_type?: InputMaybe<String_Comparison_Exp>;
  data?: InputMaybe<Super_Admin_Signatory_Action_Data_Bool_Exp>;
  data_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Data_Aggregate_Bool_Exp>;
  executed?: InputMaybe<Boolean_Comparison_Exp>;
  executed_datetime?: InputMaybe<Timestamptz_Comparison_Exp>;
  executed_level?: InputMaybe<Bigint_Comparison_Exp>;
  expiration_datetime?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  initiator_id?: InputMaybe<Int_Comparison_Exp>;
  operation_hash?: InputMaybe<String_Comparison_Exp>;
  signatures?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp>;
  signers_count?: InputMaybe<Bigint_Comparison_Exp>;
  start_datetime?: InputMaybe<Timestamptz_Comparison_Exp>;
  start_level?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<Smallint_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

export type Super_Admin_Signatory_Action_Data_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_Signatory_Action_Data_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Signatory_Action_Data_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Signatory_Action_Data_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Action_Data_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Signatory_Action_Data_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Signatory_Action_Data_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Signatory_Action_Data_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Signatory_Action_Data_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Signatory_Action_Data_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Signatory_Action_Data_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Signatory_Action_Data_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Signatory_Action_Data_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Signatory_Action_Data_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Signatory_Action_Data_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Avg_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_signatory_action_data". All fields are combined with a logical 'AND'. */
export type Super_Admin_Signatory_Action_Data_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Signatory_Action_Data_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Signatory_Action_Data_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Signatory_Action_Data_Bool_Exp>>;
  action?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  action_id?: InputMaybe<Int_Comparison_Exp>;
  bytes?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Max_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Serialized action data */
  bytes?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Data name/identifier */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Min_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Serialized action data */
  bytes?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Data name/identifier */
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signatory_action_data". */
export type Super_Admin_Signatory_Action_Data_Order_By = {
  action?: InputMaybe<Super_Admin_Signatory_Action_Order_By>;
  action_id?: InputMaybe<Order_By>;
  bytes?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_signatory_action_data" */
export enum Super_Admin_Signatory_Action_Data_Select_Column {
  /** column name */
  ActionId = 'action_id',
  /** column name */
  Bytes = 'bytes',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** order by stddev() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Signatory_Action_Data_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Signatory_Action_Data_Stream_Cursor_Value_Input = {
  action_id?: InputMaybe<Scalars['Int']['input']>;
  /** Serialized action data */
  bytes?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Data name/identifier */
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Sum_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Var_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Var_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Variance_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Max_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Type of action */
  action_type?: InputMaybe<Order_By>;
  /** Action execution timestamp */
  executed_datetime?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Action expiration timestamp */
  expiration_datetime?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Mavryk operation hash that initiated the action */
  operation_hash?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Action start timestamp */
  start_datetime?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Min_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Type of action */
  action_type?: InputMaybe<Order_By>;
  /** Action execution timestamp */
  executed_datetime?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Action expiration timestamp */
  expiration_datetime?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Mavryk operation hash that initiated the action */
  operation_hash?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Action start timestamp */
  start_datetime?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signatory_action". */
export type Super_Admin_Signatory_Action_Order_By = {
  action_id?: InputMaybe<Order_By>;
  action_type?: InputMaybe<Order_By>;
  data_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Data_Aggregate_Order_By>;
  executed?: InputMaybe<Order_By>;
  executed_datetime?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  expiration_datetime?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Super_Admin_Signatory_Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  operation_hash?: InputMaybe<Order_By>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_datetime?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_signatory_action" */
export enum Super_Admin_Signatory_Action_Select_Column {
  /** column name */
  ActionId = 'action_id',
  /** column name */
  ActionType = 'action_type',
  /** column name */
  Executed = 'executed',
  /** column name */
  ExecutedDatetime = 'executed_datetime',
  /** column name */
  ExecutedLevel = 'executed_level',
  /** column name */
  ExpirationDatetime = 'expiration_datetime',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorId = 'initiator_id',
  /** column name */
  OperationHash = 'operation_hash',
  /** column name */
  SignersCount = 'signers_count',
  /** column name */
  StartDatetime = 'start_datetime',
  /** column name */
  StartLevel = 'start_level',
  /** column name */
  Status = 'status',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "super_admin_signatory_action_aggregate_bool_exp_bool_and_arguments_columns" columns of table "super_admin_signatory_action" */
export enum Super_Admin_Signatory_Action_Select_Column_Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Executed = 'executed'
}

/** select "super_admin_signatory_action_aggregate_bool_exp_bool_or_arguments_columns" columns of table "super_admin_signatory_action" */
export enum Super_Admin_Signatory_Action_Select_Column_Super_Admin_Signatory_Action_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Executed = 'executed'
}

/** order by stddev() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stddev_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stddev_Pop_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stddev_Samp_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Signatory_Action_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Signatory_Action_Stream_Cursor_Value_Input = {
  /** Unique action identifier */
  action_id?: InputMaybe<Scalars['bigint']['input']>;
  /** Type of action */
  action_type?: InputMaybe<Scalars['String']['input']>;
  /** Whether action has been executed */
  executed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Action execution timestamp */
  executed_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Scalars['bigint']['input']>;
  /** Action expiration timestamp */
  expiration_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  /** Mavryk operation hash that initiated the action */
  operation_hash?: InputMaybe<Scalars['String']['input']>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Scalars['bigint']['input']>;
  /** Action start timestamp */
  start_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Scalars['bigint']['input']>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Scalars['smallint']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Sum_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Var_Pop_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Var_Samp_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Variance_Order_By = {
  /** Unique action identifier */
  action_id?: InputMaybe<Order_By>;
  /** Blockchain level when action was executed */
  executed_level?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  /** Number of signers who approved */
  signers_count?: InputMaybe<Order_By>;
  /** Blockchain level when action started */
  start_level?: InputMaybe<Order_By>;
  /** Action status (FLUSHED/EXECUTED/PENDING) */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

export type Super_Admin_Signatory_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_And = {
  arguments: Super_Admin_Signatory_Select_Column_Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Super_Admin_Signatory_Select_Column_Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Super_Admin_Signatory_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Signatory_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_signatory" */
export type Super_Admin_Signatory_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Signatory_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Signatory_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Signatory_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Signatory_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Signatory_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Signatory_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Signatory_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Signatory_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Signatory_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Signatory_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_signatory". All fields are combined with a logical 'AND'. */
export type Super_Admin_Signatory_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Signatory_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Signatory_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  signatory_actions?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp>;
  signatures?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Max_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Signatory name */
  name?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Min_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Signatory name */
  name?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signatory". */
export type Super_Admin_Signatory_Order_By = {
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Order_By>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_signatory" */
export enum Super_Admin_Signatory_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "super_admin_signatory_aggregate_bool_exp_bool_and_arguments_columns" columns of table "super_admin_signatory" */
export enum Super_Admin_Signatory_Select_Column_Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "super_admin_signatory_aggregate_bool_exp_bool_or_arguments_columns" columns of table "super_admin_signatory" */
export enum Super_Admin_Signatory_Select_Column_Super_Admin_Signatory_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** order by stddev() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_signatory" */
export type Super_Admin_Signatory_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Signatory_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Signatory_Stream_Cursor_Value_Input = {
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Whether signatory is active */
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Signatory name */
  name?: InputMaybe<Scalars['String']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Super_Admin_Signature_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Signature_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Signature_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_signature" */
export type Super_Admin_Signature_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Signature_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Signature_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Signature_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Signature_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Signature_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Signature_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Signature_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Signature_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Signature_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Signature_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Avg_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_signature". All fields are combined with a logical 'AND'. */
export type Super_Admin_Signature_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Signature_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Signature_Bool_Exp>>;
  action?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  action_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  signatory?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  signatory_id?: InputMaybe<Int_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Max_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Min_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signature". */
export type Super_Admin_Signature_Order_By = {
  action?: InputMaybe<Super_Admin_Signatory_Action_Order_By>;
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  signatory?: InputMaybe<Super_Admin_Signatory_Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_signature" */
export enum Super_Admin_Signature_Select_Column {
  /** column name */
  ActionId = 'action_id',
  /** column name */
  Id = 'id',
  /** column name */
  SignatoryId = 'signatory_id',
  /** column name */
  SuperAdminId = 'super_admin_id'
}

/** order by stddev() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Stddev_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Stddev_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Stddev_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_signature" */
export type Super_Admin_Signature_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Signature_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Signature_Stream_Cursor_Value_Input = {
  action_id?: InputMaybe<Scalars['Int']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  signatory_id?: InputMaybe<Scalars['Int']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Sum_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Var_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Var_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Variance_Order_By = {
  action_id?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin" */
export type Super_Admin_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Stream_Cursor_Value_Input = {
  /** Counter for actions */
  action_counter?: InputMaybe<Scalars['bigint']['input']>;
  /** Action expiry time in seconds */
  action_expiry_in_seconds?: InputMaybe<Scalars['bigint']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  /** Baker delegate address */
  baker?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Contract metadata */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Number of signatories required */
  signatory_size?: InputMaybe<Scalars['bigint']['input']>;
  /** Threshold for action execution */
  threshold?: InputMaybe<Scalars['bigint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type Super_Admin_User_Role_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_User_Role_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_User_Role_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_User_Role_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_User_Role_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_user_role" */
export type Super_Admin_User_Role_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_User_Role_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_User_Role_Max_Order_By>;
  min?: InputMaybe<Super_Admin_User_Role_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_User_Role_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_User_Role_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_User_Role_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_User_Role_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_User_Role_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_User_Role_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_User_Role_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Avg_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_user_role". All fields are combined with a logical 'AND'. */
export type Super_Admin_User_Role_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_User_Role_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_User_Role_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_User_Role_Bool_Exp>>;
  contract_address?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Max_Order_By = {
  /** Contract address the role is scoped to */
  contract_address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Role name (e.g. GENERAL_ADMIN) */
  role?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Min_Order_By = {
  /** Contract address the role is scoped to */
  contract_address?: InputMaybe<Order_By>;
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  /** Role name (e.g. GENERAL_ADMIN) */
  role?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_user_role". */
export type Super_Admin_User_Role_Order_By = {
  contract_address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_user_role" */
export enum Super_Admin_User_Role_Select_Column {
  /** column name */
  ContractAddress = 'contract_address',
  /** column name */
  Id = 'id',
  /** column name */
  Role = 'role',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Stddev_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Stddev_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Stddev_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_user_role" */
export type Super_Admin_User_Role_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_User_Role_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_User_Role_Stream_Cursor_Value_Input = {
  /** Contract address the role is scoped to */
  contract_address?: InputMaybe<Scalars['String']['input']>;
  /** Primary key identifier */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** Role name (e.g. GENERAL_ADMIN) */
  role?: InputMaybe<Scalars['String']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Sum_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Var_Pop_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Var_Samp_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_user_role" */
export type Super_Admin_User_Role_Variance_Order_By = {
  /** Primary key identifier */
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Boolean expression to filter rows from the table "token_avg_hold_time". All fields are combined with a logical 'AND'. */
export type Token_Avg_Hold_Time_Bool_Exp = {
  _and?: InputMaybe<Array<Token_Avg_Hold_Time_Bool_Exp>>;
  _not?: InputMaybe<Token_Avg_Hold_Time_Bool_Exp>;
  _or?: InputMaybe<Array<Token_Avg_Hold_Time_Bool_Exp>>;
  avg_hold_time_days?: InputMaybe<Numeric_Comparison_Exp>;
  computed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  holders_count?: InputMaybe<Bigint_Comparison_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** Ordering options when selecting data from "token_avg_hold_time". */
export type Token_Avg_Hold_Time_Order_By = {
  avg_hold_time_days?: InputMaybe<Order_By>;
  computed_at?: InputMaybe<Order_By>;
  holders_count?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** select columns of table "token_avg_hold_time" */
export enum Token_Avg_Hold_Time_Select_Column {
  /** column name */
  AvgHoldTimeDays = 'avg_hold_time_days',
  /** column name */
  ComputedAt = 'computed_at',
  /** column name */
  HoldersCount = 'holders_count',
  /** column name */
  TokenId = 'token_id'
}

/** Streaming cursor of the table "token_avg_hold_time" */
export type Token_Avg_Hold_Time_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Token_Avg_Hold_Time_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Token_Avg_Hold_Time_Stream_Cursor_Value_Input = {
  avg_hold_time_days?: InputMaybe<Scalars['numeric']['input']>;
  computed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  holders_count?: InputMaybe<Scalars['bigint']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression to filter rows from the table "token". All fields are combined with a logical 'AND'. */
export type Token_Bool_Exp = {
  _and?: InputMaybe<Array<Token_Bool_Exp>>;
  _not?: InputMaybe<Token_Bool_Exp>;
  _or?: InputMaybe<Array<Token_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  dodo_mav_base_lp_tokens?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mav_base_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp>;
  dodo_mav_base_tokens?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mav_base_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp>;
  dodo_mav_quote_lp_tokens?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mav_quote_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp>;
  dodo_mav_quote_tokens?: InputMaybe<Dodo_Mav_Bool_Exp>;
  dodo_mav_quote_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  in_allowlist?: InputMaybe<Boolean_Comparison_Exp>;
  launchpad_launches?: InputMaybe<Launchpad_Launch_Bool_Exp>;
  launchpad_launches_aggregate?: InputMaybe<Launchpad_Launch_Aggregate_Bool_Exp>;
  launchpad_payment_events?: InputMaybe<Launchpad_Purchase_Event_Bool_Exp>;
  launchpad_payment_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Bool_Exp>;
  launchpad_payments?: InputMaybe<Launchpad_Sale_Option_Payment_Bool_Exp>;
  launchpad_payments_aggregate?: InputMaybe<Launchpad_Sale_Option_Payment_Aggregate_Bool_Exp>;
  marketplace_currencies?: InputMaybe<Marketplace_Currency_Bool_Exp>;
  marketplace_currencies_aggregate?: InputMaybe<Marketplace_Currency_Aggregate_Bool_Exp>;
  marketplace_listing_tokens?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  marketplace_listing_tokens_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  orderbook_currencies?: InputMaybe<Orderbook_Currency_Bool_Exp>;
  orderbook_currencies_aggregate?: InputMaybe<Orderbook_Currency_Aggregate_Bool_Exp>;
  orderbook_fees?: InputMaybe<Orderbook_Fee_Bool_Exp>;
  orderbook_fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Bool_Exp>;
  orderbook_rwa_orders?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  orderbook_rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Bool_Exp>;
  orderbooks?: InputMaybe<Orderbook_Bool_Exp>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Bool_Exp>;
  token_id?: InputMaybe<Smallint_Comparison_Exp>;
  token_metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  token_standard?: InputMaybe<Smallint_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_token_transfers?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  user_token_transfers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
};

/** Boolean expression to filter rows from the table "token_launch_treasury". All fields are combined with a logical 'AND'. */
export type Token_Launch_Treasury_Bool_Exp = {
  _and?: InputMaybe<Array<Token_Launch_Treasury_Bool_Exp>>;
  _not?: InputMaybe<Token_Launch_Treasury_Bool_Exp>;
  _or?: InputMaybe<Array<Token_Launch_Treasury_Bool_Exp>>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  treasury_address?: InputMaybe<String_Comparison_Exp>;
};

/** Ordering options when selecting data from "token_launch_treasury". */
export type Token_Launch_Treasury_Order_By = {
  token_id?: InputMaybe<Order_By>;
  treasury_address?: InputMaybe<Order_By>;
};

/** select columns of table "token_launch_treasury" */
export enum Token_Launch_Treasury_Select_Column {
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TreasuryAddress = 'treasury_address'
}

/** Streaming cursor of the table "token_launch_treasury" */
export type Token_Launch_Treasury_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Token_Launch_Treasury_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Token_Launch_Treasury_Stream_Cursor_Value_Input = {
  token_id?: InputMaybe<Scalars['Int']['input']>;
  treasury_address?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to filter rows from the table "token_metadata_view". All fields are combined with a logical 'AND'. */
export type Token_Metadata_View_Bool_Exp = {
  _and?: InputMaybe<Array<Token_Metadata_View_Bool_Exp>>;
  _not?: InputMaybe<Token_Metadata_View_Bool_Exp>;
  _or?: InputMaybe<Array<Token_Metadata_View_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  artifact_uri?: InputMaybe<String_Comparison_Exp>;
  decimals?: InputMaybe<String_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  symbol?: InputMaybe<String_Comparison_Exp>;
  thumbnail_uri?: InputMaybe<String_Comparison_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  token_metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  token_number?: InputMaybe<Smallint_Comparison_Exp>;
  token_standard?: InputMaybe<Smallint_Comparison_Exp>;
};

/** Ordering options when selecting data from "token_metadata_view". */
export type Token_Metadata_View_Order_By = {
  address?: InputMaybe<Order_By>;
  artifact_uri?: InputMaybe<Order_By>;
  decimals?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  symbol?: InputMaybe<Order_By>;
  thumbnail_uri?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  token_metadata?: InputMaybe<Order_By>;
  token_number?: InputMaybe<Order_By>;
  token_standard?: InputMaybe<Order_By>;
};

/** select columns of table "token_metadata_view" */
export enum Token_Metadata_View_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  ArtifactUri = 'artifact_uri',
  /** column name */
  Decimals = 'decimals',
  /** column name */
  Description = 'description',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Name = 'name',
  /** column name */
  Symbol = 'symbol',
  /** column name */
  ThumbnailUri = 'thumbnail_uri',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TokenMetadata = 'token_metadata',
  /** column name */
  TokenNumber = 'token_number',
  /** column name */
  TokenStandard = 'token_standard'
}

/** Streaming cursor of the table "token_metadata_view" */
export type Token_Metadata_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Token_Metadata_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Token_Metadata_View_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  artifact_uri?: InputMaybe<Scalars['String']['input']>;
  decimals?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  thumbnail_uri?: InputMaybe<Scalars['String']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  token_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  token_number?: InputMaybe<Scalars['smallint']['input']>;
  token_standard?: InputMaybe<Scalars['smallint']['input']>;
};

/** Ordering options when selecting data from "token". */
export type Token_Order_By = {
  address?: InputMaybe<Order_By>;
  dodo_mav_base_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_base_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_quote_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_quote_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  in_allowlist?: InputMaybe<Order_By>;
  launchpad_launches_aggregate?: InputMaybe<Launchpad_Launch_Aggregate_Order_By>;
  launchpad_payment_events_aggregate?: InputMaybe<Launchpad_Purchase_Event_Aggregate_Order_By>;
  launchpad_payments_aggregate?: InputMaybe<Launchpad_Sale_Option_Payment_Aggregate_Order_By>;
  marketplace_currencies_aggregate?: InputMaybe<Marketplace_Currency_Aggregate_Order_By>;
  marketplace_listing_tokens_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  orderbook_currencies_aggregate?: InputMaybe<Orderbook_Currency_Aggregate_Order_By>;
  orderbook_fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Order_By>;
  orderbook_rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Order_By>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Order_By>;
  token_id?: InputMaybe<Order_By>;
  token_metadata?: InputMaybe<Order_By>;
  token_standard?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_token_transfers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
};

/** select columns of table "token" */
export enum Token_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  InAllowlist = 'in_allowlist',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TokenMetadata = 'token_metadata',
  /** column name */
  TokenStandard = 'token_standard',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** Streaming cursor of the table "token" */
export type Token_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Token_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Token_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  in_allowlist?: InputMaybe<Scalars['Boolean']['input']>;
  /** Token metadata in JSON format */
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Token ID (for FA2 tokens with multiple token types) */
  token_id?: InputMaybe<Scalars['smallint']['input']>;
  /** Additional token metadata */
  token_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** Token standard type (FA12, FA2, MAV) */
  token_standard?: InputMaybe<Scalars['smallint']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Boolean expression to filter rows from the table "token_transfer_volume_daily". All fields are combined with a logical 'AND'. */
export type Token_Transfer_Volume_Daily_Bool_Exp = {
  _and?: InputMaybe<Array<Token_Transfer_Volume_Daily_Bool_Exp>>;
  _not?: InputMaybe<Token_Transfer_Volume_Daily_Bool_Exp>;
  _or?: InputMaybe<Array<Token_Transfer_Volume_Daily_Bool_Exp>>;
  day?: InputMaybe<Timestamptz_Comparison_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  total_volume?: InputMaybe<Numeric_Comparison_Exp>;
  transfer_count?: InputMaybe<Bigint_Comparison_Exp>;
};

/** Ordering options when selecting data from "token_transfer_volume_daily". */
export type Token_Transfer_Volume_Daily_Order_By = {
  day?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  total_volume?: InputMaybe<Order_By>;
  transfer_count?: InputMaybe<Order_By>;
};

/** select columns of table "token_transfer_volume_daily" */
export enum Token_Transfer_Volume_Daily_Select_Column {
  /** column name */
  Day = 'day',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TotalVolume = 'total_volume',
  /** column name */
  TransferCount = 'transfer_count'
}

/** Streaming cursor of the table "token_transfer_volume_daily" */
export type Token_Transfer_Volume_Daily_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Token_Transfer_Volume_Daily_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Token_Transfer_Volume_Daily_Stream_Cursor_Value_Input = {
  day?: InputMaybe<Scalars['timestamptz']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  total_volume?: InputMaybe<Scalars['numeric']['input']>;
  transfer_count?: InputMaybe<Scalars['bigint']['input']>;
};

/** Boolean expression to filter rows from the table "user_orders_summary_view". All fields are combined with a logical 'AND'. */
export type User_Orders_Summary_View_Bool_Exp = {
  _and?: InputMaybe<Array<User_Orders_Summary_View_Bool_Exp>>;
  _not?: InputMaybe<User_Orders_Summary_View_Bool_Exp>;
  _or?: InputMaybe<Array<User_Orders_Summary_View_Bool_Exp>>;
  active_buy_orders_count?: InputMaybe<Bigint_Comparison_Exp>;
  active_sell_orders_count?: InputMaybe<Bigint_Comparison_Exp>;
  orderbook_address?: InputMaybe<String_Comparison_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  total_buy_volume?: InputMaybe<Numeric_Comparison_Exp>;
  total_sell_volume?: InputMaybe<Numeric_Comparison_Exp>;
  user_address?: InputMaybe<String_Comparison_Exp>;
};

/** Ordering options when selecting data from "user_orders_summary_view". */
export type User_Orders_Summary_View_Order_By = {
  active_buy_orders_count?: InputMaybe<Order_By>;
  active_sell_orders_count?: InputMaybe<Order_By>;
  orderbook_address?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  total_buy_volume?: InputMaybe<Order_By>;
  total_sell_volume?: InputMaybe<Order_By>;
  user_address?: InputMaybe<Order_By>;
};

/** select columns of table "user_orders_summary_view" */
export enum User_Orders_Summary_View_Select_Column {
  /** column name */
  ActiveBuyOrdersCount = 'active_buy_orders_count',
  /** column name */
  ActiveSellOrdersCount = 'active_sell_orders_count',
  /** column name */
  OrderbookAddress = 'orderbook_address',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  TotalBuyVolume = 'total_buy_volume',
  /** column name */
  TotalSellVolume = 'total_sell_volume',
  /** column name */
  UserAddress = 'user_address'
}

/** Streaming cursor of the table "user_orders_summary_view" */
export type User_Orders_Summary_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Orders_Summary_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Orders_Summary_View_Stream_Cursor_Value_Input = {
  active_buy_orders_count?: InputMaybe<Scalars['bigint']['input']>;
  active_sell_orders_count?: InputMaybe<Scalars['bigint']['input']>;
  orderbook_address?: InputMaybe<Scalars['String']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  total_buy_volume?: InputMaybe<Scalars['numeric']['input']>;
  total_sell_volume?: InputMaybe<Scalars['numeric']['input']>;
  user_address?: InputMaybe<Scalars['String']['input']>;
};

export type OpenOrderFieldsFragment = { __typename?: 'orderbook_order', id: number, is_canceled: boolean, is_expired: boolean, is_fulfilled: boolean, is_refunded: boolean, order_expiry?: any | null, order_id: any, order_type: any, created_at?: any | null, ended_at?: any | null, fulfilled_amount: any, orderbook_id: number, price_per_rwa_token: any, refunded_amount: any, rwa_token_amount: any, total_paid_out: any, total_usd_value_of_rwa_token_amount: any, unfulfilled_amount: any, orderbook: { __typename?: 'orderbook', rwa_token?: { __typename?: 'token', address: string } | null } } & { ' $fragmentName'?: 'OpenOrderFieldsFragment' };

export type AllOpenOrdersQueryQueryVariables = Exact<{
  rwaAddress?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllOpenOrdersQueryQuery = { __typename?: 'query_root', buyOrders: Array<(
    { __typename?: 'orderbook_order' }
    & { ' $fragmentRefs'?: { 'OpenOrderFieldsFragment': OpenOrderFieldsFragment } }
  )>, sellOrders: Array<(
    { __typename?: 'orderbook_order' }
    & { ' $fragmentRefs'?: { 'OpenOrderFieldsFragment': OpenOrderFieldsFragment } }
  )> };

export type OpenOrdersByRwaAddressesQueryQueryVariables = Exact<{
  rwaAddresses: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type OpenOrdersByRwaAddressesQueryQuery = { __typename?: 'query_root', buyOrders: Array<(
    { __typename?: 'orderbook_order' }
    & { ' $fragmentRefs'?: { 'OpenOrderFieldsFragment': OpenOrderFieldsFragment } }
  )>, sellOrders: Array<(
    { __typename?: 'orderbook_order' }
    & { ' $fragmentRefs'?: { 'OpenOrderFieldsFragment': OpenOrderFieldsFragment } }
  )> };

export type OrderbookLastTradesQueryQueryVariables = Exact<{
  rwaAddress?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrderbookLastTradesQueryQuery = { __typename?: 'query_root', tradeEvents: Array<{ __typename?: 'orderbook_order_event', id: number, counter: any, currency_delta: any, fulfilled_after: any, fulfilled_before: any, order_type: any, timestamp: any, operation_hash: string, order: { __typename?: 'orderbook_order', created_at?: any | null, is_market_order: boolean, price_per_rwa_token: any } }> };

export type ConfigQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type ConfigQueryQuery = { __typename?: 'query_root', super_admin: Array<{ __typename?: 'super_admin', address: string }> };

export type DipDupHeadLvlSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DipDupHeadLvlSubscription = { __typename?: 'subscription_root', dipdup_head: Array<{ __typename?: 'dipdup_head', level: number }> };

export type UserAccountStatusQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type UserAccountStatusQuery = { __typename?: 'query_root', kyc_member: Array<{ __typename?: 'kyc_member', user?: { __typename?: 'equiteez_user', address: string, orderbook_order_events: Array<{ __typename?: 'orderbook_order_event', counter: any }> } | null }> };

export const OpenOrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OpenOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"orderbook_order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rwa_token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_canceled"}},{"kind":"Field","name":{"kind":"Name","value":"is_expired"}},{"kind":"Field","name":{"kind":"Name","value":"is_fulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"is_refunded"}},{"kind":"Field","name":{"kind":"Name","value":"order_expiry"}},{"kind":"Field","name":{"kind":"Name","value":"order_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"ended_at"}},{"kind":"Field","name":{"kind":"Name","value":"fulfilled_amount"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook_id"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_rwa_token"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"total_paid_out"}},{"kind":"Field","name":{"kind":"Name","value":"total_usd_value_of_rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"unfulfilled_amount"}}]}}]} as unknown as DocumentNode<OpenOrderFieldsFragment, unknown>;
export const AllOpenOrdersQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"allOpenOrdersQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"buyOrders"},"name":{"kind":"Name","value":"orderbook_order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"price_per_rwa_token"},"value":{"kind":"EnumValue","value":"desc"}},{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"is_canceled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_expired"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_fulfilled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_refunded"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"order_type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"IntValue","value":"0"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderbook"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"rwa_token"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddress"}}}]}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OpenOrderFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"sellOrders"},"name":{"kind":"Name","value":"orderbook_order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"price_per_rwa_token"},"value":{"kind":"EnumValue","value":"asc"}},{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"is_canceled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_expired"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_fulfilled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_refunded"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"order_type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"IntValue","value":"1"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderbook"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"rwa_token"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddress"}}}]}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OpenOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OpenOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"orderbook_order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rwa_token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_canceled"}},{"kind":"Field","name":{"kind":"Name","value":"is_expired"}},{"kind":"Field","name":{"kind":"Name","value":"is_fulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"is_refunded"}},{"kind":"Field","name":{"kind":"Name","value":"order_expiry"}},{"kind":"Field","name":{"kind":"Name","value":"order_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"ended_at"}},{"kind":"Field","name":{"kind":"Name","value":"fulfilled_amount"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook_id"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_rwa_token"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"total_paid_out"}},{"kind":"Field","name":{"kind":"Name","value":"total_usd_value_of_rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"unfulfilled_amount"}}]}}]} as unknown as DocumentNode<AllOpenOrdersQueryQuery, AllOpenOrdersQueryQueryVariables>;
export const OpenOrdersByRwaAddressesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"openOrdersByRwaAddressesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddresses"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"buyOrders"},"name":{"kind":"Name","value":"orderbook_order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"price_per_rwa_token"},"value":{"kind":"EnumValue","value":"desc"}},{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"is_canceled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_expired"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_fulfilled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_refunded"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"order_type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"IntValue","value":"0"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderbook"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"rwa_token"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddresses"}}}]}}]}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OpenOrderFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"sellOrders"},"name":{"kind":"Name","value":"orderbook_order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"price_per_rwa_token"},"value":{"kind":"EnumValue","value":"asc"}},{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"is_canceled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_expired"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_fulfilled"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"is_refunded"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"BooleanValue","value":false}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"order_type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"IntValue","value":"1"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderbook"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"rwa_token"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddresses"}}}]}}]}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OpenOrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OpenOrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"orderbook_order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rwa_token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"is_canceled"}},{"kind":"Field","name":{"kind":"Name","value":"is_expired"}},{"kind":"Field","name":{"kind":"Name","value":"is_fulfilled"}},{"kind":"Field","name":{"kind":"Name","value":"is_refunded"}},{"kind":"Field","name":{"kind":"Name","value":"order_expiry"}},{"kind":"Field","name":{"kind":"Name","value":"order_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"ended_at"}},{"kind":"Field","name":{"kind":"Name","value":"fulfilled_amount"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook_id"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_rwa_token"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_amount"}},{"kind":"Field","name":{"kind":"Name","value":"rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"total_paid_out"}},{"kind":"Field","name":{"kind":"Name","value":"total_usd_value_of_rwa_token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"unfulfilled_amount"}}]}}]} as unknown as DocumentNode<OpenOrdersByRwaAddressesQueryQuery, OpenOrdersByRwaAddressesQueryQueryVariables>;
export const OrderbookLastTradesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"orderbookLastTradesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"tradeEvents"},"name":{"kind":"Name","value":"orderbook_order_event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"timestamp"},"value":{"kind":"EnumValue","value":"desc"}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"counter"},"value":{"kind":"EnumValue","value":"desc"}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"EnumValue","value":"desc"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"event_type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"IntValue","value":"1"}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderbook"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"rwa_token"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rwaAddress"}}}]}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"counter"}},{"kind":"Field","name":{"kind":"Name","value":"currency_delta"}},{"kind":"Field","name":{"kind":"Name","value":"fulfilled_after"}},{"kind":"Field","name":{"kind":"Name","value":"fulfilled_before"}},{"kind":"Field","name":{"kind":"Name","value":"order_type"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_market_order"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_rwa_token"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operation_hash"}}]}}]}}]} as unknown as DocumentNode<OrderbookLastTradesQueryQuery, OrderbookLastTradesQueryQueryVariables>;
export const ConfigQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"configQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"super_admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<ConfigQueryQuery, ConfigQueryQueryVariables>;
export const DipDupHeadLvlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DipDupHeadLvl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dipdup_head"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}}]}}]}}]} as unknown as DocumentNode<DipDupHeadLvlSubscription, DipDupHeadLvlSubscriptionVariables>;
export const UserAccountStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserAccountStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kyc_member"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"user"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}}]}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"orderbook_order_events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"counter"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserAccountStatusQuery, UserAccountStatusQueryVariables>;