import clsx from "clsx";
import type { BigNumber } from "bignumber.js";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "../ChartBlock/styles.module.css";

export function RPriceLabelGroup({
  price,
  variant = "chart",
}: {
  price: number | BigNumber | undefined;
  variant?: "chart" | "gallery";
}) {
  return (
    <div
      className={clsx(
        styles.priceLabelGroup,
        variant === "gallery" && styles.galleryPriceLabelGroup
      )}
    >
      <span className={styles.currentPrice}>
        {price === undefined ? (
          "—"
        ) : (
          <>
            $
            <Money fiat tooltip={false}>
              {price}
            </Money>
          </>
        )}
      </span>
      <RText
        className={styles.priceLabel}
        size="body-s"
        color={variant === "gallery" ? "neutral-white" : "neutral-black"}
      >
        Price
        <RText
          size="body-s"
          color={variant === "gallery" ? "neutral-200" : "neutral-500"}
        >
          {" "}
          / Market Cap
        </RText>
      </RText>
    </div>
  );
}
