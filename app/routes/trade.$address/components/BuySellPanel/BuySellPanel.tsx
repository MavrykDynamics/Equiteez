import {
  useCallback,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";

import { Spinner } from "~/lib/atoms/Spinner";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import {
  BUY,
  SELL,
  type OrderType,
} from "~/routes/marketplace.$id/components/PriceSection/consts";
import { BuySellContent } from "~/routes/marketplace.$id/components/PriceSection/popups";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import type {
  EstateType,
  SecondaryEstate,
} from "~/providers/MarketsProvider/market.types";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import styles from "./styles.module.css";

type BuySellPanelProps = {
  asset: AssetType;
  isOrderBookOpen: boolean;
  setIsOrderBookOpen: Dispatch<SetStateAction<boolean>>;
};

const getOrderTypeFromSearchParam = (side: string | null): OrderType =>
  side === SELL ? SELL : BUY;

const isMatchingTradeMarket = (market: EstateType, asset: AssetType) =>
  market.token_address === asset.address ||
  market.assetDetails.blockchain.some(
    (blockchain) => blockchain.identifier === asset.address
  );

const isSecondaryEstate = (market: EstateType): market is SecondaryEstate =>
  market.assetDetails.type === SECONDARY_MARKET;

export function BuySellPanel({
  asset,
  isOrderBookOpen,
  setIsOrderBookOpen,
}: BuySellPanelProps) {
  const queryClient = useQueryClient();
  const { hasOrders, refetchUserAccountStatus } = useUserContext();
  const [searchParams] = useSearchParams();
  const { isLoading, marketsArr, updateActiveMarketState } =
    useMarketsContext();
  const sideSearchParam = searchParams.get("side");
  const [orderType, setOrderType] = useState<OrderType>(() =>
    getOrderTypeFromSearchParam(sideSearchParam)
  );

  const estate = useMemo(
    () =>
      marketsArr.find(
        (market): market is SecondaryEstate =>
          isMatchingTradeMarket(market, asset) && isSecondaryEstate(market)
      ),
    [asset, marketsArr]
  );

  useEffect(() => {
    setOrderType(getOrderTypeFromSearchParam(sideSearchParam));
  }, [sideSearchParam]);

  useEffect(() => {
    if (estate?.slug) {
      updateActiveMarketState(estate.slug);
    }
  }, [estate?.slug, updateActiveMarketState]);

  const handleSuccessfulTransaction = useCallback(() => {
    const shouldInvalidateAssetOrdersQuery = (queryKey: readonly unknown[]) =>
      queryKey[0] === "fetchWalletOpenOrders" ||
      queryKey[0] === "fetchWalletOrderHistory";

    const refetchUserAccountStatusAfterFirstOrder = hasOrders
      ? Promise.resolve()
      : refetchUserAccountStatus().catch((error) => {
          console.log(error, "USER_ACCOUNT_STATUS_QUERY");
        });

    void Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) =>
          shouldInvalidateAssetOrdersQuery(query.queryKey),
      }),
      refetchUserAccountStatusAfterFirstOrder,
    ]);
  }, [hasOrders, queryClient, refetchUserAccountStatus]);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner size={56} />
      </div>
    );
  }

  if (!estate) {
    return <div className={styles.state}>Trading unavailable</div>;
  }

  return (
    <BuySellContent
      estate={estate}
      isOrderBookOpen={isOrderBookOpen}
      onSuccessfulTransaction={handleSuccessfulTransaction}
      orderType={orderType}
      setIsOrderBookOpen={setIsOrderBookOpen}
      setOrderType={setOrderType}
    />
  );
}
