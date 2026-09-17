import { gql } from "~/utils/__generated__";

export const USER_ACCOUNT_STATUS_QUERY = gql(`
  query UserAccountStatus($address: String!) {
    kyc_member(where: { user: { address: { _eq: $address } } }) {
      user {
        address
        orderbook_order_events(limit: 1) {
          counter
        }
      }
    }
  }
`);
