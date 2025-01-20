import { gql } from "~/utils/__generated__";

export const MARKET_TOKENS_QUERY = gql(`query MarketTokenAddresses {
  dodo_mav {
    base_token {
      address
    }
  }
  orderbook {
    rwa_token {
      address
    }
  }
}

  `);

export const MARKET_TOKENS__DATA_QUERY =
  gql(`query MarketTokens($addresses: [String!]) {
    token(where: {address: {_in: $addresses}}) {
      address
      token_id
      token_standard
      token_metadata
      metadata
    }
  }
  `);
