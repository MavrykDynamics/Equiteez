import type BigNumber from "bignumber.js";
import { FC, useCallback, useState } from "react";
import Money from "~/lib/atoms/Money";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles.module.css";
import { Icon } from "~/lib/atoms/Icon";

const expandVariants = {
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: {
      height: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.2, ease: "easeOut" },
    },
  },
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    transition: {
      height: { duration: 0.25, ease: "easeIn" },
      opacity: { duration: 0.15, ease: "easeIn" },
    },
  },
};

type FeesCardProps = {
  totalAmount: BigNumber | number;
  txnFees: BigNumber | number;
  networkfee: BigNumber | number;
};

export const FeesCard: FC<FeesCardProps> = ({
  totalAmount,
  txnFees,
  networkfee,
}) => {
  const [shouldExpand, setShouldExpand] = useState(false);

  const handleToggle = useCallback(() => {
    setShouldExpand((prevState) => !prevState);
  }, []);

  return (
    <section className="bg-gray-50 rounded-2xl flex flex-col p-4">
      <div className="text-sm flex items-center justify-between">
        <div className="flex items-center gap-[4px]">
          <p className="text-sand-600">Total Amount</p>
          <div className="text-sand-900 font-semibold">
            $
            <Money tooltip={false} fiat>
              {totalAmount}
            </Money>
          </div>
        </div>

        <button
          className={styles.openPriceButton}
          aria-label="Open price section"
          data-open={shouldExpand}
          onClick={handleToggle}
        >
          <Icon icon="chevron-up" className={styles.arrowIcon} />
        </button>
      </div>

      <AnimatePresence>
        {shouldExpand && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className="text-sm w-full flex flex-col pt-[8px] gap-[8px]">
              <div className="w-full h-[1px] bg-sand-200" />
              <div className="w-full flex flex-col gap-[4px]">
                <div className="flex items-center justify-between">
                  <p className="text-sand-600">Txn Fees</p>
                  <div className="text-sand-900 font-semibold">
                    $<Money tooltip={false}>{txnFees}</Money>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sand-600">Network Fee</p>
                  <div className="text-sand-900 font-semibold">
                    <Money tooltip={false}>{networkfee}</Money> MVRK
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
