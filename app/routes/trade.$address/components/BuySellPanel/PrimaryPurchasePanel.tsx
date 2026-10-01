import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { BigNumber } from "bignumber.js";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { toTokenSlug } from "~/lib/assets";
import { createFallbackTokenMetadata } from "~/lib/metadata";
import { BuySellScreen } from "~/lib/organisms/PriceSection/screens/BuySellScreen";
import { TradeConfirmationPopup } from "~/lib/organisms/PriceSection/components/TradeConfirmationPopup";
import { BUY } from "~/lib/organisms/PriceSection/consts";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import {
  primaryPurchase,
  estimatePrimaryPurchase,
} from "~/contracts/primaryPurchase.contract";
import {
  primaryAmountForBudget,
  quotePrimaryPurchase,
  validatePrimaryAmount,
} from "~/contracts/primaryPurchase.quote";
import type {
  PrimaryPurchaseConfig,
  PrimaryPurchaseReview,
} from "~/contracts/primaryPurchase.types";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { Spinner } from "~/lib/atoms/Spinner";
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from "~/providers/ToasterProvider/toaster.provider.const";
import { usePrimaryPurchase } from "./usePrimaryPurchase";
import { RTradingCountdown } from "./RTradingCountdown";
import styles from "./styles.module.css";
import formStyles from "~/lib/organisms/PriceSection/popups/popups.module.css";

const ZERO = new BigNumber(0);
const SCALE = new BigNumber("1000000");
const toHuman = (raw: string) => new BigNumber(raw).dividedBy(SCALE);
const toRaw = (value: BigNumber) =>
  value.times(SCALE).integerValue(BigNumber.ROUND_DOWN).toFixed(0);

type PurchaseQuery = ReturnType<typeof usePrimaryPurchase>;

export function PrimaryPurchasePanel({ asset }: { asset: AssetType }) {
  const query = usePrimaryPurchase(asset.address);
  const { connect } = useUserContext();
  const config = query.data;
  const retry = () => {
    void query.refetch();
  };
  return (
    <>
      {query.isPending ? (
        <div className={styles.state}>
          <Spinner size={56} />
        </div>
      ) : !config || !config.options.length || asset.metadata.decimals !== 6 ? (
        <div className={styles.state} role="status">
          {query.error?.message ??
            config?.unavailableReason ??
            "Primary purchases are temporarily unavailable."}
          {config && !config.wallet ? (
            <button type="button" onClick={connect}>
              Connect wallet
            </button>
          ) : (
            <button type="button" onClick={retry}>
              Retry
            </button>
          )}
        </div>
      ) : (
        <PrimaryPurchaseForm
          key={`${config.launchName}:${config.wallet}`}
          asset={asset}
          config={config}
          query={query}
        />
      )}
      {config && <RTradingCountdown startsAt={config.saleStart} />}
    </>
  );
}

