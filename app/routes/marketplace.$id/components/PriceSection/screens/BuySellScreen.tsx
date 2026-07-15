import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/lib/atoms/Button";

import * as gtag from "app/utils/gtags.client";

// icons
import {
  BUY,
  BuyScreenState,
  CONFIRM,
  SellScreenState,
  OrderType,
} from "../consts";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { fromAssetSlug } from "~/lib/assets";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import {
  calculateOrderValueFee,
  exceedsAvailableBalance,
  safeDivByPrice,
} from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { ZERO } from "~/lib/utils/numbers";
import Money from "~/lib/atoms/Money";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  continueButtonClassName?: string;
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  networkFee: BigNumber;
  tokenPrice: BigNumber;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  hasQuoteError?: boolean;
  buyOrderFee: number;
  sellOrderFee: number;
  isMarketOrderExecutable: boolean;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  continueButtonClassName,
  amount,
  total,
  networkFee,
  tokenPrice,
  setAmount,
  hasQuoteError = false,
  buyOrderFee,
  sellOrderFee,
  isMarketOrderExecutable,
}) => {
  const { token_address, slug, assetDetails } = estate;
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
    () => userTokensBalances[quoteTokenAddress] ?? ZERO,
    [userTokensBalances, quoteTokenAddress]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[token_address] ?? ZERO,
    [userTokensBalances, token_address]
  );

  const isBuyAction = actionType === BUY;
  const hasBalanceError = useMemo(
    () =>
      exceedsAvailableBalance({
        isBuyAction,
        total: amount,
        amount,
        usdBalance,
        tokenBalance,
      }),
    [amount, isBuyAction, tokenBalance, usdBalance]
  );

  const handleContinueClick = useCallback(() => {
    toggleScreen(CONFIRM);

    gtag.event({
      action: "buy_base_token",
      category: "Buy base token",
      label: "Buy base token",
    });
  }, [toggleScreen]);

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

  const hasInvalidAmount = !amount || amount.isZero() || amount.isNaN();
  const hasInvalidPrice =
    !tokenPrice.isFinite() || tokenPrice.isZero() || tokenPrice.isNaN();
  const isBtnDisabled =
    hasBalanceError ||
    hasInvalidAmount ||
    hasInvalidPrice ||
    !isKyced ||
    !isMarketOrderExecutable;

  useEffect(() => {
    if (selectedPercentage != null) {
      const percentage = new BigNumber(selectedPercentage);
      const newAmount = new BigNumber(isBuyAction ? usdBalance : tokenBalance)
        .multipliedBy(percentage)
        .dividedBy(100);
      setAmount(newAmount);
    }
  }, [isBuyAction, selectedPercentage, setAmount, tokenBalance, usdBalance]);

  const { finalTotalValue, txnFee } = useMemo(() => {
    const orderValue = (isBuyAction ? amount : total) ?? ZERO;
    const fee = calculateOrderValueFee({
      fee: isBuyAction ? buyOrderFee : sellOrderFee,
      orderValue,
      tokenDecimals: stableCoinMetadata.decimals,
    });

    return {
      finalTotalValue: orderValue.plus(fee).plus(networkFee) || ZERO,
      txnFee: fee,
    };
  }, [
    amount,
    buyOrderFee,
    isBuyAction,
    networkFee,
    sellOrderFee,
    stableCoinMetadata.decimals,
    total,
  ]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <BalanceInputWithTotal
              ref={ref1}
              onNext={() => ref2.current?.focus()}
              onChange={(data) => setAmount(data)}
              amountInputDisabled={false}
              errorCaption={
                hasBalanceError
                  ? "The amount entered exceeds your available balance."
                  : undefined
              }
              {...input1Props}
              label="Sell"
              balanceTotal={balanceTotal}
              decimals={stableCoinMetadata.decimals}
              cryptoValue={isBuyAction ? usdBalance : tokenBalance}
              additionalBottomLeftBlock={
                isBuyAction ? undefined : (
                  <div className="text-xs text-sand-600">
                    Market $<Money>{tokenPrice}</Money>
                  </div>
                )
              }
              cryptoDecimals={
                isBuyAction
                  ? stableCoinMetadata.decimals
                  : selectedAssetMetadata.decimals
              }
            />

            <BalanceInputWithTotal
              ref={ref2}
              onPrev={() => ref1.current?.focus()}
              onChange={handleOutputChange}
              amountInputDisabled={false}
              additionalBottomLeftBlock={
                isBuyAction ? (
                  <div className="text-xs text-sand-600">
                    Price $<Money>{tokenPrice}</Money>
                  </div>
                ) : undefined
              }
              {...input2Props}
              label="Buy"
              balanceTotal={balanceTotal}
              decimals={stableCoinMetadata.decimals}
              cryptoValue={isBuyAction ? tokenBalance : usdBalance}
              cryptoDecimals={
                !isBuyAction
                  ? stableCoinMetadata.decimals
                  : selectedAssetMetadata.decimals
              }
            />

            <ESnakeblock
              selectedOption={selectedPercentage}
              setSelectedOption={setSelectedPercentage}
            />

            <FeesCard
              txnFees={txnFee}
              totalAmount={finalTotalValue}
              networkCost={networkFee}
            />

            <ProjectionCard
              apy={assetDetails.APY}
              monthkyReturns={assetDetails.financials.expectedIncome.income}
              yearlyReturns={
                assetDetails.financials.expectedIncome.incomePerTokenYearly
              }
              gradient={isBuyAction ? "blue" : "orange"}
            />
          </div>
        </div>
      </div>

      {!isKyced && (
        <div className="mt-8">
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
        <div className="mt-8">
          <Alert type="error" header="Low Quote Detected" expandable>
            The current quote is too low to complete the operation. This may
            happen due to price fluctuations. Please adjust the slippage
            percentage in your settings to ensure a successful transaction.
          </Alert>
        </div>
      )}

      {!isMarketOrderExecutable && (
        <div className="mt-8">
          <Alert type="error" header="Market Order Unavailable" expandable>
            {isBuyAction
              ? "There are no executable sell orders for this market buy."
              : "There are no executable buy orders for this market sell."}
          </Alert>
        </div>
      )}

      <Button
        className={
          continueButtonClassName ? `mt-8 ${continueButtonClassName}` : "mt-8"
        }
        onClick={handleContinueClick}
        disabled={isBtnDisabled}
      >
        Continue
      </Button>
    </div>
  );
};
