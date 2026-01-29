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
import { stablecoinContract } from "~/consts/contracts";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useAssetMetadata } from "~/lib/metadata";
import { Alert } from "~/templates/Alert/Alert";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { ZERO } from "~/lib/utils/numbers";
import Money from "~/lib/atoms/Money";
import { atomsToTokens } from "~/lib/utils/formaters";

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  networkFee: BigNumber;
  tokenPrice: BigNumber;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  hasQuoteError?: boolean;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  amount,
  total,
  networkFee,
  tokenPrice,
  setAmount,
  hasQuoteError = false,
}) => {
  const { token_address, slug, assetDetails } = estate;
  const { orderbookTokenPair, orderbookStorages } = useDexContext();

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const { userTokensBalances, isKyced } = useUserContext();

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const stableCoinMetadata = useAssetMetadata(orderbookTokenPair[slug]);
  const selectedAssetMetadata = useAssetMetadata(slug);

  const usdBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[token_address]?.toNumber() || 0,
    [userTokensBalances, token_address]
  );

  const isBuyAction = actionType === BUY;
  const hasTotalError = isBuyAction
    ? amount
      ? amount.toNumber() > usdBalance
      : false
    : amount
      ? amount?.toNumber() > tokenBalance
      : false;

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
      else setAmount(val?.div(tokenPrice) ?? new BigNumber(0));
    },
    [isBuyAction, setAmount, tokenPrice]
  );

  const input1Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount,
            selectedAssetSlug: orderbookTokenPair[slug],
            selectedAssetMetadata: stableCoinMetadata,
          }
        : {
            amount,
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
          },
    [
      amount,
      orderbookTokenPair,
      isBuyAction,
      selectedAssetMetadata,
      slug,
      stableCoinMetadata,
    ]
  );

  const input2Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount: amount?.div(tokenPrice) || undefined, // BUY: USDT -> Token
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
          }
        : {
            amount: amount?.times(tokenPrice) || undefined, // SELL: Token -> USDT
            selectedAssetSlug: orderbookTokenPair[slug],
            selectedAssetMetadata: stableCoinMetadata,
          },
    [
      amount,
      orderbookTokenPair,
      isBuyAction,
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

  const isBtnDisabled = hasTotalError || !amount || !isKyced;

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
    const { buyOrderFee, sellOrderFee } = orderbookStorages[slug] ?? {
      finalTotalValue: 0,
      txnFee: 0,
    };

    const fee = isBuyAction
      ? atomsToTokens(buyOrderFee, stableCoinMetadata?.decimals)
      : atomsToTokens(sellOrderFee, stableCoinMetadata?.decimals);

    const finalTotalValue = (isBuyAction ? amount : total) ?? ZERO;

    return {
      finalTotalValue: finalTotalValue?.plus(fee)?.plus(networkFee) || ZERO,
      txnFee: fee,
    };
  }, [
    amount,
    isBuyAction,
    networkFee,
    orderbookStorages,
    slug,
    stableCoinMetadata?.decimals,
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
                hasTotalError
                  ? "The amount entered exceeds your available balance."
                  : undefined
              }
              {...input1Props}
              label="Sell"
              balanceTotal={balanceTotal}
              decimals={stableCoinMetadata?.decimals}
              cryptoValue={
                new BigNumber(isBuyAction ? usdBalance : tokenBalance)
              }
              additionalBottomLeftBlock={
                isBuyAction ? undefined : (
                  <div className="text-xs text-sand-600">
                    Market $<Money>{tokenPrice}</Money>
                  </div>
                )
              }
              cryptoDecimals={
                isBuyAction
                  ? stableCoinMetadata?.decimals
                  : selectedAssetMetadata?.decimals
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
              decimals={stableCoinMetadata?.decimals}
              cryptoValue={
                new BigNumber(isBuyAction ? tokenBalance : usdBalance)
              }
              cryptoDecimals={
                !isBuyAction
                  ? stableCoinMetadata?.decimals
                  : selectedAssetMetadata?.decimals
              }
            />

            <ESnakeblock
              selectedOption={selectedPercentage}
              setSelectedOption={setSelectedPercentage}
            />

            <FeesCard
              txnFees={txnFee}
              totalAmount={finalTotalValue}
              networkfee={networkFee}
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

      <Button
        className="mt-8"
        onClick={handleContinueClick}
        disabled={isBtnDisabled}
      >
        Continue
      </Button>
    </div>
  );
};
