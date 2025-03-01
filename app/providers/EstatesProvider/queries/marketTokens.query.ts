import { gql } from "~/utils/__generated__";

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

// NEW ************************************************************

export const MARKETS_ADDRESSES_QUERY = gql(`
    query marketAddressesQuery {
  dodo_mav {
    address
    base_token {
      token_id
      address
    }
    quote_token {
      token_id
      address
    }
    quote_lp_token {
      address
      token_id
    }
    base_lp_token {
      address
      token_id
    }
  }
  orderbook {
    address
  }
}
`);
