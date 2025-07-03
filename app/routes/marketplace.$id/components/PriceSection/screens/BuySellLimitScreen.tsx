import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/lib/atoms/Button";

import {
  ClickableExpanderArea,
  CustomExpander,
  ExpanderBodyContent,
  ExpanderFaceContent,
} from "~/lib/organisms/CustomExpander/CustomExpander";

import * as gtag from "app/utils/gtags.client";

// icons
import {
  BUY,
  BuyScreenState,
  CONFIRM,
  SellScreenState,
  OrderType,
} from "../consts";
import Money from "~/lib/atoms/Money";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { stablecoinContract } from "~/consts/contracts";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { BalanceInputWithTotal } from "~/templates/BalanceInput";
import { toTokenSlug } from "~/lib/assets";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useAssetMetadata } from "~/lib/metadata";
import {
  calculateEstFee,
  calculateMinReceived,
  getTokenAmountFromLiquidity,
} from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { MIN_BASE_TOKEN_AMOUNT_TO_SHOW_ALERT } from "./buySell.consts";
import { atomsToTokens, downgradeDecimals } from "~/lib/utils/formaters";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";

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
  const { symbol, token_address, slug } = estate;
  const { dodoTokenPair, dodoStorages, dodoMav } = useDexContext();
  const { tokensMetadata } = useTokensContext();

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const { userTokensBalances, isKyced } = useUserContext();

  const stableCoinMetadata = useAssetMetadata(dodoTokenPair[slug]);
  const selectedAssetMetadata = useAssetMetadata(slug);

  const marketTokenPrice = useMemo(
    () => atomsToTokens(dodoMav[slug], selectedAssetMetadata.decimals),
    [dodoMav, slug, selectedAssetMetadata.decimals]
  );

  const tokenPrice = useMemo(
    () => limitPrice || new BigNumber(0),
    [limitPrice]
  );

  const baseTokenAmount = useMemo(
    () => getTokenAmountFromLiquidity(dodoStorages[slug], tokenPrice),
    [dodoStorages, slug, tokenPrice]
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
      selectedAssetSlug: dodoTokenPair[slug],
      selectedAssetMetadata: stableCoinMetadata,
      label: "Price",
    };
  }, [dodoTokenPair, limitPrice, slug, stableCoinMetadata]);

  const input2Props = useMemo(() => {
    return {
      amount,
      selectedAssetSlug: slug,
      selectedAssetMetadata: selectedAssetMetadata,
      label: "Amount",
    };
  }, [selectedAssetMetadata, slug, amount]);

  const balanceTotal = total;

  const minReceived = useMemo(() => {
    if (!total) return 0;
    const tokensAmount = !isBuyAction ? input1Props.amount : input2Props.amount;

    if (!tokensAmount) return "0";

    const decimals = isBuyAction
      ? selectedAssetMetadata.decimals
      : stableCoinMetadata.decimals;
    return calculateMinReceived(
      tokensAmount,
      tokenPrice,
      "0",
      decimals,
      isBuyAction
    );
  }, [
    total,
    isBuyAction,
    input1Props.amount,
    input2Props.amount,
    selectedAssetMetadata.decimals,
    stableCoinMetadata.decimals,
    tokenPrice,
  ]);

  const estFee = useMemo(() => {
    const {
      config: { lpFee, maintainerFee, feeDecimals },
    } = dodoStorages[slug];

    const tokensAmount = isBuyAction ? input2Props.amount : input1Props.amount;

    const result = calculateEstFee(
      tokensAmount,
      tokenPrice,
      lpFee,
      maintainerFee,
      Number(feeDecimals),
      "0",
      isBuyAction
    );

    const decimals = isBuyAction
      ? selectedAssetMetadata.decimals
      : stableCoinMetadata.decimals;

    return downgradeDecimals(result, decimals);
  }, [
    dodoStorages,
    input1Props.amount,
    input2Props.amount,
    isBuyAction,
    selectedAssetMetadata.decimals,
    slug,
    stableCoinMetadata.decimals,
    tokenPrice,
  ]);

  const symbolToShow = isBuyAction
    ? symbol
    : tokensMetadata[toTokenSlug(stablecoinContract)]?.symbol;

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
              <div className="my-4">
                <ESnakeblock
                  selectedOption={selectedPercentage}
                  setSelectedOption={setSelectedPercentage}
                  size="large"
                />
              </div>

              <BalanceInputWithTotal
                ref={ref3}
                onPrev={() => ref2.current?.focus()}
                amountInputDisabled
                label="Total"
                amount={balanceTotal}
                selectedAssetSlug={dodoTokenPair[slug]}
                selectedAssetMetadata={stableCoinMetadata}
                balanceTotal={balanceTotal}
                decimals={selectedAssetMetadata?.decimals}
                cryptoDecimals={stableCoinMetadata?.decimals}
                cryptoValue={balanceTotal?.toNumber() || 0}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col">
              <CustomExpander>
                <ClickableExpanderArea>
                  <ExpanderFaceContent>
                    <div className="text-body-xs font-semibold text-content flex items-center w-full">
                      1 {symbol} =&nbsp;
                      <div>
                        <span className="-mr-[1px]">$</span>
                        <Money fiat>{marketTokenPrice || "0"}</Money>
                      </div>
                    </div>
                  </ExpanderFaceContent>
                </ClickableExpanderArea>
                <ExpanderBodyContent>
                  <div className="mt-4 flex flex-col">
                    <div className="mt-2 text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Min Received
                      </div>
                      <div>
                        <Money smallFractionFont={false} shortened>
                          {minReceived}
                        </Money>
                        &nbsp;{symbolToShow}
                      </div>
                    </div>

                    <div className="mt-[10px] text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">Est. Fee</div>
                      <div>
                        {estFee}
                        &nbsp;{symbolToShow}
                      </div>
                    </div>
                  </div>
                </ExpanderBodyContent>
              </CustomExpander>
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
      {baseTokenAmount.lt(MIN_BASE_TOKEN_AMOUNT_TO_SHOW_ALERT) &&
        total &&
        !total.isZero() && (
          <div className="mt-8">
            <Alert type="warning" header="Low Liquidity Detected!" expandable>
              The liquidity for {symbol} is critically low. Transactions may
              experience high slippage or failure.
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
