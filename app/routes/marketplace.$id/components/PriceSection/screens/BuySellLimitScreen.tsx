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
import { Alert } from "~/templates/Alert/Alert";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { FeesCard } from "../components/FeesCard/FeesCard";
import { ProjectionCard } from "../components/ProjectionCard/ProjectionCard";
import { ZERO } from "~/lib/utils/numbers";
import Money from "~/lib/atoms/Money";
import {
  deriveQuantityFromPercent,
  exceedsAvailableBalance,
  getDisplayTickSize,
  isPriceAlignedToTickSize,
} from "~/providers/Dexprovider/utils";
import { useOrderbookTokenMetadata } from "../hooks/useOrderbookTokenMetadata";

type BuySellLimitScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  continueButtonClassName?: string;
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  marketTokenPrice: BigNumber;
  total: BigNumber | undefined;
  networkFee: BigNumber;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  limitPrice: BigNumber | undefined;
  rawTickSize: number;
  setLimitPrice: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  validationMessage?: string;
};

export const BuySellLimitScreen: FC<BuySellLimitScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  continueButtonClassName,
  amount,
  total,
  networkFee,
  limitPrice,
  rawTickSize,
  setAmount,
  setLimitPrice,
  marketTokenPrice,
  validationMessage,
}) => {
  const { token_address, slug, assetDetails } = estate;

  const {
    baseTokenMetadata: selectedAssetMetadata,
    quoteTokenMetadata: stableCoinMetadata,
    quoteTokenSlug,
  } = useOrderbookTokenMetadata(estate);

  // input refs
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const { userTokensBalances, isKyced } = useUserContext();

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
  const marketPriceDifference = useMemo(
    () => (limitPrice ? limitPrice.minus(marketTokenPrice) : undefined),
    [limitPrice, marketTokenPrice]
  );
  const displayTickSize = useMemo(
    () => getDisplayTickSize(rawTickSize, stableCoinMetadata.decimals),
    [rawTickSize, stableCoinMetadata.decimals]
  );
  const hasLimitPriceTickError = useMemo(
    () =>
      !isPriceAlignedToTickSize({
        price: limitPrice,
        rawTickSize,
        quoteTokenDecimals: stableCoinMetadata.decimals,
      }),
    [limitPrice, rawTickSize, stableCoinMetadata.decimals]
  );
  const limitPriceTickErrorCaption =
    hasLimitPriceTickError && displayTickSize.gt(0)
      ? `Limit price must be a multiple of ${displayTickSize.toFixed()} ${stableCoinMetadata.symbol}.`
      : undefined;

  // Side-aware balance guard: BUY overspends when total (amount × limit price)
  // exceeds the quote balance; SELL oversells when amount exceeds the token
  // balance. Drives both the input caption and the Continue button.
  const hasBalanceError = useMemo(
    () =>
      exceedsAvailableBalance({
        isBuyAction,
        total,
        amount,
        usdBalance,
        tokenBalance,
      }),
    [isBuyAction, total, amount, usdBalance, tokenBalance]
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
    // The limit price (per token, in the quote token) field.
    const priceProps = {
      amount: limitPrice,
      selectedAssetSlug: quoteTokenSlug,
      selectedAssetMetadata: stableCoinMetadata,
      onChange: setLimitPrice,
      cryptoValue: usdBalance,
      label: "Limit Price",
      errorCaption: limitPriceTickErrorCaption,
    };

    // The order-quantity (base token) field. The balance error lives here since
    // it's what the user adjusts to fix an over-budget buy or over-holding sell.
    const amountProps = {
      amount: amount,
      selectedAssetSlug: slug,
      selectedAssetMetadata: selectedAssetMetadata,
      onChange: handleOutputChange,
      cryptoValue: tokenBalance,
      label: "Amount",
      errorCaption: hasBalanceError
        ? "The amount entered exceeds your available balance."
        : undefined,
    };

    return isBuyAction
      ? { input1Props: priceProps, input2Props: amountProps }
      : { input1Props: amountProps, input2Props: priceProps };
  }, [
    amount,
    handleOutputChange,
    hasBalanceError,
    isBuyAction,
    limitPrice,
    limitPriceTickErrorCaption,
    quoteTokenSlug,
    selectedAssetMetadata,
    setLimitPrice,
    slug,
    stableCoinMetadata,
    tokenBalance,
    usdBalance,
  ]);

  const balanceTotal = total;

  const { finalTotalValue, txnFee } = useMemo(() => {
    return {
      finalTotalValue: total?.plus(networkFee) || ZERO,
      txnFee: undefined,
    };
  }, [networkFee, total]);

  const isBtnDisabled =
    hasBalanceError ||
    hasLimitPriceTickError ||
    !amount ||
    !amount.isFinite() ||
    amount.lte(0) ||
    !limitPrice ||
    !limitPrice.isFinite() ||
    limitPrice.lte(0) ||
    !isKyced ||
    Boolean(validationMessage);
  const priceDifferencePrefix = marketPriceDifference?.gt(0)
    ? "+"
    : marketPriceDifference?.lt(0)
      ? "-"
      : "";
  const priceDifferenceTextColorClassName = marketPriceDifference?.gt(0)
    ? "text-green-500"
    : marketPriceDifference?.lt(0)
      ? "text-red-500"
      : "text-sand-600";

  useEffect(() => {
    if (selectedPercentage == null) return;

    if (isBuyAction) {
      // Spend a % of the quote balance at the current limit price -> token qty.
      setAmount(
        limitPrice
          ? deriveQuantityFromPercent(
              usdBalance,
              selectedPercentage,
              limitPrice
            )
          : undefined
      );
    } else {
      // Sell a % of the token holdings.
      setAmount(
        new BigNumber(tokenBalance)
          .multipliedBy(selectedPercentage)
          .dividedBy(100)
      );
    }
  }, [
    isBuyAction,
    selectedPercentage,
    setAmount,
    tokenBalance,
    usdBalance,
    limitPrice,
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
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata.decimals}
              cryptoDecimals={stableCoinMetadata.decimals}
            />

            <BalanceInputWithTotal
              ref={ref2}
              onNext={() => ref3.current?.focus()}
              onPrev={() => ref1.current?.focus()}
              amountInputDisabled={false}
              {...input2Props}
              balanceTotal={balanceTotal}
              decimals={selectedAssetMetadata.decimals}
              cryptoDecimals={stableCoinMetadata.decimals}
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
                label={
                  <div className="flex items-center gap-[4px] text-xs text-sand-600">
                    Order Total
                  </div>
                }
                additionalBottomLeftBlock={
                  <div className="flex items-center gap-2 text-xs text-sand-600">
                    <span>
                      Market{" "}
                      <span className="font-semibold underline">
                        $<Money>{marketTokenPrice}</Money>
                      </span>
                    </span>
                    {marketPriceDifference && (
                      <span
                        className={`font-semibold ${priceDifferenceTextColorClassName}`}
                      >
                        Diff {priceDifferencePrefix}$
                        <Money>{marketPriceDifference.abs()}</Money>
                      </span>
                    )}
                  </div>
                }
                selectedAssetSlug={quoteTokenSlug}
                selectedAssetMetadata={stableCoinMetadata}
                balanceTotal={balanceTotal}
                decimals={selectedAssetMetadata.decimals}
                cryptoDecimals={stableCoinMetadata.decimals}
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

      {validationMessage && (
        <div className="mt-8">
          <Alert type="error" header="Order Cannot Be Submitted" expandable>
            {validationMessage}
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
