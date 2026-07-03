import { useEffect, useState } from "react";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { fetchUserBalanceDetails } from "~/lib/apis/mbrwa/user";
import { unknownToError } from "~/errors/error";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { UserBalanceType } from "./balance.types";
import { useQuery } from "@tanstack/react-query";

export function useUserBalance() {
  const { userAddress } = useUserContext();
  const { warning } = useToasterContext();

  const [userBalance, setUserBalance] = useState<UserBalanceType>({
    pnl: 0,
    available_usdt: 0,
    account_value: 0,
    pnl_percentage: 0,
  });

  const balanceData = useQuery({
    retry: false,
    queryKey: [userAddress, "fetchUserBalanceDetails"],
    queryFn: () => fetchUserBalanceDetails(userAddress || ""),
    enabled: Boolean(userAddress),
  });

  useEffect(() => {
    if (!balanceData.data) return;

    setUserBalance(balanceData.data);
  }, [balanceData.data]);

  useEffect(() => {
    if (balanceData.error) {
      const err = unknownToError(balanceData.error);
      warning("Error on get user balance data", err.message);
    }
  }, [balanceData.error]);

  return {
    userBalance,
    loading:
      balanceData.isLoading || balanceData.isFetching || balanceData.isPending,
  };
}
