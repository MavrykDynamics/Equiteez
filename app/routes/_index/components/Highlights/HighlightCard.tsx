import { generatePath, Link } from "@remix-run/react";
import BigNumber from "bignumber.js";

import { ROUTES } from "~/consts";
import type { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";

export function HighlightCard(props: { asset: AssetHighlightType }) {
  const { asset } = props;
  const { assets, prices } = useAssetsContext();
  const price = asset.price?.usd;
  const priceChange = asset.change_24h?.pct;
  const isNegative = (priceChange ?? 0) < 0;
  const fullAsset = assets.find((item) => item.address === asset.address);
  const imageUrl = fullAsset?.profile.image_url ?? "";
  const primaryIssuance = prices[asset.address]?.primary_issuance;
  const isPrimaryIssuance =
    fullAsset?.profile.lifecycle === "primary_issuance";
  const tokensAvailable = primaryIssuance
    ? BigNumber.maximum(
        new BigNumber(primaryIssuance.max_amount_cap).minus(
          primaryIssuance.total_bought
        ),
        0
      )
    : null;
  const tokenCap = primaryIssuance
    ? new BigNumber(primaryIssuance.max_amount_cap)
    : null;

  return (
    <Link
      to={generatePath(ROUTES.trade, { address: asset.address })}
      className={styles.cardWrapper}
    >
      <img
        alt=""
        className={styles.cardImage}
        decoding="async"
        loading="lazy"
        src={imageUrl}
      />

      <div className={styles.cardContent}>
        <div className={styles.cardBlock}>
          <RText size="body-sm" weight="medium">
            {asset.symbol.replace("-usdt", "").toUpperCase()}
          </RText>
          <RText
            className={styles.assetName}
            color="neutral-700"
            size="body-s"
            title={asset.name.replace("RWA", "").replace("Token", "")}
          >
            {asset.name.replace("RWA", "").replace("Token", "")}
          </RText>
        </div>

        <div className={styles.priceBlock}>
          <RText size="body-sm" weight="medium">
            {price === undefined ? (
              "—"
            ) : (
              <>
                $<Money fiat>{price}</Money>
              </>
            )}
          </RText>
          {isPrimaryIssuance ? (
            <RText
              className={styles.tokensAvailable}
              color="neutral-700"
              size="body-s"
            >
              {tokensAvailable && tokenCap && fullAsset ? (
                <>
                  <Money tooltip={false}>
                    {atomsToTokens(tokensAvailable, fullAsset.metadata.decimals)}
                  </Money>{" "}
                  /{" "}
                  <Money tooltip={false}>
                    {atomsToTokens(tokenCap, fullAsset.metadata.decimals)}
                  </Money>
                </>
              ) : (
                "--"
              )}
            </RText>
          ) : priceChange !== undefined && priceChange !== null ? (
            <RText
              className={styles.priceChange}
              size="body-s"
              color={isNegative ? "red-500" : "green-500"}
            >
              {isNegative ? "" : "+"}
              <Money fiat>{priceChange}</Money>%
            </RText>
          ) : (
            <RText
              className={styles.priceChange}
              size="body-s"
              color="neutral-700"
            >
              --
            </RText>
          )}
        </div>
      </div>
    </Link>
  );
}
