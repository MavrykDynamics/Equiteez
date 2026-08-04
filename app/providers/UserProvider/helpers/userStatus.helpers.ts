type UserKycStatusData = {
  kyc_member: Array<{
    user?: {
      address: string;
    } | null;
  }>;
};

export const getIsKycedForAddress = (
  data: UserKycStatusData | undefined,
  address: string | null
): boolean => {
  if (!data || !address) return false;

  return data.kyc_member.some((member) => member.user?.address === address);
};
