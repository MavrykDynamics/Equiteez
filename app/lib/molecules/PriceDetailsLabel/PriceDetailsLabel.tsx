import { FC } from "react";
import Money from "~/lib/atoms/Money";

import styles from "./priceDetailsLabel.module.css";
import clsx from "clsx";

type PriceDetailsLabelProps = {
  price: number;
  percentage: number;
};

export const PriceDetailsLabel: FC<PriceDetailsLabelProps> = ({
  price,
  percentage,
}) => {
  return (
    <div className="flex items-center text-body font-semibold text-[#37794e]">
      <div className="text-black-secondary">
        $<Money fiat>{price}</Money>
      </div>
      <div
        className={clsx(styles.cardAnnualLabel, "text-body-xs font-semibold")}
      >
        <span>+</span>
        {percentage}
        <span>%</span>
      </div>
    </div>
  );
};
