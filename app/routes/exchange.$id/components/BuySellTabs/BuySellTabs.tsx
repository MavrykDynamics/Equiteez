import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabType } from "~/lib/atoms/Tab";
import { TabSwitcher } from "~/lib/organisms/TabSwitcher";

// icons
import { Button } from "~/lib/atoms/Button";
import { stablecoinContract } from "~/consts/contracts";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { buyBaseToken, sellBaseToken } from "~/contracts/dodo.contract";
import {
  ADMIN,
  BUY_TAB,
  LIMIT_TYPE,
  MARKET_TYPE,
  OTC_TYPE,
  SELL_TAB,
} from "./consts";
import { AdminScreen } from "./AdminScreen";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import { atomsToTokens, rwaToFixed } from "~/lib/utils/formaters";
import clsx from "clsx";
import { useCurrencyContext } from "~/providers/CurrencyProvider/currency.provider";
import { toTokenSlug } from "~/lib/assets";
import BigNumber from "bignumber.js";
import {
  caclMinMaxQuoteBuying,
  caclMinMaxQuoteSelling,
} from "~/lib/utils/calcFns";
import usePrevious from "~/lib/ui/hooks/usePrevious";
import { orderbookBuy, orderbookSell } from "~/contracts/orderbook.contract";
import { rateToNumber } from "~/lib/utils/numbers";
import { isDefined } from "~/lib/utils";
import { AssetField } from "~/lib/organisms/AssetField";
import { CryptoBalance } from "~/templates/Balance";
import {
  getStatusLabel,
  pickStatusFromMultiple,
  STATUS_PENDING,
} from "~/lib/ui/use-status-flag";
import { TokenMetadata, useAssetMetadata } from "~/lib/metadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { calculateEstFee } from "~/providers/Dexprovider/utils";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";

type BuySellTabsProps = {
  symbol: string;
  tokenAddress: string;
  slug: string;
};

const useBuySellActions = (
  price: BigNumber | undefined,
  amount: BigNumber | undefined,
  tokenAddress: string,
  tokenPrice: BigNumber,
  selectedAssetMetadata: TokenMetadata,
  quoteAssetmetadata: TokenMetadata
) => {
  const slug = useMemo(() => toTokenSlug(tokenAddress), [tokenAddress]);
  const { tokensMetadata } = useTokensContext();
  const { usdToTokenRates } = useCurrencyContext();
  const {
    pickers: {
      pickDodoContractBasedOnToken,
      pickOrderbookContract,
      pickDodoContractQuoteToken,
    },
  } = useMarketsContext();

  const buyProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[tokenAddress],
      tokensAmount: amount?.div(rateToNumber(usdToTokenRates[slug])).toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [
      tokenAddress,
      amount,
      usdToTokenRates,
      slug,
      price,
      tokensMetadata,
      pickOrderbookContract,
    ]
  );

  const sellProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[tokenAddress],
      rwaTokenAddress: tokenAddress,
      tokensAmount: amount?.toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [amount, price, slug, tokenAddress, tokensMetadata, pickOrderbookContract]
  );

  const { invokeAction: handleLimitBuy, status: limitStatus1 } =
    useContractAction(orderbookBuy, buyProps);

  const { invokeAction: handleLimitSell, status: limitStatus2 } =
    useContractAction(orderbookSell, sellProps);

  const marketBuyProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      quoteTokenAddress: pickDodoContractQuoteToken[tokenAddress],
      tokensAmount: amount?.toNumber(),
      minMaxQuote: caclMinMaxQuoteBuying(amount, "0"),
      quoteDecimals: quoteAssetmetadata?.decimals,
      decimals: selectedAssetMetadata?.decimals,
    }),
    [
      pickDodoContractBasedOnToken,
      tokenAddress,
      pickDodoContractQuoteToken,
      amount,
      quoteAssetmetadata?.decimals,
      selectedAssetMetadata?.decimals,
    ]
  );

  const marketSellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],

      tokenAddress: tokenAddress,
      tokensAmount: amount?.toNumber(),
      minMaxQuote: caclMinMaxQuoteSelling(
        tokenPrice.times(amount ?? 0),
        "0" // TODO need task to add slippage on ui
      ),
      decimals: selectedAssetMetadata?.decimals,
      quoteDecimals: quoteAssetmetadata?.decimals,
    }),
    [
      tokenAddress,
      amount,
      tokenPrice,
      selectedAssetMetadata?.decimals,
      quoteAssetmetadata?.decimals,
      pickDodoContractBasedOnToken,
    ]
  );

  // MArket buy | sell
  const { invokeAction: handleMarketBuy, status: marketStatus1 } =
    useContractAction(buyBaseToken, marketBuyProps);

  const { invokeAction: handleMarketSell, status: marketStatus2 } =
    useContractAction(sellBaseToken, marketSellProps);

  return {
    handleLimitSell,
    handleLimitBuy,
    status: pickStatusFromMultiple(
      limitStatus1,
      limitStatus2,
      marketStatus1,
      marketStatus2
    ),
    handleMarketBuy,
    handleMarketSell,
  };
};

