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
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ZERO } from "~/lib/utils/numbers";
import { AssetView } from "~/templates/BalanceInput/AssetView";
import { PercentBlock } from "~/routes/marketplace.$id/components/PriceSection/components/PercentBlock/PercentBlock";
import Money from "~/lib/atoms/Money";
import { atomsToTokens } from "~/lib/utils/formaters";

type BuySellLimitScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  marketTokenPrice: BigNumber;
  total: BigNumber | undefined;
  networkFee: BigNumber;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  limitPrice: BigNumber | undefined;
  setLimitPrice: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  handleSlippageChange: (value: number) => void;
};

export const BuySellLimitScreen: FC<BuySellLimitScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  amount,
  total,
  networkFee,
  limitPrice,
  setAmount,
  setLimitPrice,
  marketTokenPrice,
  handleSlippageChange,
}) => {
  const { token_address, slug } = estate;
  const { orderbookTokenPair, orderbookStorages } = useDexContext();

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const { userTokensBalances, isKyced } = useUserContext();

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
  const hasTotalError = useMemo(
    () => total && total.gt(usdBalance),
    [total, usdBalance]
  );

  const hasSellTokensBalanceError = useMemo(
    () => !isBuyAction && amount && amount.gt(tokenBalance),
    [amount, isBuyAction, tokenBalance]
  );

  const hasBuyTokensBalanceError = useMemo(
    () => isBuyAction && limitPrice && limitPrice.gt(usdBalance),
    [limitPrice, isBuyAction, usdBalance]
  );

  const handleContinueClick = useCallback(() => {
    toggleScreen(CONFIRM);

    gtag.event({
      action: "limit_buy_base_token",
      category: "Limit Buy base token",
      label: "Limit Buy base token",
    });
  }, [toggleScreen]);

  const handleOutputChange = useCallback(
    (val: BigNumber | undefined) => {
      setAmount(val);
    },
    [setAmount]
  );

  const { input1Props, input2Props } = useMemo(() => {
    const buyProps = {
      amount: limitPrice,
      selectedAssetSlug: orderbookTokenPair[slug],
      selectedAssetMetadata: stableCoinMetadata,
      onChange: setLimitPrice,
      cryptoValue: usdBalance,
      errorCaption: hasBuyTokensBalanceError
        ? "The amount entered exceeds your available balance."
        : undefined,
    };

    const sellProps = {
      amount: amount,
      selectedAssetSlug: slug,
      selectedAssetMetadata: selectedAssetMetadata,
      onChange: handleOutputChange,
      cryptoValue: tokenBalance,
      errorCaption: hasSellTokensBalanceError
        ? "The amount entered exceeds your available balance."
        : undefined,
    };

    return isBuyAction
      ? { input1Props: buyProps, input2Props: sellProps }
      : { input1Props: sellProps, input2Props: buyProps };
  }, [
    amount,
    handleOutputChange,
    hasBuyTokensBalanceError,
    hasSellTokensBalanceError,
    isBuyAction,
    limitPrice,
    orderbookTokenPair,
    selectedAssetMetadata,
    setLimitPrice,
    slug,
    stableCoinMetadata,
    tokenBalance,
    usdBalance,
  ]);

  const balanceTotal = total;

  const { finalTotalValue, txnFee } = useMemo(() => {
    const { buyOrderFee, sellOrderFee } = orderbookStorages[slug] ?? {
      total: 0,
      txnFee: 0,
    };

    const fee = isBuyAction
      ? atomsToTokens(buyOrderFee, stableCoinMetadata?.decimals)
      : atomsToTokens(sellOrderFee, stableCoinMetadata?.decimals);

    return {
      finalTotalValue: total?.plus(fee) || ZERO,
      txnFee: fee,
    };
  }, [
    isBuyAction,
    orderbookStorages,
    slug,
    stableCoinMetadata?.decimals,
    total,
  ]);

  const isBtnDisabled =
    hasTotalError ||
    !amount ||
    !isKyced ||
    !limitPrice ||
    limitPrice?.isZero() ||
    amount?.isZero();

  useEffect(() => {
    if (selectedPercentage != null) {
      if (isBuyAction) {
        const percentage = new BigNumber(selectedPercentage);
        const newAmount = new BigNumber(usdBalance)
          .multipliedBy(percentage)
          .dividedBy(100);
        setLimitPrice(newAmount);
      } else {
        const percentage = new BigNumber(selectedPercentage);
        const newAmount = new BigNumber(tokenBalance)
          .multipliedBy(percentage)
          .dividedBy(100);
        setAmount(newAmount);
      }
    }
  }, [
    isBuyAction,
    selectedPercentage,
    setAmount,
    setLimitPrice,
    tokenBalance,
    usdBalance,
  ]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <BalanceInputWithTotal
              ref={ref1}
              onNext={() => ref2.current?.focus()}
              amountInputDisabled={false}
              {...input1Props}
              label="I Want To Allocate"
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata?.decimals}
              cryptoDecimals={stableCoinMetadata?.decimals}
            />

            <BalanceInputWithTotal
              ref={ref2}
              onNext={() => ref3.current?.focus()}
              onPrev={() => ref1.current?.focus()}
              amountInputDisabled={false}
              additionalBottomRightBlock={
                <div className="text-xs text-sand-600 font-semibold">
                  Est. Received
                </div>
              }
              {...input2Props}
              label="To Buy"
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata?.decimals}
              cryptoDecimals={stableCoinMetadata?.decimals}
            />

            {/* ------------------------------------------------------------------------------------------- */}
            <div>
              <div className="my-3">
                <ESnakeblock
                  selectedOption={selectedPercentage}
                  setSelectedOption={setSelectedPercentage}
                />
              </div>

              <BalanceInputWithTotal
                ref={ref3}
                onPrev={() => ref2.current?.focus()}
                amountInputDisabled
                amount={balanceTotal}
                additionalTopRightBlock=" "
                additionalBottomRightBlock={
                  <PercentBlock
                    isBuyAction={isBuyAction}
                    handleSlippageChange={handleSlippageChange}
                  />
                }
                label={
                  <div className="flex items-center gap-[4px] text-xs text-sand-600">
                    Take Profit when{" "}
                    <AssetView selectedAssetSlug={slug} isSmallView />
                  </div>
                }
                additionalBottomLeftBlock={
                  <div className="text-xs text-sand-600">
                    Market{" "}
                    <span className="font-semibold underline">
                      $<Money>{marketTokenPrice}</Money>
                    </span>
                  </div>
                }
                selectedAssetSlug={orderbookTokenPair[slug]}
                selectedAssetMetadata={stableCoinMetadata}
                balanceTotal={balanceTotal}
                decimals={selectedAssetMetadata?.decimals}
                cryptoDecimals={stableCoinMetadata?.decimals}
                cryptoValue={balanceTotal?.toNumber() || 0}
              />
            </div>

            <FeesCard
              txnFees={txnFee}
              totalAmount={finalTotalValue}
              networkfee={networkFee}
            />

            <div className="mt-3">
              <ProjectionCard
                apy={0}
                monthkyReturns={0}
                yearlyReturns={0}
                gradient={isBuyAction ? "blue" : "orange"}
              />
            </div>
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
