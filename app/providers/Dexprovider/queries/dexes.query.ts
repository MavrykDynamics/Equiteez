import { gql } from "~/utils/__generated__";

export const DEXES_QUERY = gql(`
  query Dexes {
    orderbook {
      address
      metadata
    }
    dodo_mav {
      address
      metadata
    }
    marketplace {
      address
      metadata
    }
  }
`);
