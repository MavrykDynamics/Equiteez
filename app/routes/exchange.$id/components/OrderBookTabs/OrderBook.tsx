import { FC, useMemo } from "react";

import { stablecoinContract } from "~/consts/contracts";
import { toTokenSlug } from "~/lib/assets";
import { useAssetMetadata } from "~/lib/metadata";
import { OrderBookTable } from "~/lib/organisms/OrderBookPopup/OrderBookTable";
import { atomsToTokens } from "~/lib/utils/formaters";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";

type OrderBookProps = {
  baseTokenDecimals: number;
  rwaAddress: string;
  slug: string;
  symbol: string;
};

export const OrderBook: FC<OrderBookProps> = ({
  baseTokenDecimals,
  rwaAddress,
  slug,
  symbol,
}) => {
  const { orderbookStorages, orderbookTokenPair } = useDexContext();
  const selectedAssetMetadata = useAssetMetadata(slug);
  const quoteTokenSlug =
    orderbookTokenPair[slug] ?? toTokenSlug(stablecoinContract);
  const quoteAssetMetadata = useAssetMetadata(quoteTokenSlug);
  const quoteTokenDecimals = quoteAssetMetadata?.decimals ?? 6;
  const referencePrice = useMemo(() => {
    const orderbookStorage = orderbookStorages[slug];

    if (!orderbookStorage) return 0;

    const rawReferencePrice =
      orderbookStorage.lowestSellPrice > 0
        ? orderbookStorage.lowestSellPrice
        : orderbookStorage.highestBuyPrice;

    if (rawReferencePrice <= 0) return 0;

    return atomsToTokens(rawReferencePrice, quoteTokenDecimals).toNumber();
  }, [orderbookStorages, quoteTokenDecimals, slug]);

  return (
    <OrderBookTable
      baseTokenDecimals={selectedAssetMetadata?.decimals ?? baseTokenDecimals}
      baseTokenSymbol={selectedAssetMetadata?.symbol ?? symbol}
      enabled={Boolean(rwaAddress)}
      quoteTokenDecimals={quoteTokenDecimals}
      quoteTokenSymbol={quoteAssetMetadata?.symbol ?? "USDT"}
      referencePrice={referencePrice}
      rwaAddress={rwaAddress}
    />
  );
};
