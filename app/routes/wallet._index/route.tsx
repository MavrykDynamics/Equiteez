import React from "react";
import { WalletAssetsBlock } from "~/routes/wallet._index/components/WalletAssetsBlock/WalletAssetsBlock";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";

export default function WalletOverview() {
  const { userTokensBalances } = useUserContext();

  const mvrkBalance =
    userTokensBalances[MVRK_CONTRACT_ADDRESS]?.toNumber() || 0;

  return <WalletAssetsBlock mvrkBalance={mvrkBalance} mbgBalance={0} />;
}
