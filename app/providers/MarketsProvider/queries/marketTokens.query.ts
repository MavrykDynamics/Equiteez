import { gql } from "~/utils/__generated__";

export const DODO_MAV_ASSET_METADATA_QUERY =
  gql(`query dodoMAvAssetMetadata($addresses: [String!]) {
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
// TODO move orderbook table into separate query when it will be in use
export const MARKETS_ADDRESSES_QUERY = gql(`
  query marketAddresses($limit: Int, $offset: Int) {
    dodo_mav(limit: $limit, offset: $offset) {
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
      rwa_token {
        address
      }
    }
  }
`);
