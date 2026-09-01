import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import { Button } from "~/lib/atoms/Button";

// icons
import { BUY, OrderType } from "../consts";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { fromAssetSlug } from "~/lib/assets";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import { safeDivByPrice } from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { ZERO } from "~/lib/utils/numbers";
import Money from "~/lib/atoms/Money";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";
import {
  getStatusLabel,
  STATUS_CONFIRMING,
  STATUS_PENDING,
  type StatusFlag,
} from "~/lib/ui/use-status-flag";
import {
  OrderExpiryBlock,
  type OrderExpiryPeriodId,
} from "../components/OrderExpiryBlock/OrderExpiryBlock";

import styles from "./BuySellForm.module.css";

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  actionCb: () => void;
  continueButtonClassName?: string;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  networkFee: BigNumber;
  tokenPrice: BigNumber;
  orderExpiryPeriodId: OrderExpiryPeriodId | null;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setOrderExpiryPeriodId: (periodId: OrderExpiryPeriodId | null) => void;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  status: StatusFlag;
  hasQuoteError?: boolean;
  isOrderDataLoading?: boolean;
  validationMessage?: string;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  actionType,
  actionCb,
  continueButtonClassName,
  amount,
  total,
  networkFee,
  tokenPrice,
  orderExpiryPeriodId,
  setAmount,
  setOrderExpiryPeriodId,
  status,
  hasQuoteError = false,
  isOrderDataLoading = false,
  validationMessage,
}) => {
  const { token_address, slug } = estate;
  const {
    baseTokenMetadata: selectedAssetMetadata,
    quoteTokenMetadata: stableCoinMetadata,
    quoteTokenSlug,
  } = useOrderbookTokenMetadata(estate);

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const { userTokensBalances, isKyced } = useUserContext();

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  // Read the balance of the orderbook's actual quote token, not a hardcoded
  // stablecoin — otherwise markets quoting a different USDT report a $0 balance
  // and the Continue button is wrongly disabled.
  const quoteTokenAddress = useMemo(
    () => fromAssetSlug(quoteTokenSlug)[0],
    [quoteTokenSlug]
  );

  const usdBalance = useMemo(
    () =>
      userTokensBalances[quoteTokenSlug] ??
      userTokensBalances[quoteTokenAddress] ??
      ZERO,
    [quoteTokenAddress, quoteTokenSlug, userTokensBalances]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[slug] ?? userTokensBalances[token_address] ?? ZERO,
    [slug, token_address, userTokensBalances]
  );

  const isBuyAction = actionType === BUY;
  const hasTotalError = isBuyAction
    ? amount
      ? amount.gt(usdBalance)
      : false
    : amount
      ? amount.gt(tokenBalance)
      : false;

  const handleContinueClick = useCallback(() => {
    actionCb();
  }, [actionCb]);

  const handleOutputChange = useCallback(
    (val: BigNumber | undefined) => {
      if (isBuyAction) setAmount(val?.times(tokenPrice) ?? new BigNumber(0));
      else setAmount(safeDivByPrice(val, tokenPrice) ?? new BigNumber(0));
    },
    [isBuyAction, setAmount, tokenPrice]
  );

  const input1Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount,
            selectedAssetSlug: quoteTokenSlug,
            selectedAssetMetadata: stableCoinMetadata,
          }
        : {
            amount,
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
          },
    [
      amount,
      isBuyAction,
      quoteTokenSlug,
      selectedAssetMetadata,
      slug,
      stableCoinMetadata,
    ]
  );

  const input2Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount: safeDivByPrice(amount, tokenPrice), // BUY: USDT -> Token
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
          }
        : {
            amount: amount?.times(tokenPrice) || undefined, // SELL: Token -> USDT
            selectedAssetSlug: quoteTokenSlug,
            selectedAssetMetadata: stableCoinMetadata,
          },
    [
      amount,
      isBuyAction,
      quoteTokenSlug,
      selectedAssetMetadata,
      slug,
      stableCoinMetadata,
      tokenPrice,
    ]
  );

  const balanceTotal = useMemo(
    () =>
      isBuyAction
        ? amount
          ? input1Props.amount
          : new BigNumber(0)
        : amount
          ? input2Props.amount
          : new BigNumber(0),
    [amount, input1Props.amount, input2Props.amount, isBuyAction]
  );

  const hasInvalidMarketPrice = !tokenPrice.isFinite() || tokenPrice.lte(0);
  const hasInvalidAmount = !amount || !amount.isFinite() || amount.lte(0);
  const isLoading = status === STATUS_PENDING || status === STATUS_CONFIRMING;
  const isBtnDisabled =
    hasTotalError ||
    hasInvalidAmount ||
    hasInvalidMarketPrice ||
    isOrderDataLoading ||
    !isKyced ||
    isLoading;
  const isContinueDisabled = isBtnDisabled || Boolean(validationMessage);

  useEffect(() => {
    if (selectedPercentage != null) {
      const percentage = new BigNumber(selectedPercentage);
      const newAmount = new BigNumber(isBuyAction ? usdBalance : tokenBalance)
        .multipliedBy(percentage)
        .dividedBy(100);
      setAmount(newAmount);
    }
  }, [isBuyAction, selectedPercentage, setAmount, tokenBalance, usdBalance]);

  const orderSummaryAmount = useMemo(
    () => (isBuyAction ? amount : total) ?? ZERO,
    [amount, isBuyAction, total]
  );

  const inputClassNames = {
    amountInputClassName: styles.amountInput,
    amountInputContainerClassName: styles.amountInputContainer,
    assetViewClassName: styles.assetPill,
    balanceClassName: styles.balanceText,
    balanceLabel: "Bal.",
    bodyClassName: styles.balanceBody,
    bottomLeftClassName: styles.bottomValue,
    bottomRightClassName: styles.bottomValue,
    className: styles.balanceInput,
    footerClassName: styles.balanceFooter,
    headerClassName: styles.balanceHeader,
    sectionClassName: styles.balanceCard,
    showBalanceIcon: false,
  };

  const pricePerShare = (
    <span className={styles.bottomNote}>
      $<Money>{tokenPrice}</Money> per share
    </span>
  );

  return (
    <div className={styles.form}>
      <div className={styles.content}>
        <div className={styles.fieldStack}>
          <BalanceInputWithTotal
            ref={ref1}
            onNext={() => ref2.current?.focus()}
            onChange={(data) => setAmount(data)}
            amountInputDisabled={false}
            errorCaption={
              hasTotalError
                ? "The amount entered exceeds your available balance."
                : undefined
            }
            {...input1Props}
            balanceTotal={balanceTotal}
            decimals={stableCoinMetadata.decimals}
            cryptoValue={new BigNumber(isBuyAction ? usdBalance : tokenBalance)}
            additionalBottomRightBlock={isBuyAction ? undefined : pricePerShare}
            cryptoDecimals={
              isBuyAction
                ? stableCoinMetadata.decimals
                : selectedAssetMetadata.decimals
            }
            {...inputClassNames}
            label={isBuyAction ? "Pay with" : "Sell"}
          />

          <BalanceInputWithTotal
            ref={ref2}
            onPrev={() => ref1.current?.focus()}
            onChange={handleOutputChange}
            amountInputDisabled={false}
            additionalBottomRightBlock={isBuyAction ? pricePerShare : undefined}
            {...input2Props}
            label="Receive"
            balanceTotal={balanceTotal}
            decimals={stableCoinMetadata.decimals}
            cryptoValue={new BigNumber(isBuyAction ? tokenBalance : usdBalance)}
            cryptoDecimals={
              !isBuyAction
                ? stableCoinMetadata.decimals
                : selectedAssetMetadata.decimals
            }
            {...inputClassNames}
          />

          <div className={styles.snakeWrapper}>
            <ESnakeblock
              selectedOption={selectedPercentage}
              setSelectedOption={setSelectedPercentage}
              variant="neutral"
            />
          </div>

          <OrderExpiryBlock
            selectedPeriodId={orderExpiryPeriodId}
            setSelectedPeriodId={setOrderExpiryPeriodId}
          />

          <FeesCard
            className={styles.summaryCard}
            networkFee={networkFee}
            pricePerShare={tokenPrice}
            totalAmount={orderSummaryAmount}
          />
        </div>
      </div>

      {!isKyced && (
        <div className={styles.alertBlock}>
          <Alert
            type="warning"
            header="Verify with Mavryk Pro to Trade"
            expandable
          >
            Trading on Equiteez requires the Mavryk Pro wallet for enhanced
            security and regulatory compliance. Upgrade to Mavryk Pro inside
            your Mavryk Wallet.
          </Alert>
        </div>
      )}

      {hasQuoteError && (
        <div className={styles.alertBlock}>
          <Alert type="error" header="Low Quote Detected" expandable>
            The current quote is too low to complete the operation. This may
            happen due to price fluctuations. Please adjust the slippage
            percentage in your settings to ensure a successful transaction.
          </Alert>
        </div>
      )}

      {validationMessage && (
        <div className={styles.alertBlock}>
          <Alert type="error" header="Order Cannot Be Submitted" expandable>
            {validationMessage}
          </Alert>
        </div>
      )}

      <Button
        className={clsx(
          styles.submitButton,
          isBuyAction ? styles.buySubmitButton : styles.sellSubmitButton,
          continueButtonClassName
        )}
        onClick={handleContinueClick}
        disabled={isContinueDisabled}
        isLoading={isLoading}
        size="custom"
        textVariant="caption"
        variant="custom"
      >
        {getStatusLabel(status, isBuyAction ? "Buy" : "Sell")}
      </Button>
    </div>
  );
};
