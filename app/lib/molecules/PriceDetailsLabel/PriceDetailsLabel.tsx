import { FC } from "react";
import Money from "~/lib/atoms/Money";

import styles from "./priceDetailsLabel.module.css";

type PriceDetailsLabelProps = {
  price: number;
  percentage: number;
};

export const PriceDetailsLabel: FC<PriceDetailsLabelProps> = ({
  price,
  percentage,
}) => {
  return (
    <div className="flex items-center text-caption text-[#37794e]">
      <div className="text-black-secondary">
        $<Money fiat>{price}</Money>
      </div>
      <div className={styles.cardAnnualLabel}>
        <span>+</span>
        {percentage}
        <span>%</span>
      </div>
    </div>
  );
};
