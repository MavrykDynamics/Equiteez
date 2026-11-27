/**
 * KYC status of the signed-in wallet, read from the same indexer query the
 * user provider keeps fresh (its refetches update this through the cache).
 */
import { useQuery } from "@apollo/client/index";

import {
  getIsKycedForAddress,
  getKycDatesForAddress,
} from "~/providers/UserProvider/helpers/userStatus.helpers";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
import { useUserContext } from "~/providers/UserProvider/user.provider";

export type KycStatus = {
  /** false until the indexer answered: show neither verified nor not */
  isLoaded: boolean;
  /** The indexer could not be read: the status is unknown */
  hasError: boolean;
  isKyced: boolean;
  verifiedAt: string | null;
  expiresAt: string | null;
};

export function useKycStatus(): KycStatus {
  const { userAddress } = useUserContext();
  const { data, error } = useQuery(USER_ACCOUNT_STATUS_QUERY, {
    variables: { address: userAddress ?? "" },
    skip: !userAddress,
    fetchPolicy: "cache-first",
  });

  return {
    isLoaded: Boolean(userAddress && data),
    hasError: Boolean(userAddress && !data && error),
    isKyced: getIsKycedForAddress(data, userAddress),
    ...getKycDatesForAddress(data, userAddress),
  };
}
