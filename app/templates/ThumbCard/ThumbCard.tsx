import { CSSProperties, FC, useMemo } from "react";

import styles from "./thumbCard.module.css";
import clsx from "clsx";
import { EstateHeadlineTab, HeadlineTabBadge } from "../EstateHeadlineTab";
import BigNumber from "bignumber.js";
import Money from "~/lib/atoms/Money";
import { PriceDetailsLabel } from "~/lib/molecules/PriceDetailsLabel/PriceDetailsLabel";

type ThumbCardProps = {
  imgSrc: string;
  title: string;
  address: string;
  APY: number;
  height?: string;
};

type ThumbCardSecondary = Omit<ThumbCardProps, "address"> & {
  description: string;
  progressBarPercentage?: number;
  isSecondaryMarket: boolean;
  pricePerToken?: BigNumber;
  isFutureAsset?: boolean;
};

export const ThumbCardSecondary: FC<ThumbCardSecondary> = ({
  imgSrc,
  title,
  description,
  isSecondaryMarket,
  pricePerToken,
  progressBarPercentage,
  APY,
  isFutureAsset = false,
  height = "264px",
}) => {
  const memoizedStyle = useMemo(() => ({ "--card-height": height }), [height]);

  return (
    <div
      style={memoizedStyle as React.CSSProperties}
      className={styles.thumbCardWrapper}
    >
      <img src={imgSrc} alt="house" className={styles.thumbCardImg} />
      <div
        className={clsx(
          styles.thumbCardContent,
          "flex flex-col justify-between p-4"
        )}
      >
        <div className="flex items-center gap-x-2">
          {isFutureAsset && (
            <HeadlineTabBadge className="bg-[#FFA726] text-[#492C00]">
              Coming Soon
            </HeadlineTabBadge>
          )}
          <EstateHeadlineTab isSecondaryEstate={isSecondaryMarket} />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex-1 w-full flex justify-between">
            <div className="flex flex-col">
              <h4
                className={clsx("text-white text-card-headline", styles.title)}
              >
                {title}
              </h4>
              <p className="text-white text-body-xs leading-5 capitalize">
                {description}
              </p>
            </div>
            <div className="flex self-end">
              {pricePerToken && (
                <div className="flex flex-col items-center pr-3 border-r border-sand-50 mr-3">
                  <div className="flex items-center text-card-headline text-sand-50">
                    $<Money fiat>{pricePerToken}</Money>
                  </div>
                  <span className="text-sand-50 text-body-xs leading-5">
                    Price
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-card-headline text-sand-50">{APY}%</span>
                <span className="text-sand-50 text-body-xs leading-5">APY</span>
              </div>
            </div>
          </div>
          {progressBarPercentage && (
            <div
              style={
                {
                  "--percentage": `${progressBarPercentage}%`,
                } as CSSProperties
              }
              className={clsx(
                styles.progressBarContainer,
                "gap-x-2 w-full items-center"
              )}
            >
              <div
                className={clsx(
                  "overflow-hidden",
                  styles.progressBar,
                  styles.progressPercentage,
                  progressBarPercentage === 100
                    ? "after:bg-[#0DB365]"
                    : "after:bg-background"
                )}
              />
              <span className="text-background text-caption">
                {progressBarPercentage === 100
                  ? "FUNDED"
                  : `${progressBarPercentage}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type PrimaryThumbCardProps = {
  imgSrc: string;
  title: string;
  price: number;
  annual: number;
  tokensAvailable: number;
};

export const ThumbCardPrimary: FC<PrimaryThumbCardProps> = ({
  imgSrc,
  title,
  price,
  annual,
  tokensAvailable,
}) => {
  return (
    <div
      className={clsx("p-6 flex flex-col gap-4 bg-white", styles.cardPrimary)}
    >
      <img src={imgSrc} alt={title} />

      <div className="flex flex-col">
        <h4
          className={clsx(
            "text-card-headline text-content mb-1",
            styles.primaryHeader
          )}
        >
          {title}
        </h4>
        <PriceDetailsLabel price={price} percentage={annual} />
        <div className="flex items-center justify-between text-content mt-3">
          <p className="text-sm">Tokens Available</p>
          <div className="font-semibold text-sm">
            <Money>{tokensAvailable}</Money>
          </div>
        </div>
      </div>
    </div>
  );
};
