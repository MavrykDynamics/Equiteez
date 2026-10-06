import {
  useCallback,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "@remix-run/react";

import type { ContractActionSuccessMetadata } from "~/contracts/actions.type";
import { Spinner } from "~/lib/atoms/Spinner";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RTradingOverlay } from "./RTradingCountdown";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import { BUY, SELL, type OrderType } from "~/lib/organisms/PriceSection/consts";
import { BuySellContent } from "~/lib/organisms/PriceSection/popups";
import { useOrderbookConfig } from "~/hooks/useOrderbookConfig";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import styles from "./styles.module.css";
import { PrimaryPurchasePanel } from "./PrimaryPurchasePanel";

type BuySellPanelProps = {
  asset: AssetType;
  isPrimary?: boolean;
  isOrderBookOpen: boolean;
  orderBookContainer?: HTMLElement | null;
  setIsOrderBookOpen: Dispatch<SetStateAction<boolean>>;
};

const getOrderTypeFromSearchParam = (side: string | null): OrderType =>
  side === SELL ? SELL : BUY;

export function BuySellPanel(props: BuySellPanelProps) {
  const { userAddress, connect } = useUserContext();
  const isDisconnected = !userAddress;

  return (
    <>
      <div
        className={isDisconnected ? styles.disconnected : styles.connected}
        aria-hidden={isDisconnected || undefined}
        {...(isDisconnected ? { inert: "" } : {})}
      >
        {props.isPrimary ? (
          <PrimaryPurchasePanel
            asset={props.asset}
            isDisconnected={isDisconnected}
          />
        ) : (
          <SecondaryBuySellPanel {...props} />
        )}
      </div>
      {isDisconnected && (
        <RTradingOverlay>
          <RButton
            onClick={connect}
            size="medium"
            tone="black"
            variant="primary"
          >
            <RText size="body-s" weight="medium" color="neutral-white">
              Connect Wallet
            </RText>
          </RButton>
        </RTradingOverlay>
      )}
    </>
  );
}

function SecondaryBuySellPanel({
  asset,
  isOrderBookOpen,
  orderBookContainer,
  setIsOrderBookOpen,
}: BuySellPanelProps) {
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const { hasOrders, refetchUserAccountStatus } = useUserContext();
  const [searchParams] = useSearchParams();
  const { status, config, error, retry } = useOrderbookConfig(asset);
  const sideSearchParam = searchParams.get("side");
  const [orderType, setOrderType] = useState<OrderType>(() =>
    getOrderTypeFromSearchParam(sideSearchParam)
  );

  useEffect(() => {
    setOrderType(getOrderTypeFromSearchParam(sideSearchParam));
  }, [sideSearchParam]);

  const handleSuccessfulTransaction = useCallback(
    (metadata: ContractActionSuccessMetadata) => {
      const refetchUserAccountStatusAfterFirstOrder = hasOrders
        ? Promise.resolve()
        : refetchUserAccountStatus().catch((error) => {
            console.log(error, "USER_ACCOUNT_STATUS_QUERY");
          });

      void Promise.all([
        invalidateFreshQueries("fetchWalletOpenOrders", {
          level: metadata.confirmation?.level,
          source: FreshnessSource.Orderbook,
        }),
        invalidateFreshQueries("fetchWalletOrderHistory", {
          level: metadata.confirmation?.level,
          source: FreshnessSource.Orderbook,
        }),
        refetchUserAccountStatusAfterFirstOrder,
      ]);
    },
    [hasOrders, invalidateFreshQueries, refetchUserAccountStatus]
  );

  if (status === "loading") {
    return (
      <div className={styles.state}>
        <Spinner size={56} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className={styles.state}>
        Trading unavailable: {error?.message}
        <button
          type="button"
          onClick={() => {
            void retry().catch(console.error);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <BuySellContent
      key={`${asset.address}:${config.address}:${config.rwaTokenId}:${config.quoteTokenAddress}:${config.quoteTokenId}`}
      asset={asset}
      orderbookConfig={config}
      configError={error?.message}
      onRetryConfig={() => {
        void retry().catch(console.error);
      }}
      isOrderBookOpen={isOrderBookOpen}
      orderBookContainer={orderBookContainer}
      onSuccessfulTransaction={handleSuccessfulTransaction}
      orderType={orderType}
      setIsOrderBookOpen={setIsOrderBookOpen}
      setOrderType={setOrderType}
    />
  );
}
