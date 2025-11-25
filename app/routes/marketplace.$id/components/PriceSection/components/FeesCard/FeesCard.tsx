import type BigNumber from "bignumber.js";
import { FC } from "react";
import Money from "~/lib/atoms/Money";

type FeesCardProps = {
  pricePerToken: BigNumber | number;
  txnFees: BigNumber | number;
  totalFee: BigNumber | number;
  networkfee: BigNumber | number;
};

export const FeesCard: FC<FeesCardProps> = ({
  pricePerToken = 0,
  txnFees = 0,
  totalFee = 0,
  networkfee = 0,
}) => {
  return (
    <section className="bg-gray-50 rounded-2xl flex flex-col p-4">
      <div className="font-semibold text-sm">
        <div className="flex items-center justify-between">
          <p className="text-sand-600">Price per token</p>
          <div className="text-sand-900">
            $
            <Money tooltip={false} fiat>
              {pricePerToken}
            </Money>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sand-600">Txn Fees</p>
          <div className="text-sand-900">
            $
            <Money tooltip={false} fiat>
              {txnFees}
            </Money>
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-sand-200 my-2" />
      <div className="text-sand-900 text-sm font-semibold">
        <div className="flex items-center justify-between">
          <p>Total Fee</p>
          <Money tooltip={false}>{totalFee}</Money>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p>Network Fee</p>
          <Money tooltip={false}>{networkfee}</Money>
        </div>
      </div>
    </section>
  );
};
