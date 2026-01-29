import { FC, useState } from "react";
import styles from "./styles.module.css";
import { SLIPPAGE_OPTIONS } from "../../popups";
import clsx from "clsx";

const PERCENT_REGEX = /^(?:50(?:\.0{0,2})?|[0-4]?\d(?:\.\d{0,2})?)$/;

type PercentBlockProps = {
  slippagePercentage: number;
  handleSlippageChange: (value: number) => void;
  isBuyAction: boolean;
};

export const PercentBlock: FC<PercentBlockProps> = ({
  slippagePercentage,
  handleSlippageChange,
  isBuyAction,
}) => {
  const [currentPercent, setCurrentPercent] = useState<string | number>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || PERCENT_REGEX.test(value)) {
      setCurrentPercent(value);
      handleSlippageChange(parseInt(value || "0", 10));
    }
  };

  const symbol = isBuyAction ? "-" : "+";

  return (
    <div className="flex items-center gap-[4px]">
      {SLIPPAGE_OPTIONS.map((percent) => (
        <button
          key={percent}
          onClick={() => handleSlippageChange(percent)}
          className={clsx(
            styles.percentButton,
            percent === slippagePercentage && !currentPercent && styles.active
          )}
        >
          {symbol}&nbsp;{percent}%
        </button>
      ))}
      <input
        value={currentPercent}
        placeholder="0.00%"
        type="number"
        onChange={onChange}
        name="percent"
        className={clsx(styles.percentInput, currentPercent && styles.active)}
      />
    </div>
  );
};
