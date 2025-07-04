// icons
import DotFill from "~/icons/dot-fill.svg?react";
import DotEmpty from "~/icons/dot-empty.svg?react";
import EQLogo from "~/icons/eq-small-logo.svg?react";
import { FC } from "react";

import styles from "./eSnakeBlock.module.css";
import clsx from "clsx";

const options = [0, 25, 50, 75, 100];

type ESnakeblockProps = {
  selectedOption: number | null;
  setSelectedOption: (option: number) => void;
  disabled?: boolean;
  size?: "regular" | "large";
};

const sizeClassname = {
  regular: "size-4",
  large: "size-6",
};

export const ESnakeblock: FC<ESnakeblockProps> = ({
  selectedOption: originalSelectedOption = null,
  setSelectedOption,
  disabled = false,
  size = "regular",
}) => {
  const handleOptionClick = (option: number) => {
    if (!disabled) setSelectedOption(option);
  };
  const sizeClassnameValue = sizeClassname[size];

  const selectedOption = originalSelectedOption ?? 0;

  return (
    <div
      className={clsx(
        "flex flex-col w-full",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div
        className={clsx(
          "flex w-full h-4 relative",
          size === "large" ? "h-6" : "h-4"
        )}
      >
        <div
          style={{ zIndex: 5 }}
          className={clsx(
            "absolute w-full h-full flex justify-between",
            "transition 0.3s linear"
          )}
        >
          {options.map((option, idx) => (
            <span
              role="presentation"
              key={option}
              className="cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option === selectedOption ? (
                <EQLogo
                  className={clsx(
                    " text-dark-green-500 stroke-current",
                    sizeClassnameValue
                  )}
                />
              ) : options.length - 1 === idx ? (
                <DotFill
                  className={clsx("fill-dark-green-200", sizeClassnameValue)}
                />
              ) : selectedOption > option ? (
                <div
                  className={clsx("bg-transparent", sizeClassnameValue)}
                ></div>
              ) : (
                <DotEmpty
                  className={clsx(
                    "text-dark-green-200 stroke-current",
                    sizeClassnameValue
                  )}
                />
              )}
            </span>
          ))}
        </div>

        <div
          style={
            { "--percentage": `${selectedOption}%` } as React.CSSProperties
          }
          className="absolute w-full h-full flex items-center z-1"
        >
          <div
            className={clsx(styles.progressBar, styles.progressPercentage)}
          />
        </div>
      </div>

      <div className="flex w-full justify-between">
        {options.map((option) => (
          <button
            key={option}
            className={clsx(
              "outline-none focus:outline-none",
              size === "regular" ? "text-[10px]  pt-1" : "text-sm pt-[10px]",
              option !== 0 && option !== 100 && "pl-[15px]"
            )}
            onClick={() => handleOptionClick(option)}
          >
            {option}%
          </button>
        ))}
      </div>
    </div>
  );
};
