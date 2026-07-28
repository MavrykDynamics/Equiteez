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

type AssetDetailsProps = {
  asset: AssetType;
};

export function AssetDetails({ asset }: AssetDetailsProps) {
  const navigate = useNavigate();
  const { assets, assetTypes, prices } = useAssetsContext();

  const assetPrices = prices[asset.address] ?? {};

  const priceChange = {
    amount: assetPrices.change_24h?.delta_abs ?? 0,
    percentage: assetPrices.change_24h?.change_pct ?? 0,
  };
  const isNegative = priceChange?.percentage < 0;

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
              {assetPrices.usd ??
                assetPrices.price ??
                asset.stats?.price.usd ??
                asset.finance.value_per_token}
            </Money>
          </>
        }
      />
      <DetailItem
        label="24h Change"
        value={
          <RText
            size="body-sm"
            weight="medium"
            color={isNegative ? "red-500" : "green-500"}
          >
            {isNegative ? "-" : "+"}
            <Money>{priceChange.percentage ?? 0}</Money>%
          </RText>
        }
      />

      <DetailItem
        label="24h High"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {asset.finance.value_per_token}
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
              {asset.finance.value_per_token}
            </Money>
          </>
        }
      />
      <DetailItem
        label="24h Volume"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {asset.finance.value_per_token}
            </Money>
          </>
        }
      />
      <DetailItem
        label="Net Yield"
        value={
          <>
            $
            <Money fiat tooltip={false}>
              {asset.finance.value_per_token}
            </Money>
          </>
        }
      />
      <DetailItem
        label="Market Cap"
        value={
          <>
            <Money tooltip={false}>{asset.apy}</Money>%
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
