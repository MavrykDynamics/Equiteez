import { generatePath, useNavigate } from "@remix-run/react";
import { useMemo, useState } from "react";

import { ROUTES } from "~/consts";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RInput } from "~/lib/atoms/RInput/RInput";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { buildTokenImagesStack } from "~/lib/images-uri";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import styles from "./AssetDropdown.module.css";
import Money from "~/lib/atoms/Money";
import { ASSET_IMAGE_URLS_BY_ADDRESS } from "~/mocks/asset-image-urls.mock";

type AssetDropdownProps = {
  asset: AssetType;
};

export function AssetDropdown({ asset }: AssetDropdownProps) {
  const navigate = useNavigate();
  const { assets } = useAssetsContext();
  const [query, setQuery] = useState("");

  const matchingAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return assets;
    }

    return assets.filter(
      (item) =>
        item.metadata.name.toLowerCase().includes(normalizedQuery) ||
        item.metadata.symbol.toLowerCase().includes(normalizedQuery)
    );
  }, [assets, query]);

  const handleAssetSelect = (address: string) => {
    if (address !== asset.address) {
      navigate(generatePath(ROUTES.trade, { address }));
    }
  };

  return (
    <RCustomDropdown className={styles.dropdown}>
      <RDropdownFaceContent className={styles.trigger}>
        <AssetIdentity asset={asset} />
      </RDropdownFaceContent>

      <RDropdownBodyContent className={styles.menu}>
        <RInput
          aria-label="Search assets"
          className={styles.search}
          icon="search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ticker, name"
          value={query}
        />

        {matchingAssets.length ? (
          <div className={styles.options}>
            {matchingAssets.map((item) => (
              <AssetOption
                asset={item}
                isSelected={item.address === asset.address}
                key={item.address}
                onSelect={handleAssetSelect}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <RText color="neutral-600" size="body-sm">
              No Results Found
            </RText>
          </div>
        )}
      </RDropdownBodyContent>
    </RCustomDropdown>
  );
}

function AssetIdentity({ asset }: { asset: AssetType }) {
  return (
    <span className={styles.assetIdentity}>
      <AssetIcon asset={asset} />
      <span className={styles.assetLabels}>
        <RText className={styles.assetName} size="body-l" weight="medium">
          {asset.metadata.name}
        </RText>
        <RText className={styles.assetSymbol} color="neutral-700" size="body-m">
          {asset.metadata.symbol}
        </RText>
      </span>
    </span>
  );
}

function AssetIcon({ asset }: { asset: AssetType }) {
  // const imageUrl = asset.profile.image_url;
  // const [normalizedImageUrl] = buildTokenImagesStack(imageUrl, {
  //   useMediaHost: true,
  // });
  //
  // const src = normalizedImageUrl || imageUrl;
  //
  // return src ? (
  //   <img alt="" className={styles.assetIcon} src={src} />
  // ) : (
  //   <span aria-hidden="true" className={styles.assetIconFallback}>
  //     {asset.metadata.symbol.slice(0, 1)}
  //   </span>
  // );

  return (
    <img
      alt={asset.metadata.name}
      className={styles.assetIcon}
      src={ASSET_IMAGE_URLS_BY_ADDRESS[asset.address]}
    />
  );
}

type AssetOptionProps = {
  asset: AssetType;
  isSelected: boolean;
  onSelect: (address: string) => void;
};

function AssetOption({ asset, isSelected, onSelect }: AssetOptionProps) {
  const { isNegative, price, priceChange } = useAssetPrice(asset);

  return (
    <RDropdownBodyContentItem
      className={styles.option}
      isSelected={isSelected}
      onClick={() => onSelect(asset.address)}
    >
      <span className={styles.optionContent}>
        <AssetIdentity asset={asset} />
        <div className={styles.assetPriceWrapper}>
          <span className={styles.assetPrice}>
            <RText size="body-sm" weight="medium">
              $
              <Money fiat tooltip={false}>
                {price}
              </Money>
            </RText>
            {priceChange.percentage ? (
              <RText color={isNegative ? "red-500" : "green-600"} size="body-s">
                {isNegative ? "" : "+"}
                <Money fiat tooltip={false}>
                  {priceChange.percentage}
                </Money>
                %
              </RText>
            ) : (
              <RText color="neutral-500" size="body-s">
                --
              </RText>
            )}
          </span>
          <RIcon className={styles.optionStar} name="star" size="small" />
        </div>
      </span>
    </RDropdownBodyContentItem>
  );
}
