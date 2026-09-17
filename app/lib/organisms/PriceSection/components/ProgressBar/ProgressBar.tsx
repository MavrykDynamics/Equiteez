import clsx from "clsx";

import styles from "./progressbar.module.css";
import { FC } from "react";

type ProgresBarProps = {
  baseTokenPercentage: string;
  quoteTokenPercentage: string;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
};

export const ProgresBar: FC<ProgresBarProps> = ({
  baseTokenPercentage,
  quoteTokenPercentage,
  quoteTokenSymbol,
  baseTokenSymbol,
}) => {
  return (
    <div className="flex flex-col">
      <div
        style={
          {
            "--progress-value": `${quoteTokenPercentage}%`,
          } as React.CSSProperties
        }
        className={clsx(styles.progressBar, styles.progressPercentage)}
      >
        <span className={styles.dot} />
      </div>
      <div className="flex justify-between text-content text-body mt-1">
        <p>
          {quoteTokenPercentage}% {quoteTokenSymbol}
        </p>
        <p>
          {baseTokenPercentage}% {baseTokenSymbol}
        </p>
      </div>
    </div>
  );
};
