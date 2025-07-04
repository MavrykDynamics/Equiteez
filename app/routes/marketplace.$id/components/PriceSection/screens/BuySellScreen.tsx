import { FC, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "~/lib/atoms/Button";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import {
  ClickableExpanderArea,
  CustomExpander,
  ExpanderBodyContent,
  ExpanderFaceContent,
} from "~/lib/organisms/CustomExpander/CustomExpander";

import * as gtag from "app/utils/gtags.client";

// icons
import CheckIcon from "app/icons/ok.svg?react";
import {
  BUY,
  BuyScreenState,
  CONFIRM,
  SellScreenState,
  OrderType,
  SELL,
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
import { spippageOptions } from "../popups";
import { WarningBlock } from "~/lib/molecules/WarningBlock";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useAssetMetadata } from "~/lib/metadata";
import {
  calculateEstFee,
  calculateMinReceived,
  detectQuoteTokenLimit,
  getTokenAmountFromLiquidity,
} from "~/providers/Dexprovider/utils";
import { Alert } from "~/templates/Alert/Alert";
import { MIN_BASE_TOKEN_AMOUNT_TO_SHOW_ALERT } from "./buySell.consts";
import { atomsToTokens, downgradeDecimals } from "~/lib/utils/formaters";

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
  total,
  setAmount,
  slippagePercentage,
  setSlippagePercentage,
  hasQuoteError = false,
}) => {
  const { symbol, token_address, slug } = estate;
  const { dodoTokenPair, dodoMav, dodoStorages } = useDexContext();
  const { tokensMetadata } = useTokensContext();

  const { userTokensBalances, isKyced } = useUserContext();

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const stableCoinMetadata = useAssetMetadata(dodoTokenPair[slug]);
  const selectedAssetMetadata = useAssetMetadata(slug);

  const tokenPrice = useMemo(
    () => atomsToTokens(dodoMav[slug], selectedAssetMetadata.decimals),
    [dodoMav, slug, selectedAssetMetadata.decimals]
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
            selectedAssetSlug: dodoTokenPair[slug],
            selectedAssetMetadata: stableCoinMetadata,
            label: "You Pay",
          }
        : {
            amount,
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
            label: "You Sell",
          },
    [
      amount,
      dodoTokenPair,
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
            amount: amount?.div(tokenPrice) || undefined,
            selectedAssetSlug: slug,
            selectedAssetMetadata: selectedAssetMetadata,
          }
        : {
            amount: amount?.times(tokenPrice) || undefined,
            selectedAssetSlug: dodoTokenPair[slug],
            selectedAssetMetadata: stableCoinMetadata,
          },
    [
      amount,
      dodoTokenPair,
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
      slippagePercentage,
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
    slippagePercentage,
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
      slippagePercentage,
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
    slippagePercentage,
    slug,
    stableCoinMetadata.decimals,
    tokenPrice,
  ]);

  const symbolToShow = isBuyAction
    ? symbol
    : tokensMetadata[toTokenSlug(stablecoinContract)]?.symbol;

  const hasQuoteTokenLimitWarning = useMemo(
    () =>
      detectQuoteTokenLimit(
        dodoStorages[slug],
        amount,
        isBuyAction ? BUY : SELL
      ),
    [dodoStorages, slug, amount, isBuyAction]
  );

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
              label="You Receive"
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

            {Number(slippagePercentage) <= 0 && (
              <WarningBlock>
                Slippage is {slippagePercentage || "0"}%
              </WarningBlock>
            )}

            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col">
              <CustomExpander>
                <ClickableExpanderArea>
                  <ExpanderFaceContent>
                    <div className="text-body-xs font-semibold text-content flex items-center w-full">
                      1 {symbol} =&nbsp;
                      <div>
                        <span className="-mr-[1px]">$</span>
                        <Money fiat>{tokenPrice || "0"}</Money>
                      </div>
                    </div>
                  </ExpanderFaceContent>
                </ClickableExpanderArea>
                <ExpanderBodyContent>
                  <div className="mt-4 flex flex-col">
                    <div className="mt-2 text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Min Received
                        {/* <InfoTooltip content="Min Received" /> */}
                      </div>
                      <div>
                        <Money smallFractionFont={false} shortened>
                          {minReceived}
                        </Money>
                        &nbsp;{symbolToShow}
                      </div>
                    </div>
                    <div className="mt-2 text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Slippage
                        {/* <InfoTooltip content="Slippage" /> */}
                      </div>
                      <SlippageDropdown
                        slippagePercentage={slippagePercentage}
                        setSlippagePercentage={setSlippagePercentage}
                      />
                    </div>
                    <div className="mt-[10px] text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Est. Fee
                        {/* <InfoTooltip content="Est fee" /> */}
                      </div>
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
      {baseTokenAmount.lt(MIN_BASE_TOKEN_AMOUNT_TO_SHOW_ALERT) && (
        <div className="mt-8">
          <Alert type="warning" header="Low Liquidity Detected!" expandable>
            The liquidity for {symbol} is critically low. Transactions may
            experience high slippage or failure.
          </Alert>
        </div>
      )}

      {hasQuoteTokenLimitWarning && (
        <div className="mt-8">
          <Alert type="warning" header="Pool Balance Limit Reached" expandable>
            Your trade will exceed the pool limit, which may cause slippage or
            failure. Please adjust the amount and try again.
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

type SlippageDropdownProps = {
  slippagePercentage: string;
  setSlippagePercentage: (val: string) => void;
};

const SlippageDropdown: FC<SlippageDropdownProps> = ({
  slippagePercentage,
  setSlippagePercentage,
}) => {
  const [selectedOption, setSelectedOption] = useState(spippageOptions[0]);

  const isCustom = selectedOption === "custom";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1")
      .replace(/(\d+\.\d?).*/g, "$1");

    // min max +- 100
    const parsedValue = parseFloat(value);
    if (parsedValue && parsedValue > 100) {
      return;
    }

    setSlippagePercentage(value);
  };

  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <div className="px-2 py-1 border border-dark-green-100 rounded-lg bg-white">
          <DropdownFaceContent gap={1}>
            <div className="max-w-10 text-nowrap w-fit">
              <input
                type="text"
                value={isCustom ? slippagePercentage : selectedOption}
                onChange={handleInputChange}
                name={"slippage"}
                className="w-8 text-right"
                disabled={!isCustom}
              />
              %
            </div>
          </DropdownFaceContent>
        </div>
        {slippagePercentage.length === 0 && (
          <span className="text-error">Required</span>
        )}
        <DropdownBodyContent customWidth={113} position="right" topMargin={12}>
          <div className="flex flex-col">
            {spippageOptions.map((option) => (
              <button
                key={option}
                className="py-3 px-4 bg-white flex items-center justify-between hover:bg-dark-green-100 capitalize"
                onClick={() => {
                  setSelectedOption(option);
                  if (option !== "custom") {
                    setSlippagePercentage(option);
                  }
                }}
              >
                {option.concat(option !== "custom" ? "%" : "")}
                {option === selectedOption && (
                  <CheckIcon className="size-4 stroke-dark-green-500" />
                )}
              </button>
            ))}
          </div>
        </DropdownBodyContent>
      </ClickableDropdownArea>
    </CustomDropdown>
  );
};
