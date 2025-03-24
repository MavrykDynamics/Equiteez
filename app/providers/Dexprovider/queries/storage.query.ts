import { gql } from "~/utils/__generated__";

export const DEX_STORAGE_QUERY = gql(`
    query DexStorage {
 dodo_mav {
    address
    fee_decimals
    guide_price
    slippage_factor
    fixed_price_percent
    base_balance
    quote_balance
    target_base_token_amount
    target_quote_token_amount
    base_balance_limit
    quote_balance_limit
    metadata
    r_status
    price_model
    maintainer_fee
    lp_fee
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
    base_token {
      token_id
      address
    }
  }
}
`);
