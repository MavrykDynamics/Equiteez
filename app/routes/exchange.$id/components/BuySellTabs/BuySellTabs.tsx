import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabType } from "~/lib/atoms/Tab";
import { TabSwitcher } from "~/lib/organisms/TabSwitcher";

import { Button } from "~/lib/atoms/Button";
import { stablecoinContract } from "~/consts/contracts";
import {
  ADMIN,
  BUY_TAB,
  DEFAULT_DODO_SLIPPAGE_PERCENTAGE,
  LIMIT_TYPE,
  MARKET_TYPE,
  MAX_TOKEN_AMOUNT,
  OTC_TYPE,
  SELL_TAB,
} from "./consts";
import { AdminScreen } from "./AdminScreen";
import { useUserContext } from "~/providers/UserProvider/user.provider";
// import { useContractAction } from "~/contracts/hooks/useContractAction";
import { ESnakeblock } from "~/templates/ESnakeBlock/ESnakeblock";
import {
  atomsToTokens,
  downgradeDecimals,
  rwaToFixed,
} from "~/lib/utils/formaters";
import clsx from "clsx";
import { useCurrencyContext } from "~/providers/CurrencyProvider/currency.provider";
import { toTokenSlug } from "~/lib/assets";
import BigNumber from "bignumber.js";

import usePrevious from "~/lib/ui/hooks/usePrevious";

import { isDefined } from "~/lib/utils";
import { AssetField } from "~/lib/organisms/AssetField";
import { CryptoBalance } from "~/templates/Balance";

import { TokenMetadata, useAssetMetadata } from "~/lib/metadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { calculateEstFee } from "~/providers/Dexprovider/utils";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  getStatusLabel,
  pickStatusFromMultiple,
  STATUS_PENDING,
} from "~/lib/ui/use-status-flag";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import { buyBaseToken, sellBaseToken } from "~/contracts/dodo.contract";
import { orderbookBuy, orderbookSell } from "~/contracts/orderbook.contract";
import {
  caclMinMaxQuoteBuying,
  caclMinMaxQuoteSelling,
} from "~/lib/utils/calcFns";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useConfigContext } from "~/providers/ConfigProvider/Config.provider";
import { rateToNumber } from "~/lib/utils/numbers";

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
  const { adminAddress } = useConfigContext();
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
      baseTokenAddress: pickOrderbookContract[tokenAddress],
      quoteTokenAddress: quoteAssetmetadata?.address,
      tokensAmount: amount?.div(rateToNumber(usdToTokenRates[slug])).toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [
      pickOrderbookContract,
      tokenAddress,
      quoteAssetmetadata?.address,
      amount,
      usdToTokenRates,
      slug,
      price,
      tokensMetadata,
    ]
  );

  const sellProps = useMemo(
    () => ({
      baseTokenAddress: pickOrderbookContract[tokenAddress],
      quoteTokenAddress: quoteAssetmetadata?.address,
      tokensAmount: amount?.toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [
      pickOrderbookContract,
      tokenAddress,
      quoteAssetmetadata?.address,
      amount,
      price,
      tokensMetadata,
      slug,
    ]
  );

  const { invokeAction: handleLimitBuy, status: limitStatus1 } =
    useContractAction(orderbookBuy, buyProps);

  const { invokeAction: handleLimitSell, status: limitStatus2 } =
    useContractAction(orderbookSell, sellProps);

  const marketBuyProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      quoteTokenAddress: pickDodoContractQuoteToken[tokenAddress],
      tokensAmount: amount?.div(tokenPrice).toNumber(),
      minMaxQuote: caclMinMaxQuoteBuying(
        amount,
        DEFAULT_DODO_SLIPPAGE_PERCENTAGE
      ),
      decimals: selectedAssetMetadata?.decimals,
      quoteDecimals: quoteAssetmetadata?.decimals,
      adminAddress,
    }),
    [
      pickDodoContractBasedOnToken,
      tokenAddress,
      pickDodoContractQuoteToken,
      amount,
      tokenPrice,
      selectedAssetMetadata?.decimals,
      quoteAssetmetadata?.decimals,
      adminAddress,
    ]
  );

  const marketSellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],

      tokenAddress: tokenAddress,
      tokensAmount: amount?.toNumber(),
      minMaxQuote: caclMinMaxQuoteSelling(
        tokenPrice.times(amount ?? 0),
        DEFAULT_DODO_SLIPPAGE_PERCENTAGE
      ),
      decimals: selectedAssetMetadata?.decimals,
      quoteDecimals: quoteAssetmetadata?.decimals,
      adminAddress,
    }),
    [
      pickDodoContractBasedOnToken,
      tokenAddress,
      amount,
      tokenPrice,
      selectedAssetMetadata?.decimals,
      quoteAssetmetadata?.decimals,
      adminAddress,
    ]
  );

  // / -----------------------------
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

export const BuySellTabs: FC<BuySellTabsProps> = ({
  symbol,
  tokenAddress,
  slug,
}) => {
  const { isAdmin, userTokensBalances, isKyced } = useUserContext();
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

  const isBtnDisabled = useMemo(
    () =>
      amount?.lte(0) ||
      price?.lte(0) ||
      hasTotalError ||
      !amount ||
      !price ||
      !isKyced,
    [amount, hasTotalError, price, isKyced]
  );

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
    if (amount && price) {
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
      config: { lpFee, maintainerFee, feeDecimals },
    } = dodoStorages[slug] ?? { config: {} };

    const tokensAmount = amount;

    const result = calculateEstFee(
      tokensAmount,
      tokenPrice,
      lpFee,
      maintainerFee,
      Number(feeDecimals),
      DEFAULT_DODO_SLIPPAGE_PERCENTAGE,
      isBuyAction
    );

    const decimals = isBuyAction
      ? selectedAssetMetadata.decimals
      : quoteAssetmetadata.decimals;

    return downgradeDecimals(result, decimals);
  }, [
    amount,
    dodoStorages,
    isBuyAction,
    quoteAssetmetadata.decimals,
    selectedAssetMetadata.decimals,
    slug,
    tokenPrice,
  ]);

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

  const symbolToShow = isBuyAction ? symbol : quoteAssetmetadata.symbol;

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
                      cryptoDecimals={quoteAssetmetadata?.decimals}
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
                    className={`w-full flex justify-between eq-input py-3 px-[14px] gap-3`}
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
                        max={MAX_TOKEN_AMOUNT}
                        value={price
                          ?.toFixed(selectedAssetMetadata?.decimals)
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
                    className={`w-full flex justify-between eq-input py-3 px-[14px] gap-3`}
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
                        max={MAX_TOKEN_AMOUNT}
                        assetDecimals={selectedAssetMetadata?.decimals}
                        value={amount
                          ?.toFixed(selectedAssetMetadata?.decimals)
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
                  />
                </div>
              </div>

              <div className="w-full mb-3">
                <div
                  className={`w-full flex justify-between eq-input py-3 px-[14px] gap-3`}
                >
                  <div className="text-content-secondary opacity-50">Total</div>

                  <div className="flex gap-1 flex-1 items-center">
                    <AssetField
                      type="text"
                      name="total"
                      min={0}
                      max={MAX_TOKEN_AMOUNT}
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
                    <div className="text-caption-regular">
                      {estFee} {symbolToShow}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex w-full">
                {!validBaseTokens[tokenAddress] ? (
                  <Button className="w-full" disabled>
                    Token is not used
                  </Button>
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
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
