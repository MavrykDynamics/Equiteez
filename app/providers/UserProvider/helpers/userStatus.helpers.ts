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

export const getHasOrdersForAddress = (
  data: UserAccountStatusData | undefined,
  address: string | null
): boolean => {
  const user = getUserForAddress(data, address);

  return (user?.orderbook_order_events?.length ?? 0) > 0;
};
