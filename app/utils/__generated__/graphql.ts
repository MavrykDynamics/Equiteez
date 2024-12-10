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
  timetz: { input: any; output: any; }
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
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
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
};

/** order by max() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav_entrypoint_status" */
export type Dodo_Mav_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "dodo_mav_entrypoint_status". */
export type Dodo_Mav_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Dodo_Mav_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
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
  Paused = 'paused'
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
  address?: InputMaybe<Order_By>;
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "dodo_mav" */
export type Dodo_Mav_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
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
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "dodo_mav" */
export type Dodo_Mav_Stddev_Pop_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "dodo_mav" */
export type Dodo_Mav_Stddev_Samp_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
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
  address?: InputMaybe<Scalars['String']['input']>;
  appraisal_price?: InputMaybe<Scalars['float8']['input']>;
  base_balance?: InputMaybe<Scalars['float8']['input']>;
  base_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  base_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  base_token_id?: InputMaybe<Scalars['Int']['input']>;
  fee_decimals?: InputMaybe<Scalars['bigint']['input']>;
  fixed_price_percent?: InputMaybe<Scalars['bigint']['input']>;
  guide_price?: InputMaybe<Scalars['float8']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  lp_fee?: InputMaybe<Scalars['bigint']['input']>;
  maintainer_fee?: InputMaybe<Scalars['bigint']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  orderbook_price_percent?: InputMaybe<Scalars['bigint']['input']>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Scalars['smallint']['input']>;
  quote_balance?: InputMaybe<Scalars['float8']['input']>;
  quote_balance_limit?: InputMaybe<Scalars['float8']['input']>;
  quote_lp_token_id?: InputMaybe<Scalars['Int']['input']>;
  quote_token_id?: InputMaybe<Scalars['Int']['input']>;
  r_status?: InputMaybe<Scalars['bigint']['input']>;
  rwa_orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  slippage_factor?: InputMaybe<Scalars['bigint']['input']>;
  super_admin?: InputMaybe<Scalars['String']['input']>;
  target_base_token_amount?: InputMaybe<Scalars['float8']['input']>;
  target_quote_token_amount?: InputMaybe<Scalars['float8']['input']>;
};

/** order by sum() on columns of table "dodo_mav" */
export type Dodo_Mav_Sum_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "dodo_mav" */
export type Dodo_Mav_Var_Pop_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "dodo_mav" */
export type Dodo_Mav_Var_Samp_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "dodo_mav" */
export type Dodo_Mav_Variance_Order_By = {
  appraisal_price?: InputMaybe<Order_By>;
  base_balance?: InputMaybe<Order_By>;
  base_balance_limit?: InputMaybe<Order_By>;
  base_lp_token_id?: InputMaybe<Order_By>;
  base_token_id?: InputMaybe<Order_By>;
  fee_decimals?: InputMaybe<Order_By>;
  fixed_price_percent?: InputMaybe<Order_By>;
  guide_price?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lp_fee?: InputMaybe<Order_By>;
  maintainer_fee?: InputMaybe<Order_By>;
  orderbook_price_percent?: InputMaybe<Order_By>;
  /** FIXED: 0\nDYNAMIC: 1 */
  price_model?: InputMaybe<Order_By>;
  quote_balance?: InputMaybe<Order_By>;
  quote_balance_limit?: InputMaybe<Order_By>;
  quote_lp_token_id?: InputMaybe<Order_By>;
  quote_token_id?: InputMaybe<Order_By>;
  r_status?: InputMaybe<Order_By>;
  rwa_orderbook_id?: InputMaybe<Order_By>;
  slippage_factor?: InputMaybe<Order_By>;
  target_base_token_amount?: InputMaybe<Order_By>;
  target_quote_token_amount?: InputMaybe<Order_By>;
};

export type Equiteez_User_Balance_Aggregate_Bool_Exp = {
  count?: InputMaybe<Equiteez_User_Balance_Aggregate_Bool_Exp_Count>;
};

export type Equiteez_User_Balance_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Equiteez_User_Balance_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Equiteez_User_Balance_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Aggregate_Order_By = {
  avg?: InputMaybe<Equiteez_User_Balance_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Equiteez_User_Balance_Max_Order_By>;
  min?: InputMaybe<Equiteez_User_Balance_Min_Order_By>;
  stddev?: InputMaybe<Equiteez_User_Balance_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Equiteez_User_Balance_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Equiteez_User_Balance_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Equiteez_User_Balance_Sum_Order_By>;
  var_pop?: InputMaybe<Equiteez_User_Balance_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Equiteez_User_Balance_Var_Samp_Order_By>;
  variance?: InputMaybe<Equiteez_User_Balance_Variance_Order_By>;
};

