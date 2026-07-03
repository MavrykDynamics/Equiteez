import { gql } from "~/utils/__generated__";

export const USER_KYC_STATUS_QUERY = gql(`
  query UserKycStatus($address: String!) {
   kyc_member(where: {user: {address: {_eq: $address}}}) {
    user {
      address
    }
  }
}

  `);
