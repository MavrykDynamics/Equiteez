import {
  useCallback,
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
import { BUY } from "~/lib/organisms/PriceSection/consts";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import { primaryPurchase } from "~/contracts/primaryPurchase.contract";
import {
  primaryAmountForBudget,
  quotePrimaryPurchase,
  validatePrimaryAmount,
} from "~/contracts/primaryPurchase.quote";
import type { PrimaryPurchaseConfig } from "~/contracts/primaryPurchase.types";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { DepositFunds } from "~/routes/_index/components/DepositFunds/DepositFunds";
import depositStyles from "~/routes/_index/components/DepositFunds/styles.module.css";
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
  const { connect, isKyced } = useUserContext();
  const config = query.data;
  // Temporary ANTH style preview; production continues to use API dates.
  const [previewCountdown] = useState(() => {
    const startsAt = Date.now() + (2 * 86400 + 5 * 3600 + 30 * 60) * 1000;
    return {
      saleStart: new Date(startsAt).toISOString(),
      saleEnd: new Date(startsAt + 86400000).toISOString(),
    };
  });
  const countdown =
    import.meta.env.DEV && asset.metadata.symbol === "ANTH"
      ? previewCountdown
      : config?.countdown;
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
      {countdown && (
        <RTradingCountdown {...countdown}>
          {isKyced ? (
            <DepositFunds label="Deposit Funds" />
          ) : (
            <div className={depositStyles.wrapper}>
              <RButton
                className={depositStyles.depositButton}
                disabled
                iconLeft={<RIcon aria-hidden="true" name="square-account" />}
                size="medium"
                tone="black"
              >
                Start KYC
              </RButton>
            </div>
          )}
        </RTradingCountdown>
      )}
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
  const [actionError, setActionError] = useState<string>();
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
        setFees({ networkFee: ZERO, gasFee: ZERO });
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
    setFees({ networkFee: ZERO, gasFee: ZERO });
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

  const { refetch, refreshAfterPurchase } = query;
  const executePurchase = useCallback(
    async (params: Parameters<typeof primaryPurchase>[0]) => {
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
        if (!current)
          throw new Error("This sale option is no longer available.");
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
        await primaryPurchase({
          ...params,
          review: nextReview,
          onEstimated: (resultFees) => {
            setFees({
              networkFee: toHuman(String(resultFees.networkFee)),
              gasFee: toHuman(String(resultFees.gasFee)),
            });
          },
        });
      } catch (error) {
        setActionError((error as Error).message);
        await refetch();
        throw error;
      }
    },
    [refetch, rawAmount, option, quote, config.distribution]
  );
  const { invokeAction, status, isLoading } = useContractAction(
    executePurchase,
    { review: { config, option, amount: rawAmount, quote } },
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
        setActionError(undefined);
        refreshAfterPurchase(metadata);
      },
    }
  );

  return (
    <div className={formStyles.buySellRoot}>
      {(query.error || actionError) && (
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
        actionCb={invokeAction}
        amount={paymentAmount}
        setAmount={setBudget}
        total={paymentAmount}
        tokenPrice={toHuman(option.price)}
        networkFee={fees.networkFee}
        gasFee={fees.gasFee}
        apy={asset.apy}
        status={status}
        isOrderDataLoading={isLoading || query.isFetching}
        validationMessage={
          query.error?.message ??
          config.unavailableReason ??
          amountError ??
          actionError
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
    </div>
  );
}