/** order by avg() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Avg_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "equiteez_user_balance". All fields are combined with a logical 'AND'. */
export type Equiteez_User_Balance_Bool_Exp = {
  _and?: InputMaybe<Array<Equiteez_User_Balance_Bool_Exp>>;
  _not?: InputMaybe<Equiteez_User_Balance_Bool_Exp>;
  _or?: InputMaybe<Array<Equiteez_User_Balance_Bool_Exp>>;
  balance?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Max_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Min_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "equiteez_user_balance". */
export type Equiteez_User_Balance_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "equiteez_user_balance" */
export enum Equiteez_User_Balance_Select_Column {
  /** column name */
  Balance = 'balance',
  /** column name */
  Id = 'id',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Stddev_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Stddev_Pop_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Stddev_Samp_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "equiteez_user_balance" */
export type Equiteez_User_Balance_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Equiteez_User_Balance_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Equiteez_User_Balance_Stream_Cursor_Value_Input = {
  balance?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Sum_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Var_Pop_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Var_Samp_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "equiteez_user_balance" */
export type Equiteez_User_Balance_Variance_Order_By = {
  balance?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "equiteez_user". All fields are combined with a logical 'AND'. */
export type Equiteez_User_Bool_Exp = {
  _and?: InputMaybe<Array<Equiteez_User_Bool_Exp>>;
  _not?: InputMaybe<Equiteez_User_Bool_Exp>;
  _or?: InputMaybe<Array<Equiteez_User_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  balances?: InputMaybe<Equiteez_User_Balance_Bool_Exp>;
  balances_aggregate?: InputMaybe<Equiteez_User_Balance_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc_blacklists?: InputMaybe<Kyc_Blacklisted_Bool_Exp>;
  kyc_blacklists_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Bool_Exp>;
  kyc_members?: InputMaybe<Kyc_Member_Bool_Exp>;
  kyc_members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  kyc_registrars?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  kyc_registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp>;
  kyc_whitelists?: InputMaybe<Kyc_Whitelisted_Bool_Exp>;
  kyc_whitelists_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Bool_Exp>;
  marketplace_listings?: InputMaybe<Marketplace_Listing_Bool_Exp>;
  marketplace_listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Bool_Exp>;
  marketplace_offers?: InputMaybe<Marketplace_Offer_Bool_Exp>;
  marketplace_offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Bool_Exp>;
  super_admin_contract_admins?: InputMaybe<Super_Admin_Contract_Admin_Bool_Exp>;
  super_admin_contract_admins_aggregate?: InputMaybe<Super_Admin_Contract_Admin_Aggregate_Bool_Exp>;
  super_admin_general_admins?: InputMaybe<Super_Admin_General_Admin_Bool_Exp>;
  super_admin_general_admins_aggregate?: InputMaybe<Super_Admin_General_Admin_Aggregate_Bool_Exp>;
  super_admin_signatories?: InputMaybe<Super_Admin_Signatory_Bool_Exp>;
  super_admin_signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp>;
  token_transfer_receivers?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  token_transfer_receivers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
  token_transfer_senders?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  token_transfer_senders_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
};

/** Ordering options when selecting data from "equiteez_user". */
export type Equiteez_User_Order_By = {
  address?: InputMaybe<Order_By>;
  balances_aggregate?: InputMaybe<Equiteez_User_Balance_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_blacklists_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Order_By>;
  kyc_members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Order_By>;
  kyc_registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Order_By>;
  kyc_whitelists_aggregate?: InputMaybe<Kyc_Whitelisted_Aggregate_Order_By>;
  marketplace_listings_aggregate?: InputMaybe<Marketplace_Listing_Aggregate_Order_By>;
  marketplace_offers_aggregate?: InputMaybe<Marketplace_Offer_Aggregate_Order_By>;
  super_admin_contract_admins_aggregate?: InputMaybe<Super_Admin_Contract_Admin_Aggregate_Order_By>;
  super_admin_general_admins_aggregate?: InputMaybe<Super_Admin_General_Admin_Aggregate_Order_By>;
  super_admin_signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Order_By>;
  token_transfer_receivers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
  token_transfer_senders_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
};

/** select columns of table "equiteez_user" */
export enum Equiteez_User_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id'
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
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
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
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "equiteez_user_token_transfer". All fields are combined with a logical 'AND'. */
export type Equiteez_User_Token_Transfer_Bool_Exp = {
  _and?: InputMaybe<Array<Equiteez_User_Token_Transfer_Bool_Exp>>;
  _not?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  _or?: InputMaybe<Array<Equiteez_User_Token_Transfer_Bool_Exp>>;
  amount?: InputMaybe<Bigint_Comparison_Exp>;
  from_user?: InputMaybe<Equiteez_User_Bool_Exp>;
  from_user_id?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<Bigint_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamptz_Comparison_Exp>;
  to_user?: InputMaybe<Equiteez_User_Bool_Exp>;
  to_user_id?: InputMaybe<Int_Comparison_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
  transfer_type?: InputMaybe<Smallint_Comparison_Exp>;
};

/** order by max() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "equiteez_user_token_transfer". */
export type Equiteez_User_Token_Transfer_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user?: InputMaybe<Equiteez_User_Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  to_user?: InputMaybe<Equiteez_User_Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
  transfer_type?: InputMaybe<Order_By>;
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
  Timestamp = 'timestamp',
  /** column name */
  ToUserId = 'to_user_id',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TransferType = 'transfer_type'
}

/** order by stddev() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
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
  amount?: InputMaybe<Scalars['bigint']['input']>;
  from_user_id?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['bigint']['input']>;
  timestamp?: InputMaybe<Scalars['timestamptz']['input']>;
  to_user_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Scalars['smallint']['input']>;
};

/** order by sum() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "equiteez_user_token_transfer" */
export type Equiteez_User_Token_Transfer_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  from_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  to_user_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
  /** TRANSFER: 0\nMINT: 1\nBURN: 2 */
  transfer_type?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Min_Order_By = {
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Stddev_Samp_Order_By = {
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
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_blacklisted" */
export type Kyc_Blacklisted_Variance_Order_By = {
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
  entrypoint_status?: InputMaybe<Kyc_Entrypoint_Status_Bool_Exp>;
  entrypoint_status_aggregate?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lambdas?: InputMaybe<Kyc_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Kyc_Lambda_Aggregate_Bool_Exp>;
  members?: InputMaybe<Kyc_Member_Bool_Exp>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  orderbooks?: InputMaybe<Orderbook_Bool_Exp>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Bool_Exp>;
  registrars?: InputMaybe<Kyc_Registrar_Bool_Exp>;
  registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Bool_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "kyc_country_transfer_rule". All fields are combined with a logical 'AND'. */
export type Kyc_Country_Transfer_Rule_Bool_Exp = {
  _and?: InputMaybe<Array<Kyc_Country_Transfer_Rule_Bool_Exp>>;
  _not?: InputMaybe<Kyc_Country_Transfer_Rule_Bool_Exp>;
  _or?: InputMaybe<Array<Kyc_Country_Transfer_Rule_Bool_Exp>>;
  blacklist_countries?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  receiving_frozen?: InputMaybe<Boolean_Comparison_Exp>;
  sending_frozen?: InputMaybe<Boolean_Comparison_Exp>;
  whitelist_countries?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Max_Order_By = {
  blacklist_countries?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  whitelist_countries?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Min_Order_By = {
  blacklist_countries?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Stddev_Samp_Order_By = {
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
  blacklist_countries?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  receiving_frozen?: InputMaybe<Scalars['Boolean']['input']>;
  sending_frozen?: InputMaybe<Scalars['Boolean']['input']>;
  whitelist_countries?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_country_transfer_rule" */
export type Kyc_Country_Transfer_Rule_Variance_Order_By = {
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
};

/** order by max() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_entrypoint_status" */
export type Kyc_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_entrypoint_status". */
export type Kyc_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Kyc_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
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
  Paused = 'paused'
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
  region?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_member" */
export type Kyc_Member_Max_Order_By = {
  country?: InputMaybe<Order_By>;
  expire_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  investor_type?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_member" */
export type Kyc_Member_Min_Order_By = {
  country?: InputMaybe<Order_By>;
  expire_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  investor_type?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
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
  region?: InputMaybe<Order_By>;
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
  Region = 'region',
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

/** order by stddev() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_member" */
export type Kyc_Member_Stddev_Samp_Order_By = {
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
  country?: InputMaybe<Scalars['String']['input']>;
  expire_at?: InputMaybe<Scalars['timestamptz']['input']>;
  frozen?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  investor_type?: InputMaybe<Scalars['String']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  kyc_registrar_id?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_member" */
export type Kyc_Member_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_member" */
export type Kyc_Member_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_member" */
export type Kyc_Member_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_member" */
export type Kyc_Member_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  kyc_registrar_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc". */
export type Kyc_Order_By = {
  address?: InputMaybe<Order_By>;
  blacklisted_aggregate?: InputMaybe<Kyc_Blacklisted_Aggregate_Order_By>;
  country_transfer_rules_aggregate?: InputMaybe<Kyc_Country_Transfer_Rule_Aggregate_Order_By>;
  entrypoint_status_aggregate?: InputMaybe<Kyc_Entrypoint_Status_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Kyc_Lambda_Aggregate_Order_By>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orderbooks_aggregate?: InputMaybe<Orderbook_Aggregate_Order_By>;
  registrars_aggregate?: InputMaybe<Kyc_Registrar_Aggregate_Order_By>;
  super_admin?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
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
  kyc_admins?: InputMaybe<String_Comparison_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  member_verified?: InputMaybe<Bigint_Comparison_Exp>;
  members?: InputMaybe<Kyc_Member_Bool_Exp>;
  members_aggregate?: InputMaybe<Kyc_Member_Aggregate_Bool_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  set_member_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  unfreeze_member_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_admins?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_admins?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
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
  set_member_is_paused?: InputMaybe<Order_By>;
  unfreeze_member_is_paused?: InputMaybe<Order_By>;
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
  SetMemberIsPaused = 'set_member_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused',
  /** column name */
  UserId = 'user_id'
}

/** select "kyc_registrar_aggregate_bool_exp_bool_and_arguments_columns" columns of table "kyc_registrar" */
export enum Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  FreezeMemberIsPaused = 'freeze_member_is_paused',
  /** column name */
  SetMemberIsPaused = 'set_member_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused'
}

/** select "kyc_registrar_aggregate_bool_exp_bool_or_arguments_columns" columns of table "kyc_registrar" */
export enum Kyc_Registrar_Select_Column_Kyc_Registrar_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  FreezeMemberIsPaused = 'freeze_member_is_paused',
  /** column name */
  SetMemberIsPaused = 'set_member_is_paused',
  /** column name */
  UnfreezeMemberIsPaused = 'unfreeze_member_is_paused'
}

/** order by stddev() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
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
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  freeze_member_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_admins?: InputMaybe<Scalars['String']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  member_verified?: InputMaybe<Scalars['bigint']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  set_member_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  unfreeze_member_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_registrar" */
export type Kyc_Registrar_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  member_verified?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "kyc" */
export enum Kyc_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NewSuperAdmin = 'new_super_admin',
  /** column name */
  SuperAdmin = 'super_admin'
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
  id?: InputMaybe<Scalars['Int']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  super_admin?: InputMaybe<Scalars['String']['input']>;
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
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
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
  valid_inputs?: InputMaybe<String_Comparison_Exp>;
};

/** order by max() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Max_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  valid_inputs?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Min_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  valid_inputs?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "kyc_valid_input". */
export type Kyc_Valid_Input_Order_By = {
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
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
  ValidInputs = 'valid_inputs'
}

/** order by stddev() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Pop_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Stddev_Samp_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
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
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Scalars['smallint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  valid_inputs?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Sum_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Var_Pop_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Var_Samp_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_valid_input" */
export type Kyc_Valid_Input_Variance_Order_By = {
  /** COUNTRY: 0\nREGION: 1\nINVESTOR_TYPE: 2 */
  category?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Min_Order_By = {
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
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Stddev_Samp_Order_By = {
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
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "kyc_whitelisted" */
export type Kyc_Whitelisted_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "marketplace". All fields are combined with a logical 'AND'. */
export type Marketplace_Bool_Exp = {
  _and?: InputMaybe<Array<Marketplace_Bool_Exp>>;
  _not?: InputMaybe<Marketplace_Bool_Exp>;
  _or?: InputMaybe<Array<Marketplace_Bool_Exp>>;
  accept_offer_is_paused?: InputMaybe<Boolean_Comparison_Exp>;
  address?: InputMaybe<String_Comparison_Exp>;
  admins?: InputMaybe<String_Comparison_Exp>;
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
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Min_Order_By = {
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
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Stddev_Samp_Order_By = {
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
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_currency" */
export type Marketplace_Currency_Variance_Order_By = {
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
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Min_Order_By = {
  address?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Stddev_Samp_Order_By = {
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
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_general_contract" */
export type Marketplace_General_Contract_Variance_Order_By = {
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
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
  amount?: InputMaybe<Scalars['float8']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  expiry_time?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  listing_id?: InputMaybe<Scalars['bigint']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  price_per_unit?: InputMaybe<Scalars['bigint']['input']>;
  quick_buy_price?: InputMaybe<Scalars['bigint']['input']>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Scalars['smallint']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
  status?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_listing" */
export type Marketplace_Listing_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  price_per_unit?: InputMaybe<Order_By>;
  quick_buy_price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nACTIVE: 1 */
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  expiry_time?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
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
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
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
  amount?: InputMaybe<Scalars['float8']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  expiry_time?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  listing_id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
  offer_id?: InputMaybe<Scalars['bigint']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Scalars['smallint']['input']>;
};

/** order by sum() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
  status?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_offer" */
export type Marketplace_Offer_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  listing_id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
  offer_id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  /** CLOSED: 0\nOPEN: 1\nACCEPTED: 2 */
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
  accept_offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  admins?: InputMaybe<Scalars['String']['input']>;
  create_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  edit_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_fee?: InputMaybe<Scalars['bigint']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  min_offer_amount?: InputMaybe<Scalars['bigint']['input']>;
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  next_listing_id?: InputMaybe<Scalars['bigint']['input']>;
  next_offer_id?: InputMaybe<Scalars['bigint']['input']>;
  offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  purchase_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  remove_listing_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  remove_offer_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  royalty?: InputMaybe<Scalars['bigint']['input']>;
  set_currency_is_paused?: InputMaybe<Scalars['Boolean']['input']>;
  standard_unit?: InputMaybe<Scalars['bigint']['input']>;
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
  address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Min_Order_By = {
  address?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Stddev_Samp_Order_By = {
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
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  marketplace_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  marketplace_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "marketplace_whitelist_contract" */
export type Marketplace_Whitelist_Contract_Variance_Order_By = {
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
  count?: InputMaybe<Orderbook_Aggregate_Bool_Exp_Count>;
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
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
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
  highest_buy_price_order_id?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  kyc?: InputMaybe<Kyc_Bool_Exp>;
  kyc_id?: InputMaybe<Int_Comparison_Exp>;
  lambdas?: InputMaybe<Orderbook_Lambda_Bool_Exp>;
  lambdas_aggregate?: InputMaybe<Orderbook_Lambda_Aggregate_Bool_Exp>;
  last_matched_price?: InputMaybe<Bigint_Comparison_Exp>;
  last_matched_price_timestamp?: InputMaybe<Timetz_Comparison_Exp>;
  lowest_sell_price?: InputMaybe<Bigint_Comparison_Exp>;
  lowest_sell_price_order_id?: InputMaybe<Bigint_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  min_buy_order_amount?: InputMaybe<Bigint_Comparison_Exp>;
  min_buy_order_value?: InputMaybe<Bigint_Comparison_Exp>;
  min_expiry_time?: InputMaybe<Bigint_Comparison_Exp>;
  min_sell_order_amount?: InputMaybe<Bigint_Comparison_Exp>;
  min_sell_order_value?: InputMaybe<Bigint_Comparison_Exp>;
  min_time_before_closing_order?: InputMaybe<Bigint_Comparison_Exp>;
  new_super_admin?: InputMaybe<String_Comparison_Exp>;
  orders?: InputMaybe<Orderbook_Order_Bool_Exp>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp>;
  rwa_orders?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Bool_Exp>;
  rwa_token?: InputMaybe<Token_Bool_Exp>;
  rwa_token_id?: InputMaybe<Int_Comparison_Exp>;
  sell_order_counter?: InputMaybe<Bigint_Comparison_Exp>;
  sell_order_fee?: InputMaybe<Bigint_Comparison_Exp>;
  super_admin?: InputMaybe<String_Comparison_Exp>;
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
  orderbook?: InputMaybe<Orderbook_Bool_Exp>;
  orderbook_id?: InputMaybe<Int_Comparison_Exp>;
  orders?: InputMaybe<Orderbook_Order_Bool_Exp>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Bool_Exp>;
  token?: InputMaybe<Token_Bool_Exp>;
  token_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Max_Order_By = {
  currency_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Min_Order_By = {
  currency_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_currency". */
export type Orderbook_Currency_Order_By = {
  currency_name?: InputMaybe<Order_By>;
  fees_aggregate?: InputMaybe<Orderbook_Fee_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook?: InputMaybe<Orderbook_Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Order_By>;
  token?: InputMaybe<Token_Order_By>;
  token_id?: InputMaybe<Order_By>;
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
  TokenId = 'token_id'
}

/** order by stddev() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Stddev_Samp_Order_By = {
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
  currency_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_currency" */
export type Orderbook_Currency_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  token_id?: InputMaybe<Order_By>;
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
};

/** order by max() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Max_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_entrypoint_status" */
export type Orderbook_Entrypoint_Status_Min_Order_By = {
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_entrypoint_status". */
export type Orderbook_Entrypoint_Status_Order_By = {
  contract?: InputMaybe<Orderbook_Order_By>;
  contract_id?: InputMaybe<Order_By>;
  entrypoint?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  paused?: InputMaybe<Order_By>;
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
  Paused = 'paused'
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
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
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
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Min_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
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
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Stddev_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Stddev_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
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
  fee_amount?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  paid_fee?: InputMaybe<Scalars['bigint']['input']>;
  related_token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Sum_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Var_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Var_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  paid_fee?: InputMaybe<Order_By>;
  related_token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_fee" */
export type Orderbook_Fee_Variance_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fee_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
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
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook" */
export type Orderbook_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
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
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
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
  fulfilled_amount?: InputMaybe<Bigint_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  initiator?: InputMaybe<String_Comparison_Exp>;
  is_canceled?: InputMaybe<Boolean_Comparison_Exp>;
  is_expired?: InputMaybe<Boolean_Comparison_Exp>;
  is_fulfilled?: InputMaybe<Boolean_Comparison_Exp>;
  is_refunded?: InputMaybe<Boolean_Comparison_Exp>;
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
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc?: InputMaybe<Kyc_Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Orderbook_Lambda_Aggregate_Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  last_matched_price_timestamp?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  new_super_admin?: InputMaybe<Order_By>;
  orders_aggregate?: InputMaybe<Orderbook_Order_Aggregate_Order_By>;
  rwa_orders_aggregate?: InputMaybe<Orderbook_Rwa_Order_Aggregate_Order_By>;
  rwa_token?: InputMaybe<Token_Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "orderbook_order" */
export type Orderbook_Order_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Order_By>;
  order_expiry?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_order" */
export type Orderbook_Order_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency_id?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Order_By>;
  order_expiry?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_order". */
export type Orderbook_Order_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Orderbook_Currency_Order_By>;
  currency_id?: InputMaybe<Order_By>;
  ended_at?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator?: InputMaybe<Order_By>;
  is_canceled?: InputMaybe<Order_By>;
  is_expired?: InputMaybe<Order_By>;
  is_fulfilled?: InputMaybe<Order_By>;
  is_refunded?: InputMaybe<Order_By>;
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
  Initiator = 'initiator',
  /** column name */
  IsCanceled = 'is_canceled',
  /** column name */
  IsExpired = 'is_expired',
  /** column name */
  IsFulfilled = 'is_fulfilled',
  /** column name */
  IsRefunded = 'is_refunded',
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
  UnfulfilledAmount = 'unfulfilled_amount'
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
  IsRefunded = 'is_refunded'
}

/** order by stddev() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_order" */
export type Orderbook_Order_Stddev_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
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
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency_id?: InputMaybe<Scalars['Int']['input']>;
  ended_at?: InputMaybe<Scalars['timestamptz']['input']>;
  fulfilled_amount?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator?: InputMaybe<Scalars['String']['input']>;
  is_canceled?: InputMaybe<Scalars['Boolean']['input']>;
  is_expired?: InputMaybe<Scalars['Boolean']['input']>;
  is_fulfilled?: InputMaybe<Scalars['Boolean']['input']>;
  is_refunded?: InputMaybe<Scalars['Boolean']['input']>;
  order_expiry?: InputMaybe<Scalars['timestamptz']['input']>;
  order_id?: InputMaybe<Scalars['bigint']['input']>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Scalars['smallint']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  price_per_rwa_token?: InputMaybe<Scalars['bigint']['input']>;
  refunded_amount?: InputMaybe<Scalars['bigint']['input']>;
  rwa_token_amount?: InputMaybe<Scalars['bigint']['input']>;
  total_paid_out?: InputMaybe<Scalars['bigint']['input']>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Scalars['bigint']['input']>;
  unfulfilled_amount?: InputMaybe<Scalars['bigint']['input']>;
};

/** order by sum() on columns of table "orderbook_order" */
export type Orderbook_Order_Sum_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_order" */
export type Orderbook_Order_Var_Pop_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_order" */
export type Orderbook_Order_Var_Samp_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
  unfulfilled_amount?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_order" */
export type Orderbook_Order_Variance_Order_By = {
  currency_id?: InputMaybe<Order_By>;
  fulfilled_amount?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  /** BUY: 0\nSELL: 1 */
  order_type?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  price_per_rwa_token?: InputMaybe<Order_By>;
  refunded_amount?: InputMaybe<Order_By>;
  rwa_token_amount?: InputMaybe<Order_By>;
  total_paid_out?: InputMaybe<Order_By>;
  total_usd_value_of_rwa_token_amount?: InputMaybe<Order_By>;
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
  order_ids?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_buy_order" */
export type Orderbook_Rwa_Order_Buy_Order_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_buy_order". */
export type Orderbook_Rwa_Order_Buy_Order_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
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
  RwaOrderId = 'rwa_order_id'
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
  order_ids?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
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
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
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
};

/** order by max() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Max_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Min_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_buy_price". */
export type Orderbook_Rwa_Order_Buy_Price_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
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
  RwaOrderId = 'rwa_order_id'
}

/** order by stddev() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Pop_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Stddev_Samp_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
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
  counter?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Sum_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Var_Pop_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Var_Samp_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_buy_price" */
export type Orderbook_Rwa_Order_Buy_Price_Variance_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
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
};

/** select columns of table "orderbook_rwa_order" */
export enum Orderbook_Rwa_Order_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  OrderbookId = 'orderbook_id',
  /** column name */
  RwaTokenId = 'rwa_token_id'
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
  order_ids?: InputMaybe<String_Comparison_Exp>;
  price?: InputMaybe<Bigint_Comparison_Exp>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Bool_Exp>;
  rwa_order_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_sell_order" */
export type Orderbook_Rwa_Order_Sell_Order_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_sell_order". */
export type Orderbook_Rwa_Order_Sell_Order_Order_By = {
  id?: InputMaybe<Order_By>;
  order_ids?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
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
  RwaOrderId = 'rwa_order_id'
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
  order_ids?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
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
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
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
};

/** order by max() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Max_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Min_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "orderbook_rwa_order_sell_price". */
export type Orderbook_Rwa_Order_Sell_Price_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order?: InputMaybe<Orderbook_Rwa_Order_Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
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
  RwaOrderId = 'rwa_order_id'
}

/** order by stddev() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Pop_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Stddev_Samp_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
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
  counter?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['bigint']['input']>;
  rwa_order_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Sum_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Var_Pop_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Var_Samp_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order_sell_price" */
export type Orderbook_Rwa_Order_Sell_Price_Variance_Order_By = {
  counter?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  rwa_order_id?: InputMaybe<Order_By>;
};

/** order by stddev() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Stddev_Samp_Order_By = {
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
  id?: InputMaybe<Scalars['Int']['input']>;
  orderbook_id?: InputMaybe<Scalars['Int']['input']>;
  rwa_token_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  orderbook_id?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook_rwa_order" */
export type Orderbook_Rwa_Order_Variance_Order_By = {
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
  HighestBuyPriceOrderId = 'highest_buy_price_order_id',
  /** column name */
  Id = 'id',
  /** column name */
  KycId = 'kyc_id',
  /** column name */
  LastMatchedPrice = 'last_matched_price',
  /** column name */
  LastMatchedPriceTimestamp = 'last_matched_price_timestamp',
  /** column name */
  LowestSellPrice = 'lowest_sell_price',
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
  SuperAdmin = 'super_admin'
}

/** order by stddev() on columns of table "orderbook" */
export type Orderbook_Stddev_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "orderbook" */
export type Orderbook_Stddev_Pop_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "orderbook" */
export type Orderbook_Stddev_Samp_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
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
  buy_order_counter?: InputMaybe<Scalars['bigint']['input']>;
  buy_order_fee?: InputMaybe<Scalars['bigint']['input']>;
  highest_buy_price?: InputMaybe<Scalars['bigint']['input']>;
  highest_buy_price_order_id?: InputMaybe<Scalars['bigint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  kyc_id?: InputMaybe<Scalars['Int']['input']>;
  last_matched_price?: InputMaybe<Scalars['bigint']['input']>;
  last_matched_price_timestamp?: InputMaybe<Scalars['timetz']['input']>;
  lowest_sell_price?: InputMaybe<Scalars['bigint']['input']>;
  lowest_sell_price_order_id?: InputMaybe<Scalars['bigint']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  min_buy_order_amount?: InputMaybe<Scalars['bigint']['input']>;
  min_buy_order_value?: InputMaybe<Scalars['bigint']['input']>;
  min_expiry_time?: InputMaybe<Scalars['bigint']['input']>;
  min_sell_order_amount?: InputMaybe<Scalars['bigint']['input']>;
  min_sell_order_value?: InputMaybe<Scalars['bigint']['input']>;
  min_time_before_closing_order?: InputMaybe<Scalars['bigint']['input']>;
  new_super_admin?: InputMaybe<Scalars['String']['input']>;
  rwa_token_id?: InputMaybe<Scalars['Int']['input']>;
  sell_order_counter?: InputMaybe<Scalars['bigint']['input']>;
  sell_order_fee?: InputMaybe<Scalars['bigint']['input']>;
  super_admin?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "orderbook" */
export type Orderbook_Sum_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "orderbook" */
export type Orderbook_Var_Pop_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "orderbook" */
export type Orderbook_Var_Samp_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "orderbook" */
export type Orderbook_Variance_Order_By = {
  buy_order_counter?: InputMaybe<Order_By>;
  buy_order_fee?: InputMaybe<Order_By>;
  highest_buy_price?: InputMaybe<Order_By>;
  highest_buy_price_order_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  kyc_id?: InputMaybe<Order_By>;
  last_matched_price?: InputMaybe<Order_By>;
  lowest_sell_price?: InputMaybe<Order_By>;
  lowest_sell_price_order_id?: InputMaybe<Order_By>;
  min_buy_order_amount?: InputMaybe<Order_By>;
  min_buy_order_value?: InputMaybe<Order_By>;
  min_expiry_time?: InputMaybe<Order_By>;
  min_sell_order_amount?: InputMaybe<Order_By>;
  min_sell_order_value?: InputMaybe<Order_By>;
  min_time_before_closing_order?: InputMaybe<Order_By>;
  rwa_token_id?: InputMaybe<Order_By>;
  sell_order_counter?: InputMaybe<Order_By>;
  sell_order_fee?: InputMaybe<Order_By>;
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
  contract_admins?: InputMaybe<Super_Admin_Contract_Admin_Bool_Exp>;
  contract_admins_aggregate?: InputMaybe<Super_Admin_Contract_Admin_Aggregate_Bool_Exp>;
  general_admins?: InputMaybe<Super_Admin_General_Admin_Bool_Exp>;
  general_admins_aggregate?: InputMaybe<Super_Admin_General_Admin_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
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
};

export type Super_Admin_Contract_Admin_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_Contract_Admin_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_Contract_Admin_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_Contract_Admin_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_Contract_Admin_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_Contract_Admin_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_Contract_Admin_Max_Order_By>;
  min?: InputMaybe<Super_Admin_Contract_Admin_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_Contract_Admin_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_Contract_Admin_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_Contract_Admin_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_Contract_Admin_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_Contract_Admin_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_Contract_Admin_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_Contract_Admin_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_contract_admin". All fields are combined with a logical 'AND'. */
export type Super_Admin_Contract_Admin_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_Contract_Admin_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_Contract_Admin_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_Contract_Admin_Bool_Exp>>;
  contract_address?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Max_Order_By = {
  contract_address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Min_Order_By = {
  contract_address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_contract_admin". */
export type Super_Admin_Contract_Admin_Order_By = {
  contract_address?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_contract_admin" */
export enum Super_Admin_Contract_Admin_Select_Column {
  /** column name */
  ContractAddress = 'contract_address',
  /** column name */
  Id = 'id',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_Contract_Admin_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_Contract_Admin_Stream_Cursor_Value_Input = {
  contract_address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_contract_admin" */
export type Super_Admin_Contract_Admin_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Super_Admin_General_Admin_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_General_Admin_Aggregate_Bool_Exp_Count>;
};

export type Super_Admin_General_Admin_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Super_Admin_General_Admin_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Super_Admin_General_Admin_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** order by aggregate values of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Aggregate_Order_By = {
  avg?: InputMaybe<Super_Admin_General_Admin_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Super_Admin_General_Admin_Max_Order_By>;
  min?: InputMaybe<Super_Admin_General_Admin_Min_Order_By>;
  stddev?: InputMaybe<Super_Admin_General_Admin_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Super_Admin_General_Admin_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Super_Admin_General_Admin_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Super_Admin_General_Admin_Sum_Order_By>;
  var_pop?: InputMaybe<Super_Admin_General_Admin_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Super_Admin_General_Admin_Var_Samp_Order_By>;
  variance?: InputMaybe<Super_Admin_General_Admin_Variance_Order_By>;
};

/** order by avg() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "super_admin_general_admin". All fields are combined with a logical 'AND'. */
export type Super_Admin_General_Admin_Bool_Exp = {
  _and?: InputMaybe<Array<Super_Admin_General_Admin_Bool_Exp>>;
  _not?: InputMaybe<Super_Admin_General_Admin_Bool_Exp>;
  _or?: InputMaybe<Array<Super_Admin_General_Admin_Bool_Exp>>;
  id?: InputMaybe<Int_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_general_admin". */
export type Super_Admin_General_Admin_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_general_admin" */
export enum Super_Admin_General_Admin_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Super_Admin_General_Admin_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Super_Admin_General_Admin_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_general_admin" */
export type Super_Admin_General_Admin_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  contract_admins_aggregate?: InputMaybe<Super_Admin_Contract_Admin_Aggregate_Order_By>;
  general_admins_aggregate?: InputMaybe<Super_Admin_General_Admin_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  lambdas_aggregate?: InputMaybe<Super_Admin_Lambda_Aggregate_Order_By>;
  metadata?: InputMaybe<Order_By>;
  signatories_aggregate?: InputMaybe<Super_Admin_Signatory_Aggregate_Order_By>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Order_By>;
  signatory_size?: InputMaybe<Order_By>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  threshold?: InputMaybe<Order_By>;
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
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  SignatorySize = 'signatory_size',
  /** column name */
  Threshold = 'threshold'
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
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
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
  signatures?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp>;
  signers_count?: InputMaybe<Bigint_Comparison_Exp>;
  start_datetime?: InputMaybe<Timestamptz_Comparison_Exp>;
  start_level?: InputMaybe<Bigint_Comparison_Exp>;
  status?: InputMaybe<Smallint_Comparison_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
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
};

/** order by max() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Max_Order_By = {
  action_id?: InputMaybe<Order_By>;
  bytes?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Min_Order_By = {
  action_id?: InputMaybe<Order_By>;
  bytes?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signatory_action_data". */
export type Super_Admin_Signatory_Action_Data_Order_By = {
  action?: InputMaybe<Super_Admin_Signatory_Action_Order_By>;
  action_id?: InputMaybe<Order_By>;
  bytes?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
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
  Name = 'name'
}

/** order by stddev() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Stddev_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
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
  bytes?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Sum_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Var_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Var_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory_action_data" */
export type Super_Admin_Signatory_Action_Data_Variance_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by max() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Max_Order_By = {
  action_id?: InputMaybe<Order_By>;
  action_type?: InputMaybe<Order_By>;
  executed_datetime?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  expiration_datetime?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_datetime?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Min_Order_By = {
  action_id?: InputMaybe<Order_By>;
  action_type?: InputMaybe<Order_By>;
  executed_datetime?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  expiration_datetime?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_datetime?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
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
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_datetime?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
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
  SignersCount = 'signers_count',
  /** column name */
  StartDatetime = 'start_datetime',
  /** column name */
  StartLevel = 'start_level',
  /** column name */
  Status = 'status',
  /** column name */
  SuperAdminId = 'super_admin_id'
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
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stddev_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Stddev_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
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
  action_id?: InputMaybe<Scalars['bigint']['input']>;
  action_type?: InputMaybe<Scalars['String']['input']>;
  executed?: InputMaybe<Scalars['Boolean']['input']>;
  executed_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  executed_level?: InputMaybe<Scalars['bigint']['input']>;
  expiration_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  initiator_id?: InputMaybe<Scalars['Int']['input']>;
  signers_count?: InputMaybe<Scalars['bigint']['input']>;
  start_datetime?: InputMaybe<Scalars['timestamptz']['input']>;
  start_level?: InputMaybe<Scalars['bigint']['input']>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Scalars['smallint']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Sum_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Var_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Var_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory_action" */
export type Super_Admin_Signatory_Action_Variance_Order_By = {
  action_id?: InputMaybe<Order_By>;
  executed_level?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_id?: InputMaybe<Order_By>;
  signers_count?: InputMaybe<Order_By>;
  start_level?: InputMaybe<Order_By>;
  /** FLUSHED: 0\nEXECUTED: 1\nPENDING: 2 */
  status?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

export type Super_Admin_Signatory_Aggregate_Bool_Exp = {
  count?: InputMaybe<Super_Admin_Signatory_Aggregate_Bool_Exp_Count>;
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
  signatory_actions?: InputMaybe<Super_Admin_Signatory_Action_Bool_Exp>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Bool_Exp>;
  signatures?: InputMaybe<Super_Admin_Signature_Bool_Exp>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Bool_Exp>;
  super_admin?: InputMaybe<Super_Admin_Bool_Exp>;
  super_admin_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Equiteez_User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** order by max() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "super_admin_signatory". */
export type Super_Admin_Signatory_Order_By = {
  id?: InputMaybe<Order_By>;
  signatory_actions_aggregate?: InputMaybe<Super_Admin_Signatory_Action_Aggregate_Order_By>;
  signatures_aggregate?: InputMaybe<Super_Admin_Signature_Aggregate_Order_By>;
  super_admin?: InputMaybe<Super_Admin_Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Equiteez_User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "super_admin_signatory" */
export enum Super_Admin_Signatory_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  SuperAdminId = 'super_admin_id',
  /** column name */
  UserId = 'user_id'
}

/** order by stddev() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Stddev_Samp_Order_By = {
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
  id?: InputMaybe<Scalars['Int']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signatory" */
export type Super_Admin_Signatory_Variance_Order_By = {
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
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Min_Order_By = {
  action_id?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Stddev_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Stddev_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
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
  id?: InputMaybe<Scalars['Int']['input']>;
  signatory_id?: InputMaybe<Scalars['Int']['input']>;
  super_admin_id?: InputMaybe<Scalars['Int']['input']>;
};

/** order by sum() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Sum_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_pop() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Var_Pop_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Var_Samp_Order_By = {
  action_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  signatory_id?: InputMaybe<Order_By>;
  super_admin_id?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "super_admin_signature" */
export type Super_Admin_Signature_Variance_Order_By = {
  action_id?: InputMaybe<Order_By>;
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
  action_counter?: InputMaybe<Scalars['bigint']['input']>;
  action_expiry_in_seconds?: InputMaybe<Scalars['bigint']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  signatory_size?: InputMaybe<Scalars['bigint']['input']>;
  threshold?: InputMaybe<Scalars['bigint']['input']>;
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

/** Boolean expression to compare columns of type "timetz". All fields are combined with logical 'AND'. */
export type Timetz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timetz']['input']>;
  _gt?: InputMaybe<Scalars['timetz']['input']>;
  _gte?: InputMaybe<Scalars['timetz']['input']>;
  _in?: InputMaybe<Array<Scalars['timetz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timetz']['input']>;
  _lte?: InputMaybe<Scalars['timetz']['input']>;
  _neq?: InputMaybe<Scalars['timetz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timetz']['input']>>;
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
  equiteez_user_balances?: InputMaybe<Equiteez_User_Balance_Bool_Exp>;
  equiteez_user_balances_aggregate?: InputMaybe<Equiteez_User_Balance_Aggregate_Bool_Exp>;
  equiteez_user_token_transfers?: InputMaybe<Equiteez_User_Token_Transfer_Bool_Exp>;
  equiteez_user_token_transfers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
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
};

/** Ordering options when selecting data from "token". */
export type Token_Order_By = {
  address?: InputMaybe<Order_By>;
  dodo_mav_base_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_base_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_quote_lp_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  dodo_mav_quote_tokens_aggregate?: InputMaybe<Dodo_Mav_Aggregate_Order_By>;
  equiteez_user_balances_aggregate?: InputMaybe<Equiteez_User_Balance_Aggregate_Order_By>;
  equiteez_user_token_transfers_aggregate?: InputMaybe<Equiteez_User_Token_Transfer_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
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
};

/** select columns of table "token" */
export enum Token_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  TokenId = 'token_id',
  /** column name */
  TokenMetadata = 'token_metadata',
  /** column name */
  TokenStandard = 'token_standard'
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
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  token_id?: InputMaybe<Scalars['smallint']['input']>;
  token_metadata?: InputMaybe<Scalars['jsonb']['input']>;
  /** FA12: 0\nFA2: 1\nMAV: 2 */
  token_standard?: InputMaybe<Scalars['smallint']['input']>;
};

export type DipDupHeadLvlQueryVariables = Exact<{ [key: string]: never; }>;


export type DipDupHeadLvlQuery = { __typename?: 'query_root', dipdup_head: Array<{ __typename?: 'dipdup_head', level: number }> };

export type DexesQueryVariables = Exact<{ [key: string]: never; }>;


export type DexesQuery = { __typename?: 'query_root', orderbook: Array<{ __typename?: 'orderbook', address: string, metadata?: any | null }>, dodo_mav: Array<{ __typename?: 'dodo_mav', address: string, metadata?: any | null }>, marketplace: Array<{ __typename?: 'marketplace', address: string, metadata?: any | null }> };

export type MarketTokenAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type MarketTokenAddressesQuery = { __typename?: 'query_root', dodo_mav: Array<{ __typename?: 'dodo_mav', base_token: { __typename?: 'token', address: string } }>, orderbook: Array<{ __typename?: 'orderbook', rwa_token?: { __typename?: 'token', address: string } | null }> };

export type MarketTokensQueryVariables = Exact<{
  addresses?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type MarketTokensQuery = { __typename?: 'query_root', token: Array<{ __typename?: 'token', address: string, token_id: any, token_standard?: any | null, token_metadata?: any | null, metadata?: any | null }> };


export const DipDupHeadLvlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DipDupHeadLvl"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dipdup_head"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}}]}}]}}]} as unknown as DocumentNode<DipDupHeadLvlQuery, DipDupHeadLvlQueryVariables>;
export const DexesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dexes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderbook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dodo_mav"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"Field","name":{"kind":"Name","value":"marketplace"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}}]}}]} as unknown as DocumentNode<DexesQuery, DexesQueryVariables>;
export const MarketTokenAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketTokenAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dodo_mav"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"base_token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orderbook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rwa_token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]} as unknown as DocumentNode<MarketTokenAddressesQuery, MarketTokenAddressesQueryVariables>;
export const MarketTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarketTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"addresses"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"address"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"_in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"addresses"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"token_id"}},{"kind":"Field","name":{"kind":"Name","value":"token_standard"}},{"kind":"Field","name":{"kind":"Name","value":"token_metadata"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}}]}}]} as unknown as DocumentNode<MarketTokensQuery, MarketTokensQueryVariables>;