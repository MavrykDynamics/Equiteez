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
import { calculateEstFee } from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { atomsToTokens } from "~/lib/utils/formaters";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ZERO } from "~/lib/utils/numbers";

type BuySellLimitScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  limitPrice: BigNumber | undefined;
  setLimitPrice: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
};

export const BuySellLimitScreen: FC<BuySellLimitScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  amount,
  total,
  limitPrice,
  setAmount,
  setLimitPrice,
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

  const marketTokenPrice = useMemo(
    () =>
      atomsToTokens(
        orderbookStorages[slug]?.lowestSellPrice,
        selectedAssetMetadata.decimals
      ),
    [orderbookStorages, slug, selectedAssetMetadata.decimals]
  );

  const tokenPrice = useMemo(
    () => limitPrice || new BigNumber(0),
    [limitPrice]
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
  const hasTotalError = useMemo(
    () => total && total.gt(usdBalance),
    [total, usdBalance]
  );

  const hasSellTokensBalanceError = useMemo(
    () => !isBuyAction && amount && amount.gt(tokenBalance),
    [amount, isBuyAction, tokenBalance]
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

  const input1Props = useMemo(() => {
    return {
      amount: limitPrice,
      selectedAssetSlug: orderbookTokenPair[slug],
      selectedAssetMetadata: stableCoinMetadata,
      label: "Price",
    };
  }, [orderbookTokenPair, limitPrice, slug, stableCoinMetadata]);

  const input2Props = useMemo(() => {
    return {
      amount,
      selectedAssetSlug: slug,
      selectedAssetMetadata: selectedAssetMetadata,
      label: "Amount",
    };
  }, [selectedAssetMetadata, slug, amount]);

  const balanceTotal = total;

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
      tokenDecimals: stableCoinMetadata?.decimals,
      isFeeInTokens: isBuyAction,
    });
  }, [
    amount,
    isBuyAction,
    orderbookStorages,
    slug,
    stableCoinMetadata?.decimals,
    tokenPrice,
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
      const percentage = new BigNumber(selectedPercentage);
      const newAmount = new BigNumber(tokenBalance)
        .multipliedBy(percentage)
        .dividedBy(100);
      setAmount(newAmount);
    }
  }, [selectedPercentage, setAmount, tokenBalance]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <BalanceInputWithTotal
              ref={ref1}
              onNext={() => ref2.current?.focus()}
              onChange={(data) => setLimitPrice(data)}
              amountInputDisabled={false}
              errorCaption={
                hasTotalError
                  ? "The amount entered exceeds your available balance."
                  : undefined
              }
              {...input1Props}
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata?.decimals}
              cryptoDecimals={stableCoinMetadata?.decimals}
              cryptoValue={usdBalance}
            />

            <BalanceInputWithTotal
              ref={ref2}
              onNext={() => ref3.current?.focus()}
              onPrev={() => ref1.current?.focus()}
              onChange={handleOutputChange}
              amountInputDisabled={false}
              errorCaption={
                hasSellTokensBalanceError
                  ? "The amount entered exceeds your available balance."
                  : undefined
              }
              {...input2Props}
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata?.decimals}
              cryptoDecimals={stableCoinMetadata?.decimals}
              cryptoValue={tokenBalance}
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
                label="Total"
                amount={balanceTotal}
                selectedAssetSlug={orderbookTokenPair[slug]}
                selectedAssetMetadata={stableCoinMetadata}
                balanceTotal={balanceTotal}
                decimals={selectedAssetMetadata?.decimals}
                cryptoDecimals={stableCoinMetadata?.decimals}
                cryptoValue={balanceTotal?.toNumber() || 0}
              />
            </div>

            <FeesCard
              txnFees={0}
              //TODO add totalAmount
              totalAmount={0}
              networkfee={0}
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