// TODO refector this component to use logic line on secondary markey BUY | SELL
// extract reusable components
export const BuySellTabs: FC<BuySellTabsProps> = ({
  symbol,
  tokenAddress,
  slug,
}) => {
  const { isAdmin, userTokensBalances } = useUserContext();
  const { usdToTokenRates } = useCurrencyContext();
  const { dodoMav, dodoTokenPair, dodoStorages } = useDexContext();
  const { validBaseTokens } = useMarketsContext();
  // metadata
  const selectedAssetMetadata = useAssetMetadata(slug);
  // tabs state
  const [activetabId, setAvtiveTabId] = useState(BUY_TAB);
  const isBuyAction = activetabId === BUY_TAB;
  const tokenPrice = useMemo(
    () => atomsToTokens(dodoMav[slug], selectedAssetMetadata?.decimals),
    [dodoMav, slug, selectedAssetMetadata?.decimals]
  );

  const [activeItem, setActiveItem] = useState(LIMIT_TYPE);

  // inputs state
  const [price, setPrice] = useState<BigNumber | undefined>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const prevSelectedPercentage = usePrevious(selectedPercentage);

  // refs
  const inputAmountRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);

  // TODO remove "?? toTokenSlug(stablecoinContract)" after API assets
  const quoteAssetmetadata = useAssetMetadata(
    dodoTokenPair[slug] ?? toTokenSlug(stablecoinContract)
  );

  // derived

  // Handle input values for price and amount
  const handleAmountChange = (newAmount?: string) =>
    setAmount(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );

  const handlePriceChange = (newAmount?: string) =>
    setPrice(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );

  const handleAmountFocus = () => {
    inputAmountRef.current?.focus();
  };
  const handlePriceFocus = () => {
    inputPriceRef.current?.focus();
  };

  const usdBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[tokenAddress]?.toNumber() || 0,
    [userTokensBalances, tokenAddress]
  );

  const maxBuy = useMemo(() => {
    const amountToSpend = (100 * usdBalance) / 100;
    return rwaToFixed(new BigNumber(amountToSpend).div(tokenPrice).toNumber());
  }, [usdBalance, tokenPrice]);

  // extract logic into separate hook
  const hasTotalError = isBuyAction
    ? total
      ? total.gt(new BigNumber(usdBalance))
      : false
    : amount
      ? amount.gt(new BigNumber(tokenBalance))
      : false;

  // TODO uncoment this after API assets
  // const isBtnDisabled = useMemo(
  //   () =>
  //     amount?.lte(0) ||
  //     price?.lte(0) ||
  //     hasTotalError ||
  //     !amount ||
  //     !price ||
  //     !isKyced,
  //   [amount, hasTotalError, price, isKyced]
  // );

  // const isBtnDisabled = true;

  // derived state (it's boolean value, so no need to memoize it)
  const isLimitType = activeItem === LIMIT_TYPE;

  useEffect(() => {
    if (selectedPercentage) {
      const amountToSpend = new BigNumber(
        (selectedPercentage * (isBuyAction ? usdBalance : tokenBalance)) / 100
      );

      const numberOfTokens = amountToSpend.div(
        isLimitType ? (price ?? 1) : tokenPrice
      );

      setAmount(isBuyAction ? numberOfTokens : amountToSpend);
    } else if (
      selectedPercentage === 0 &&
      prevSelectedPercentage &&
      prevSelectedPercentage !== 0
    ) {
      setAmount(undefined);
    }
  }, [
    selectedPercentage,
    usdBalance,
    tokenAddress,
    prevSelectedPercentage,
    usdToTokenRates,
    slug,
    isBuyAction,
    tokenBalance,
    isLimitType,
    price,
    tokenPrice,
  ]);

  // update total
  useEffect(() => {
    if (amount && usdToTokenRates[slug] && price) {
      setTotal(amount.multipliedBy(price));
    } else if (!amount) {
      setTotal(undefined);
    }
  }, [amount, isLimitType, price, slug, tokenAddress, usdToTokenRates]);

  // contract calls based on markt or limit
  const {
    handleLimitSell,
    handleMarketBuy,
    handleMarketSell,
    handleLimitBuy,
    status,
  } = useBuySellActions(
    price,
    amount,
    tokenAddress,
    tokenPrice,
    selectedAssetMetadata,
    quoteAssetmetadata
  );

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const handleItemlick = useCallback((activeItem: string) => {
    setActiveItem(activeItem);
  }, []);

  const pickBuySellAction = useMemo(
    () =>
      (() => {
        if (isLimitType) {
          return activetabId === BUY_TAB ? handleLimitBuy : handleLimitSell;
        }

        return activetabId === BUY_TAB ? handleMarketBuy : handleMarketSell;
      })(),
    [
      activetabId,
      handleLimitBuy,
      handleLimitSell,
      handleMarketBuy,
      handleMarketSell,
      isLimitType,
    ]
  );

  // set fixed price for the market type
  useEffect(() => {
    if (!isLimitType) {
      setPrice(tokenPrice);
    }

    if (isLimitType) {
      setPrice(undefined);
    }
  }, [isLimitType, slug, tokenAddress, tokenPrice, usdToTokenRates]);

  const estFee = useMemo(() => {
    const {
      config: { lpFee, maintainerFee },
    } = dodoStorages[slug] ?? { config: { lpFee: 0, maintainerFee: 0 } };

    const tokensAmount = amount;

    return calculateEstFee(
      tokensAmount,
      tokenPrice,
      lpFee,
      maintainerFee,
      18,
      "0",
      isBuyAction
    );
  }, [amount, dodoStorages, isBuyAction, slug, tokenPrice]);

  // swaitch screens based on active tab
  const tabs: TabType[] = useMemo(
    () => [
      {
        id: BUY_TAB,
        label: "Buy",
        handleClick: handleTabClick,
      },
      {
        id: SELL_TAB,
        label: "Sell",
        handleClick: handleTabClick,
      },

      ...(isAdmin
        ? [
            {
              id: ADMIN,
              label: "Admin",
              handleClick: handleTabClick,
            },
          ]
        : []),
    ],
    [handleTabClick, isAdmin]
  );

  // dropdown state
  const items: TabType[] = useMemo(
    () => [
      {
        id: LIMIT_TYPE,
        label: "Limit",
        value: "limit",
        handleClick: handleItemlick,
      },
      {
        id: MARKET_TYPE,
        label: "Market",
        value: "market",
        handleClick: handleItemlick,
      },
      {
        id: OTC_TYPE,
        label: "OTC",
        value: "otc",
        handleClick: handleItemlick,
        disabled: true,
      },
    ],
    [handleItemlick]
  );

  const symbolToShow = !isBuyAction ? symbol : quoteAssetmetadata.symbol;

  return (
    <section className="flex flex-col w-full relative">
      <TabSwitcher
        variant="secondary"
        tabs={tabs}
        activeTabId={activetabId}
        className="flex-wrap gap-y-2"
        grow={true}
      />
      <div className="mt-4">
        {isAdmin && activetabId === ADMIN ? (
          <AdminScreen symbol={symbol} tokenAddress={tokenAddress} />
        ) : (
          <>
            <div className="mb-4">
              <TabSwitcher
                variant="tertiary"
                activeTabId={activeItem}
                tabs={items}
              />
            </div>
            <div className="flex flex-col w-full gap-3 text-caption-regular">
              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Avbl</span>
                <div className="text-caption-regular">
                  {isBuyAction ? (
                    <CryptoBalance
                      value={userTokensBalances[stablecoinContract] || 0}
                      cryptoDecimals={6}
                    />
                  ) : (
                    <CryptoBalance
                      value={userTokensBalances[tokenAddress] || "0"}
                      cryptoDecimals={selectedAssetMetadata?.decimals ?? 6}
                    />
                  )}
                  &nbsp;{symbolToShow}
                </div>
              </div>
              <div className="flex flex-col w-full gap-3">
                <div className="flex flex-col w-full gap-3">
                  <div
                    role="presentation"
                    onClick={handlePriceFocus}
                    className={`w-full flex justify-between eq-input py-3 px-[14px] bg-gray-100 pointer-events-none gap-3`}
                  >
                    <div className="text-content-secondary opacity-50">
                      Price
                    </div>

                    <div className="flex gap-1 flex-1 items-center">
                      <AssetField
                        ref={inputPriceRef}
                        name="price"
                        type="number"
                        min={0}
                        max={9999999999999}
                        value={price
                          ?.toFixed(selectedAssetMetadata?.decimals ?? 6)
                          .toString()}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                        style={{ padding: 0 }}
                        className="w-full bg-transparent focus:outline-none text-right font-semibold border-none"
                        disabled={
                          !isLimitType || !validBaseTokens[tokenAddress]
                        }
                      ></AssetField>
                      <span className="font-semibold">USDT</span>
                    </div>
                  </div>

                  <div
                    role="presentation"
                    onClick={handleAmountFocus}
                    className={`w-full flex justify-between eq-input py-3 px-[14px] bg-gray-100 pointer-events-none gap-3`}
                  >
                    <div className="text-content-secondary opacity-50">
                      Amount
                    </div>

                    <div className="flex gap-1 flex-1 items-center">
                      <AssetField
                        ref={inputAmountRef}
                        name="amount"
                        type="text"
                        disabled={!validBaseTokens[tokenAddress]}
                        min={0}
                        max={9999999999999}
                        assetDecimals={selectedAssetMetadata?.decimals ?? 6}
                        value={amount
                          ?.toFixed(selectedAssetMetadata?.decimals ?? 6)
                          .toString()}
                        onChange={handleAmountChange}
                        placeholder="Minimum 1"
                        style={{ padding: 0 }}
                        className="w-full bg-transparent focus:outline-none text-right font-semibold p-0 border-none"
                      ></AssetField>
                      <span className="font-semibold">{symbol}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={clsx(
                    "flex flex-col w-full gap-1",
                    !validBaseTokens[tokenAddress] && "pointer-events-none"
                  )}
                >
                  <ESnakeblock
                    selectedOption={selectedPercentage}
                    setSelectedOption={setSelectedPercentage}
                    disabled
                  />
                </div>
              </div>

              <div className="w-full mb-3">
                <div
                  className={`w-full flex justify-between eq-input py-3 px-[14px] bg-gray-100 pointer-events-none gap-3`}
                >
                  <div className="text-content-secondary opacity-50">Total</div>

                  <div className="flex gap-1 flex-1 items-center">
                    <AssetField
                      type="text"
                      name="total"
                      min={0}
                      max={9999999999999}
                      value={total?.toFixed(quoteAssetmetadata.decimals)}
                      placeholder="0.00"
                      assetDecimals={6}
                      style={{ padding: 0 }}
                      className="w-full bg-transparent focus:outline-none text-right font-semibold p-0 border-none"
                      disabled
                    ></AssetField>
                    <span className="font-semibold">USDT</span>
                  </div>
                </div>

                {hasTotalError && (
                  <span className={clsx("text-body-xs text-error mt-2")}>
                    {"Amount exceeds available balance"}
                  </span>
                )}
              </div>

              {validBaseTokens[tokenAddress] && (
                <div className="flex flex-col w-full gap-1">
                  <div className="flex justify-between w-full">
                    <span className="text-caption-regular">Max Buy</span>
                    <span className="text-caption-regular">
                      <CryptoBalance
                        value={new BigNumber(maxBuy ?? 0)}
                        cryptoDecimals={selectedAssetMetadata?.decimals}
                      />{" "}
                      {symbol}
                    </span>
                  </div>

                  <div className="flex justify-between w-full">
                    <span className="text-caption-regular">Est. Fee</span>
                    <div className="text-caption-regula">
                      {estFee} {symbolToShow}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex w-full">
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
                {/* {!validBaseTokens[tokenAddress] ? (
                
                ) : (
                  <>
                    <Button
                      disabled={isBtnDisabled}
                      isLoading={status === STATUS_PENDING}
                      onClick={pickBuySellAction}
                      className="w-full mt-1 py-[10px]"
                    >
                      <span className="text-body-xs font-bold">
                        {getStatusLabel(
                          status,
                          activetabId === "buy" ? "Buy" : "Sell"
                        )}
                      </span>
                    </Button>
                  </>
                )} */}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
