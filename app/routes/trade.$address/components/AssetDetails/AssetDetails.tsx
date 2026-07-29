import { generatePath, useNavigate } from "@remix-run/react";
import type { ReactNode } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import styles from "./styles.module.css";
import { ROUTES } from "~/consts";
import { atomsToTokens } from "~/lib/utils/formaters";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";

type AssetDetailsProps = {
  asset: AssetType;
};

export function AssetDetails({ asset }: AssetDetailsProps) {
  const navigate = useNavigate();
  const { assets, assetTypes } = useAssetsContext();
  const {
    price,
    assetPrices,
    priceChange,
    highPrice24h,
    lowPrice24H,
    isNegative,
  } = useAssetPrice(asset);

  const handleAssetSelect = (address: string) => {
    if (address !== asset.address) {
      navigate(generatePath(ROUTES.trade, { address }));
    }
  };

  return (
    <section aria-label="Asset details" className={styles.details}>
      <div className={styles.assetDropdownWrapper}>
        <RCustomDropdown className={styles.assetDropdown}>
          <RDropdownFaceContent className={styles.assetDropdownTrigger}>
            <span className={styles.assetIdentity}>
              <RText size="body-sm" weight="medium">
                {asset.metadata.name}
              </RText>
              <RText color="neutral-600" size="body-s">
                {asset.metadata.symbol}
              </RText>
            </span>
          </RDropdownFaceContent>
          <RDropdownBodyContent className={styles.assetDropdownMenu}>
            {assets.map((item) => (
              <RDropdownBodyContentItem
                className={styles.assetDropdownItem}
                isSelected={item.address === asset.address}
                key={item.address}
                onClick={() => handleAssetSelect(item.address)}
              >
                <span className={styles.assetIdentity}>
                  <RText size="body-sm" weight="medium">
                    {item.metadata.name}
                  </RText>
                  <RText color="neutral-600" size="body-s">
                    {item.metadata.symbol}
                  </RText>
                </span>
              </RDropdownBodyContentItem>
            ))}
          </RDropdownBodyContent>
        </RCustomDropdown>
      </div>
      <DetailItem
        label="Asset class"
        value={
          assetTypes[asset.profile.asset_type]?.label ??
          asset.profile.asset_type
        }
      />
      <DetailItem
        label="Price"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {price}
            </Money>
          </>
        }
      />
      <DetailItem
        label="24h Change"
        value={
          priceChange.percentage ? (
            <RText
              size="body-sm"
              weight="medium"
              color={isNegative ? "red-500" : "green-500"}
            >
              {isNegative ? "-" : "+"}
              <Money fiat>{priceChange.percentage ?? 0}</Money>%
            </RText>
          ) : (
            "--"
          )
        }
      />
      <DetailItem
        label="24h High"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {highPrice24h}
            </Money>
          </>
        }
      />
      <DetailItem
        label="24h Low"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {lowPrice24H}
            </Money>
          </>
        }
      />
      {/*TODO remove mock data*/}
      <DetailItem
        label="24h Volume"
        value={
          <>
            ${/*<Money fiat tooltip={false}>*/}
            {/*  {126.4K}*/}
            {/*</Money>*/}
            126.4K
          </>
        }
      />
      {/*TODO remove mock data*/}
      <DetailItem
        label="Net Yield"
        value={
          <>
            <Money fiat tooltip={false}>
              4.78
            </Money>
            %
          </>
        }
      />
      <DetailItem
        label="Market Cap"
        value={
          <>
            $
            <Money shortened tooltip={false}>
              {(atomsToTokens(
                assetPrices.primary_issuance?.max_amount_cap ?? 0,
                asset.metadata.decimals
              ) ||
                asset.stats?.market_cap.usd) ??
                0}
            </Money>
          </>
        }
      />
    </section>
  );
}

type DetailItemProps = {
  label: string;
  value: ReactNode;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className={styles.detailItem}>
      <RText className={styles.label} color="neutral-600" size="body-xs">
        {label}
      </RText>
      <RText className={styles.value} size="body-sm" weight="medium">
        {value}
      </RText>
    </div>
  );
}
