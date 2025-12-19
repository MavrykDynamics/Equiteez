import { FC, useCallback, useMemo, useRef, useState } from "react";
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
import { calculateEstFee } from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { atomsToTokens } from "~/lib/utils/formaters";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { ZERO } from "~/lib/utils/numbers";
import Money from "~/lib/atoms/Money";

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  slippagePercentage: string;
  setSlippagePercentage: React.Dispatch<React.SetStateAction<string>>;
  hasQuoteError?: boolean;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  amount,
  // total,
  setAmount,
  slippagePercentage,
  // setSlippagePercentage,
  hasQuoteError = false,
}) => {
  const { token_address, slug } = estate;
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

  const tokenPrice = useMemo(
    () =>
      atomsToTokens(
        orderbookStorages[slug]?.lowestSellPrice,
        selectedAssetMetadata.decimals
      ),
    [orderbookStorages, slug, selectedAssetMetadata.decimals]
  );

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
            label: "Sell",
          }
        : {
            amount,
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
            label: "Buy",
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

  const estFee = useMemo(() => {
    const { buyOrderFee, sellOrderFee } = orderbookStorages[slug] ?? {
      buyOrderFee: 0,
      sellOrderFee: 0,
    };

    const tokensAmount = amount || ZERO;
    const fee = isBuyAction ? buyOrderFee : sellOrderFee;

    return calculateEstFee({
      amount: tokensAmount,
      price: tokenPrice,
      fee,
      tokenDecimals: stableCoinMetadata.decimals,
      isFeeInTokens: isBuyAction,
    });
  }, [
    amount,
    isBuyAction,
    orderbookStorages,
    slug,
    stableCoinMetadata.decimals,
    tokenPrice,
  ]);

  const isBtnDisabled =
    hasTotalError || !amount || slippagePercentage.length <= 0 || !isKyced;

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
              balanceTotal={balanceTotal}
              decimals={stableCoinMetadata?.decimals}
              cryptoValue={
                new BigNumber(isBuyAction ? usdBalance : tokenBalance)
              }
              additionalBottomLeftBlock={
                isBuyAction ? undefined : (
                  //TODO add market
                  <div className="text-xs text-sand-600">
                    Market $<Money>{45}</Money>
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
                  //TODO add price
                  <div className="text-xs text-sand-600">
                    Price $<Money>{2.23}</Money>
                  </div>
                ) : undefined
              }
              {...input2Props}
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
              txnFees={0}
              //TODO add totalAmount
              totalAmount={0}
              networkfee={0}
            />

            <ProjectionCard
              apy={0}
              monthkyReturns={0}
              yearlyReturns={0}
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
