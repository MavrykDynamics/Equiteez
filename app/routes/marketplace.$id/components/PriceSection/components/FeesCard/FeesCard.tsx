import type BigNumber from "bignumber.js";
import { FC } from "react";
import Money from "~/lib/atoms/Money";

type FeesCardProps = {
  // Kept optional for backwards compatibility with callers; the grand total is
  // shown separately as "Order Total", so this card only surfaces the fees.
  totalAmount?: BigNumber | number;
  txnFees?: BigNumber | number;
  networkfee: BigNumber | number;
};

export const FeesCard: FC<FeesCardProps> = ({ txnFees, networkfee }) => {
  return (
    <section className="bg-gray-50 rounded-2xl flex flex-col gap-[8px] p-4 text-sm">
      <p className="text-sand-600 font-semibold">Fees</p>

      <div className="flex flex-col gap-[4px]">
        <div className="flex items-center justify-between">
          <p className="text-sand-600">Platform Fees</p>
          <div className="text-sand-900 font-semibold">
            {txnFees === undefined ? (
              "On fill"
            ) : (
              <>
                $<Money tooltip={false}>{txnFees}</Money>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sand-600">Network Fee</p>
          <div className="text-sand-900 font-semibold">
            <Money tooltip={false}>{networkfee}</Money> MVRK
          </div>
        </div>
      </div>
    </section>
  );
};
