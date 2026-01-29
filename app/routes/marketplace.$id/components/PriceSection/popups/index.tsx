import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

//screens
import { BuySellScreen } from "../screens/BuySellScreen";
import { BuySellConfirmationScreen } from "../screens/BuySellConfirmationScreen";
// import { OTCBuySellScreen } from "../screens/OTCBuySellScreen";

// components
import { Divider } from "~/lib/atoms/Divider";
import { TabType } from "~/lib/atoms/Tab";

// icons
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";

//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import { BUY, CONFIRM, OrderType, SELL } from "../consts";
import { TabSwitcherV2 } from "~/lib/organisms/TabSwitcherV2/TabSwitcherV2";

import {
  ContractActionPopupProps,
  ContractActionToastProps,
  useContractAction,
} from "~/contracts/hooks/useContractAction";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "~/lib/utils";
import { ProgresBar } from "../PrimaryPriceBlock";
import usePrevious from "~/lib/ui/hooks/usePrevious";
import Money from "~/lib/atoms/Money";
import { pickStatusFromMultiple } from "~/lib/ui/use-status-flag";

import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useAssetMetadata } from "~/lib/metadata";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { BuySellLimitScreen } from "../screens/BuySellLimitScreen";
import { orderbookBuy, orderbookSell } from "~/contracts/orderbook.contract";

import styles from "./popups.module.css";
import {
  calculateMarketBuy,
  calculateMarketSell,
} from "~/providers/Dexprovider/utils";
import { EstateHeadlineTab } from "~/templates/EstateHeadlineTab";
import { Text } from "~/lib/atoms/Typography/Text";

export const SLIPPAGE_OPTIONS = [5, 10];

