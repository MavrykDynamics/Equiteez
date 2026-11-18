import type { UserAccountStatusQuery } from "~/utils/__generated__/graphql";

type UserAccountStatusData = Pick<UserAccountStatusQuery, "kyc_member">;

const getUserForAddress = (
  data: UserAccountStatusData | undefined,
  address: string | null
) => {
  if (!data || !address) return undefined;

  return data.kyc_member.find((member) => member.user?.address === address)
    ?.user;
};

export const getIsKycedForAddress = (
  data: UserAccountStatusData | undefined,
  address: string | null
): boolean => {
  return Boolean(getUserForAddress(data, address));
};

/** When the address became a KYC member and when that expires, if known. */
export const getKycDatesForAddress = (
  data: UserAccountStatusData | undefined,
  address: string | null
): { verifiedAt: string | null; expiresAt: string | null } => {
  const member =
    data && address
      ? data.kyc_member.find((item) => item.user?.address === address)
      : undefined;

  return {
    verifiedAt: (member?.updated_at as string | null | undefined) ?? null,
    expiresAt: (member?.expire_at as string | null | undefined) ?? null,
  };
};

export const getHasOrdersForAddress = (
  data: UserAccountStatusData | undefined,
  address: string | null
): boolean => {
  const user = getUserForAddress(data, address);

  return (user?.orderbook_order_events?.length ?? 0) > 0;
};