function PrimaryPurchaseForm({
  asset,
  config,
  query,
}: {
  asset: AssetType;
  config: PrimaryPurchaseConfig;
  query: PurchaseQuery;
}) {
  const [amount, setAmount] = useState<BigNumber>();
  const [review, setReview] = useState<PrimaryPurchaseReview | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [estimateError, setEstimateError] = useState<string>();
  const [fees, setFees] = useState({ networkFee: ZERO, gasFee: ZERO });
  const option = config.options[0];
  const rawAmount = amount?.isFinite() && amount.gt(0) ? toRaw(amount) : "0";
  const quote = useMemo(
    () => quotePrimaryPurchase(option, rawAmount),
    [option, rawAmount]
  );
  const paymentAmount =
    amount === undefined ? undefined : toHuman(quote.totalPayment);
  const metadata = useMemo(
    () => ({
      baseTokenSlug: toTokenSlug(asset.address, config.assetTokenId),
      baseTokenMetadata: createFallbackTokenMetadata({
        address: asset.address,
        id: config.assetTokenId,
        name: asset.metadata.name,
        symbol: asset.metadata.symbol,
        decimals: asset.metadata.decimals,
        thumbnailUri: asset.metadata.icon,
      }),
      quoteTokenSlug: toTokenSlug(option.tokenAddress, option.tokenId),
      quoteTokenMetadata: {
        ...USDT_BRIDGE.destinationToken,
        address: option.tokenAddress,
        id: option.tokenId,
      },
      baseTokenDecimals: asset.metadata.decimals,
      quoteTokenDecimals: USDT_BRIDGE.destinationToken.decimals,
      isMetadataLoaded: true,
    }),
    [asset, config.assetTokenId, option.tokenAddress, option.tokenId]
  );
  const setBudget: Dispatch<SetStateAction<BigNumber | undefined>> =
    useCallback(
      (value) => {
        setActionError(undefined);
        setAmount((previous) => {
          const previousPayment = previous
            ? toHuman(
                quotePrimaryPurchase(option, toRaw(previous)).totalPayment
              )
            : undefined;
          const budget =
            typeof value === "function" ? value(previousPayment) : value;
          if (!budget) return undefined;
          if (!budget.isFinite() || budget.lt(0)) return ZERO;
          return toHuman(primaryAmountForBudget(option, toRaw(budget)));
        });
      },
      [option]
    );
  const handleReceiveChange = useCallback((value: BigNumber | undefined) => {
    setActionError(undefined);
    setAmount(
      value?.isFinite() && value.gte(0) ? toHuman(toRaw(value)) : undefined
    );
  }, []);
  let amountError: string | undefined;
  if (rawAmount !== "0") {
    try {
      validatePrimaryAmount(option, rawAmount);
    } catch (error) {
      amountError = (error as Error).message;
    }
  } else if (option.maxAmount === "0")
    amountError =
      "This sale option is sold out or your wallet limit has been reached.";

  const { refetch, tezos, refreshAfterPurchase } = query;
  const executePurchase = useCallback(
    async (params: Parameters<typeof primaryPurchase>[0]) => {
      try {
        await primaryPurchase(params);
      } catch (error) {
        await refetch();
        throw error;
      }
    },
    [refetch]
  );
  const { invokeAction, status, isLoading } = useContractAction(
    executePurchase,
    { review: review ?? { config, option, amount: rawAmount, quote } },
    undefined,
    {
      pending: TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
      success: {
        title: `${asset.metadata.symbol} Purchase Confirmed`,
        message:
          config.distribution === "AUTO"
            ? "Your tokens have been delivered to your wallet."
            : "Your tokens are allocated, pending distribution.",
      },
    },
    {
      onSuccess: (metadata) => {
        setAmount(undefined);
        setReview(null);
        setActionError(undefined);
        refreshAfterPurchase(metadata);
      },
    }
  );

  useEffect(() => {
    if (isLoading || isConfirmationOpen) return;
    setFees({ networkFee: ZERO, gasFee: ZERO });
    setEstimateError(undefined);
    if (rawAmount === "0" || config.unavailableReason || amountError) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await estimatePrimaryPurchase({
          tezos,
          review: { config, option, amount: rawAmount, quote },
        });
        if (!cancelled)
          setFees({
            networkFee: toHuman(String(result.networkFee)),
            gasFee: toHuman(String(result.gasFee)),
          });
      } catch (error) {
        if (!cancelled) setEstimateError((error as Error).message);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    amountError,
    config,
    isConfirmationOpen,
    isLoading,
    option,
    quote,
    rawAmount,
    tezos,
  ]);

  const handleReview = async () => {
    setIsPreparing(true);
    setActionError(undefined);
    try {
      const result = await refetch();
      if (result.error) throw result.error;
      const live = result.data;
      if (!live || live.unavailableReason)
        throw new Error(
          live?.unavailableReason ?? "The launch is unavailable."
        );
      const current = live.options[0];
      if (!current) throw new Error("This sale option is no longer available.");
      validatePrimaryAmount(current, rawAmount);
      const currentQuote = quotePrimaryPurchase(current, rawAmount);
      if (
        current.name !== option.name ||
        current.payment !== option.payment ||
        currentQuote.totalPayment !== quote.totalPayment ||
        current.price !== option.price ||
        live.distribution !== config.distribution
      )
        throw new Error(
          "The quote has changed. Review the updated amount and continue again."
        );
      const nextReview = {
        config: live,
        option: current,
        amount: rawAmount,
        quote: currentQuote,
      };
      const resultFees = await estimatePrimaryPurchase({
        tezos,
        review: nextReview,
      });
      setFees({
        networkFee: toHuman(String(resultFees.networkFee)),
        gasFee: toHuman(String(resultFees.gasFee)),
      });
      setReview(nextReview);
      setIsConfirmationOpen(true);
    } catch (error) {
      setActionError((error as Error).message);
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className={formStyles.buySellRoot}>
      {(query.error || actionError || estimateError) && (
        <button
          type="button"
          onClick={() => {
            setActionError(undefined);
            void refetch();
          }}
        >
          Refresh purchase quote
        </button>
      )}
      <BuySellScreen
        metadata={metadata}
        tokenAddress={asset.address}
        actionType={BUY}
        actionCb={() => {
          void handleReview();
        }}
        amount={paymentAmount}
        setAmount={setBudget}
        total={paymentAmount}
        tokenPrice={toHuman(option.price)}
        networkFee={fees.networkFee}
        gasFee={fees.gasFee}
        apy={asset.apy}
        status={status}
        isOrderDataLoading={
          isPreparing || query.isFetching || isConfirmationOpen
        }
        validationMessage={
          query.error?.message ??
          config.unavailableReason ??
          amountError ??
          actionError ??
          estimateError
        }
        primaryPurchase={{
          receiveAmount: amount,
          onReceiveChange: handleReceiveChange,
          isEligible: true,
          includedFee: toHuman(quote.fee),
        }}
      />
      {config.pendingDistribution !== "0" && (
        <p>
          {toHuman(config.pendingDistribution).toFixed()}{" "}
          {asset.metadata.symbol} allocated, pending distribution.
        </p>
      )}
      <TradeConfirmationPopup
        isOpen={isConfirmationOpen}
        onCancel={() => setIsConfirmationOpen(false)}
        onContinue={invokeAction}
        title="Confirm Purchase"
        description="Review your fixed-price purchase and accept the agreements below. The payment cap excludes the wallet's MAV network fee."
        deliveryMessage={
          review?.config.distribution === "MANUAL"
            ? "Your tokens will be allocated pending distribution,"
            : undefined
        }
      >
        {review && (
          <dl>
            <dt>Launch / sale option</dt>
            <dd>
              {review.config.launchName} / {review.option.name}
            </dd>
            <dt>Receive</dt>
            <dd>
              {toHuman(review.amount).toFixed()} {asset.metadata.symbol}
              {review.config.distribution === "MANUAL"
                ? " (allocated, pending distribution)"
                : ""}
            </dd>
            <dt>Maximum payment</dt>
            <dd>{toHuman(review.quote.totalPayment).toFixed()} wUSDT</dd>
            <dt>Purchase fee (included)</dt>
            <dd>{toHuman(review.quote.fee).toFixed()} wUSDT</dd>
          </dl>
        )}
      </TradeConfirmationPopup>
    </div>
  );
}