export const PopupContent: FC<{
  estate: SecondaryEstate;
  orderType: OrderType;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
}> = ({ estate, orderType, setOrderType }) => {
  const { slug } = estate;
  const { marketsArr } = useMarketsContext();

  const { orderbookStorages, orderbookTokenPair } = useDexContext();
  const {
    pickers: { pickOrderbookContract, pickOrderbookContractQuoteToken },
    activeMarket,
  } = useMarketsContext();

  // MArket Type
  const [marketType, setMarkettype] = useState("market");
  const isMarketTypeMarket = marketType === "market";

  const [activetabId, setAvtiveTabId] = useState<OrderType>(orderType);
  const prevTabId = usePrevious(
    activetabId,
    activetabId !== CONFIRM
  ) as OrderType;

  // Slippage percentage for price impact --------------------------------------------
  const [slippagePercentage, setSlippagePercentage] = useState<number>(0);

  const handleSlippageChange = useCallback(
    (value: number) => {
      setSlippagePercentage(value);
    },
    [setSlippagePercentage]
  );

  // --------------------------------------------

  // --- input state
  const [amountB, setAmountB] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  // for limit market and handling input values
  const [limitPrice, setLimitPrice] = useState<BigNumber | undefined>();

  // const finalLimitPrice = useMemo(() => {
  //   if (slippagePercentage !== 0 && !isMarketTypeMarket) {
  //     const multiplier = new BigNumber(1).minus(
  //       new BigNumber(slippagePercentage).div(100)
  //     );

  //     if (activetabId === BUY) {
  //       // uses amount
  //       return amountB?.times(multiplier);
  //     }
  //     if (activetabId === SELL) {
  //       // uses limit price
  //       return limitPrice?.times(multiplier);
  //     }
  //   }

  //   return limitPrice;
  // }, [
  //   activetabId,
  //   amountB,
  //   isMarketTypeMarket,
  //   limitPrice,
  //   slippagePercentage,
  // ]);

  // metadata for selected asset
  const selectedAssetMetadata = useAssetMetadata(slug);

  const quoteAssetmetadata = useAssetMetadata(orderbookTokenPair[slug]);

  // based on tab (buy|sell) token price may vary
  const tokenPrice = useMemo(() => {
    const { lowestSellPrice, highestBuyPrice } = orderbookStorages[slug];

    const buyPrice = calculateMarketBuy(
      lowestSellPrice,
      highestBuyPrice,
      selectedAssetMetadata.decimals
    );
    const sellPrice = calculateMarketSell(
      lowestSellPrice,
      highestBuyPrice,
      selectedAssetMetadata.decimals
    );

    return orderType === BUY ? buyPrice : sellPrice;
  }, [orderbookStorages, slug, orderType, selectedAssetMetadata.decimals]);
  const isSecondaryEstate = estate.assetDetails.type === SECONDARY_MARKET;

  const handleTabClick = useCallback(
    (id: OrderType) => {
      setAvtiveTabId(id);
      if (id !== CONFIRM) setOrderType(id);
    },
    [setOrderType]
  );

  const tabs: TabType<OrderType>[] = useMemo(
    () => [
      {
        id: BUY,
        label: "Buy",
        handleClick: handleTabClick,
      },
      {
        id: SELL,
        label: "Sell",
        handleClick: handleTabClick,
      },
      // {
      //   id: OTC,
      //   label: "OTC",
      //   handleClick: handleTabClick,
      //   disabled: true,
      // },
    ],
    [handleTabClick]
  );

  const handlaMarketChange = useCallback(
    (type: string) => {
      setMarkettype(type);
    },
    [setMarkettype]
  );

  const marketTabs: TabType[] = useMemo(
    () => [
      {
        id: "market",
        label: "Market",
        handleClick: handlaMarketChange,
      },
      {
        id: "limit",
        label: "Limit",
        handleClick: handlaMarketChange,
      },
    ],
    [handlaMarketChange]
  );

  useEffect(() => {
    if (marketType === "limit") {
      const multiplier = new BigNumber(1).plus(
        new BigNumber(slippagePercentage).div(100)
      );

      // if buyAction -> amountB is cheaper for %
      if (activetabId === BUY) {
        setAmountB((prev) => (prev ? prev.times(multiplier) : undefined));
      }

      // if sellAction -> limitPrice is greater for %
      if (activetabId === SELL) {
        setLimitPrice((prev) => (prev ? prev.times(multiplier) : undefined));
      }
    }
  }, [activetabId, marketType, slippagePercentage]);

  useEffect(() => {
    const priceToUse = isMarketTypeMarket ? tokenPrice : limitPrice;

    if (isDefined(amountB) && priceToUse) {
      setTotal(amountB.times(priceToUse));
    } else if (!isDefined(amountB)) {
      setTotal(undefined);
    }
  }, [
    amountB,
    estate.token_address,
    marketType,
    slug,
    tokenPrice,
    slippagePercentage,
    limitPrice,
    isMarketTypeMarket,
  ]);

  // reset values when switching tabs
  useLayoutEffect(() => {
    if (activetabId === CONFIRM) return;

    setAmountB(undefined);
    setLimitPrice(undefined);
    setSlippagePercentage(0);
  }, [activetabId, marketType]);

  // Orderbook limit buy | sell with custom user price
  const limitBuyProps = useMemo(
    () => ({
      orderbookContractAddress: pickOrderbookContract[estate.token_address],
      quoteTokenAddress: pickOrderbookContractQuoteToken[estate.token_address],
      tokensAmount: amountB?.toNumber(),
      pricePerToken: limitPrice?.toNumber(),
      decimals: selectedAssetMetadata?.decimals,
      quoteTokenDecimals: quoteAssetmetadata?.decimals,
    }),
    [
      pickOrderbookContract,
      estate.token_address,
      pickOrderbookContractQuoteToken,
      amountB,
      limitPrice,
      selectedAssetMetadata?.decimals,
      quoteAssetmetadata?.decimals,
    ]
  );

  const limitSellProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { quoteTokenAddress, ...restBuyprops } = limitBuyProps;

    return {
      ...restBuyprops,
      rwaTokenAddress: estate.token_address,
    };
  }, [estate.token_address, limitBuyProps]);

  // Orderbook market with dynamic price
  const marketBuyProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pricePerToken, tokensAmount, ...restBuyprops } = limitBuyProps;

    return {
      pricePerToken: tokenPrice,
      tokensAmount: amountB?.div(tokenPrice).toNumber(),
      ...restBuyprops,
    };
  }, [limitBuyProps, tokenPrice, amountB]);

  const marketSellProps = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { quoteTokenAddress, pricePerToken, ...restBuyprops } = limitBuyProps;

    return {
      pricePerToken: tokenPrice,
      rwaTokenAddress: estate.token_address,
      ...restBuyprops,
    };
  }, [estate.token_address, limitBuyProps, tokenPrice]);

  // actual contract calls and their handlers ---------------

  const memoizedPopupProps: ContractActionPopupProps = useMemo(
    () => ({ key: "inProgressRwaAd", props: { rwas: marketsArr.slice(0, 2) } }),
    [marketsArr]
  );

  const memoizedToastProps: ContractActionToastProps = useMemo(() => {
    const action = orderType === BUY ? "bought" : "sold";
    return {
      success: {
        title: `${activeMarket?.symbol} ${orderType === BUY ? "Buy" : "Sell"}`,
        message: `Successfully ${action} ${activeMarket?.symbol}`,
      },
    };
  }, [orderType, activeMarket?.symbol]);

  const { invokeAction: handleMarketBuy, status: buyStatus } =
    useContractAction(
      orderbookBuy,
      marketBuyProps,
      memoizedPopupProps,
      memoizedToastProps
    );

  const { invokeAction: handleMarketSell, status: sellStatus } =
    useContractAction(
      orderbookSell,
      marketSellProps,
      memoizedPopupProps,
      memoizedToastProps
    );

  const { invokeAction: handleLimitBuy, status: limitBuyStatus } =
    useContractAction(
      orderbookBuy,
      limitBuyProps,
      memoizedPopupProps,
      memoizedToastProps
    );

  const { invokeAction: handleLimitSell, status: limitSellStatus } =
    useContractAction(
      orderbookSell,
      limitSellProps,
      memoizedPopupProps,
      memoizedToastProps
    );

  // prop action to pass
  const buySellActionCb = useMemo(() => {
    if (isMarketTypeMarket) {
      return orderType === BUY ? handleMarketBuy : handleMarketSell;
    }

    return orderType === BUY ? handleLimitBuy : handleLimitSell;
  }, [
    handleLimitBuy,
    handleLimitSell,
    handleMarketBuy,
    handleMarketSell,
    isMarketTypeMarket,
    orderType,
  ]);

  // status of the operation
  const status = useMemo(
    () =>
      pickStatusFromMultiple(
        buyStatus,
        sellStatus,
        limitBuyStatus,
        limitSellStatus
      ),
    [buyStatus, limitBuyStatus, limitSellStatus, sellStatus]
  );

  const HeadlinePreviewSection = () => (
    <div className="flex items-center gap-3 font-medium">
      <div className="w-[76px] h-[57px] rounded-lg overflow-hidden">
        <img
          src={estate.assetDetails.previewImage}
          alt={estate.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 items-start">
        <h3 className="text-card-headline text-sand-900">{estate.name}</h3>

        <div className="flex items-center gap-[8px]">
          <EstateHeadlineTab
            isSecondaryEstate={estate.assetDetails.type === "Secondary Market"}
          />
          <Text size="smallBody" weight="semibold">
            APY {estate.assetDetails.APY}%
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-between text-content flex-1 relative">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activetabId === CONFIRM ? (
              <div
                role="presentation"
                onClick={() => setAvtiveTabId(prevTabId)}
                className="flex items-center cursor-pointer"
              >
                <button>
                  <ArrowLeftIcon className="size-6 mr-2" />
                </button>
                <span className="text-card-headline text-sand-900">
                  Checkout
                </span>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <HeadlinePreviewSection />
                {!isSecondaryEstate && (
                  <div className="mt-4 w-full">
                    <h4 className="text-content text-body mb-3 font-semibold">
                      Shares
                    </h4>
                    <ProgresBar
                      tokensCount={
                        estate.assetDetails.priceDetails.tokensAvailable
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <Divider className="my-6" />

          {activetabId !== CONFIRM && isSecondaryEstate && (
            <>
              <div className="mb-[8px]">
                <TabSwitcherV2
                  className={styles.tabsWrapper}
                  tabs={marketTabs}
                  tabClassName={styles.tab}
                  activeTabId={marketType}
                />
              </div>
              <div>
                <div className="mb-3 text-base">
                  <TabSwitcherV2
                    className={styles.tabsWrapper}
                    // @ts-expect-error // OrderType is string
                    tabs={tabs}
                    tabClassName={styles.tab}
                    activeTabId={activetabId}
                  />
                </div>
              </div>
            </>
          )}

          {activetabId === CONFIRM && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-3 font-medium">
                <div className="w-[124px] h-[93px] rounded-lg overflow-hidden">
                  <img
                    src={estate.assetDetails.previewImage}
                    alt={estate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 items-start flex-1">
                  <div className="flex justify-between items-start gap-6 text-card-headline text-sand-900 w-full">
                    <h3>{estate.name}</h3>
                    <h3 className="flex items-center gap-1 text-right">
                      {orderType === BUY ? (
                        <Money
                          smallFractionFont={false}
                          cryptoDecimals={selectedAssetMetadata?.decimals}
                        >
                          {isMarketTypeMarket
                            ? (amountB?.div(tokenPrice).toNumber() ?? 0)
                            : (amountB ?? 0)}
                        </Money>
                      ) : (
                        amountB?.toNumber()
                      )}{" "}
                      {estate.symbol}
                    </h3>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="px-2 py-[2px] rounded-[4px] text-body-xs text-sand-800 bg-[#F6AFAFBF] text-center">
                      {estate.assetDetails.propertyDetails.propertyType}
                    </span>
                    <div className="text-body text-sand-900">
                      $
                      <Money smallFractionFont={false}>
                        {!isMarketTypeMarket
                          ? (total ?? 0)
                          : orderType === BUY
                            ? (amountB ?? 0)
                            : (total ?? 0)}
                      </Money>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activetabId === BUY || activetabId === SELL) &&
            (marketType === "market" ? (
              <BuySellScreen
                estate={estate}
                toggleScreen={() => setAvtiveTabId(CONFIRM)}
                actionType={activetabId}
                amount={amountB}
                setAmount={setAmountB}
                total={total}
                tokenPrice={tokenPrice}
              />
            ) : (
              <BuySellLimitScreen
                limitPrice={limitPrice}
                marketTokenPrice={tokenPrice}
                setLimitPrice={setLimitPrice}
                estate={estate}
                toggleScreen={() => setAvtiveTabId(CONFIRM)}
                actionType={activetabId}
                amount={amountB}
                setAmount={setAmountB}
                total={total}
                slippagePercentage={slippagePercentage}
                handleSlippageChange={handleSlippageChange}
              />
            ))}

          {/* {activetabId === OTC && <OTCPopupContent estate={estate} />} */}
          {activetabId === CONFIRM && (
            <BuySellConfirmationScreen
              actionType={orderType === BUY ? BUY : SELL}
              actionCb={buySellActionCb}
              status={status}
            />
          )}
        </div>
      </>
    </div>
  );
};

// export const OTCPopupContent: FC<{ estate: SecondaryEstate }> = ({
//   estate,
// }) => {
//   const [activeScreenId, setActiveScreenId] = useState<OTCScreenState>(OTC);
//   const [activeTabId, setActiveTabId] = useState<OTCTabType>(OTC_BUY);

//   const toggleBuyScreen = useCallback((id: OTCScreenState) => {
//     setActiveScreenId(id);
//   }, []);

//   const toggleTabScreen = useCallback((id: OTCTabType) => {
//     setActiveTabId(id);
//   }, []);

//   // TODO take from buysell screen
//   const amount = 10;
//   const price = 45;

//   const tabs: TabType<OTCTabType>[] = useMemo(
//     () => [
//       {
//         id: OTC_BUY,
//         label: "OTC Buy",
//         handleClick: toggleTabScreen,
//       },
//       {
//         id: OTC_SELL,
//         label: "OTC Sell",
//         handleClick: toggleTabScreen,
//       },
//     ],
//     [toggleTabScreen]
//   );
//   return (
//     <div className="flex flex-col justify-between text-content h-full">
//       <>
//         <div className="flex-1 flex flex-col">
//           <div className="flex items-center">
//             {activeScreenId === CONFIRM && (
//               <button onClick={() => toggleBuyScreen("otc")}>
//                 <ArrowLeftIcon className="size-6 mr-2" />
//               </button>
//             )}
//           </div>

//           {activeScreenId !== CONFIRM && (
//             <TabSwitcher
//               variant="secondary"
//               tabs={tabs}
//               activeTabId={activeTabId}
//               grow={true}
//             />
//           )}

//           {/* {activeScreenId === OTC && (
//             <OTCBuySellScreen
//               symbol={estate.symbol}
//               estate={estate}
//               toggleScreen={toggleBuyScreen}
//               activeTabId={activeTabId}
//             />
//           )} */}
//           {activeScreenId === CONFIRM && (
//             <BuySellConfirmationScreen
//               estate={estate}
//               tokenPrice={price}
//               total={price * amount}
//               amount={amount}
//               actionType={activeTabId}
//             />
//           )}
//         </div>
//       </>
//     </div>
//   );
// };
