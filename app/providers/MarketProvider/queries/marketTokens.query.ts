import { gql } from "~/utils/__generated__";

export const MARKET_TOKENS_QUERY = gql(`query MarketTokens {
    token(where: {address: {_in: ["KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh"]}}) {
      address
      token_id
      token_standard
      token_metadata
      metadata
    }
  }
  `);
