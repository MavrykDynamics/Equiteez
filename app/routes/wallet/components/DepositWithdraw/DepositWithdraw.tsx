import React from "react";
import { Deposit } from "~/routes/wallet/components/Deposit/Deposit";
import { Withdraw } from "~/routes/wallet/components/Withdraw/Withdraw";

export function DepositWithdraw() {
  return (
    <div className="flex items-center gap-[8px] w-full lg:w-auto">
      <Deposit />
      <Withdraw />
    </div>
  );
}
