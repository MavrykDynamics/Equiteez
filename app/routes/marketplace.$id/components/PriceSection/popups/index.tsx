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
import { OTCBuySellScreen } from "../screens/OTCBuySellScreen";

// components
import { Divider } from "~/lib/atoms/Divider";
import { TabType } from "~/lib/atoms/Tab";

// icons
import ArrowLeftIcon from "app/icons/arrow-left.svg?react";

//consts & types
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";
import {
  BUY,
  CONFIRM,
  OrderType,
  OTC,
  OTC_BUY,
  OTC_SELL,
  OTCScreenState,
  OTCTabType,
  SELL,
} from "../consts";
import { TabSwitcher } from "~/lib/organisms/TabSwitcher";
import { useContractAction } from "~/contracts/hooks/useContractAction";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import { isDefined } from "~/lib/utils";
import { ProgresBar } from "../PrimaryPriceBlock";
import clsx from "clsx";
import usePrevious from "~/lib/ui/hooks/usePrevious";
import Money from "~/lib/atoms/Money";
import { buyBaseToken, sellBaseToken } from "~/contracts/dodo.contract";
import { pickStatusFromMultiple } from "~/lib/ui/use-status-flag";
import {
  caclMinMaxQuoteSelling,
  caclMinMaxQuoteBuying,
} from "~/lib/utils/calcFns";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { useAssetMetadata } from "~/lib/metadata";
import { SECONDARY_MARKET } from "~/providers/MarketsProvider/market.const";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { atomsToTokens } from "~/lib/utils/formaters";

export const spippageOptions = ["1", "3", "5", "custom"];

export const PopupContent: FC<{
  estate: SecondaryEstate;
  orderType: OrderType;
  setOrderType: React.Dispatch<React.SetStateAction<OrderType>>;
}> = ({ estate, orderType, setOrderType }) => {
  const { dodoMav, dodoTokenPair } = useDexContext();
  const {
    pickers: { pickDodoContractBasedOnToken, pickDodoContractQuoteToken },
  } = useMarketsContext();

  const [activetabId, setAvtiveTabId] = useState<OrderType>(orderType);
  const prevTabId = usePrevious(
    activetabId,
    activetabId !== CONFIRM
  ) as OrderType;

  // quote warning
  const [hasQuoteError, setHasQuoteError] = useState(false);

  // derived
  const { slug, decimals } = estate;
  const tokenPrice = useMemo(
    () => atomsToTokens(dodoMav[slug], decimals),
    [dodoMav, slug, decimals]
  );
  const isSecondaryEstate = estate.assetDetails.type === SECONDARY_MARKET;

  // metadata for selected asset
  const selectedAssetMetadata = useAssetMetadata(slug);

  const qouteAssetMetadata = useAssetMetadata(dodoTokenPair[slug]);

  const showQuoteWarning = useCallback(() => {
    setHasQuoteError(true);
    setAvtiveTabId(prevTabId);
  }, [prevTabId]);

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
      {
        id: OTC,
        label: "OTC",
        handleClick: handleTabClick,
        disabled: true,
      },
    ],
    [handleTabClick]
  );

  // --- input state
  const [amountB, setAmountB] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  // Slippage
  const [slippagePercentage, setSlippagePercentage] = useState<string>(
    spippageOptions[0]
  );

  useEffect(() => {
    if (isDefined(amountB) && tokenPrice) {
      setTotal(amountB.times(tokenPrice));
    } else if (!isDefined(amountB)) {
      setTotal(undefined);
    }
  }, [amountB, estate.token_address, slug, tokenPrice]);

  // reset values when switching tabs
  useLayoutEffect(() => {
    if (prevTabId !== activetabId && activetabId !== CONFIRM) {
      setAmountB(undefined);
    }
  }, [activetabId, prevTabId]);

  const marketBuyProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[estate.token_address],
      quoteTokenAddress: pickDodoContractQuoteToken[estate.token_address],
      tokensAmount: amountB?.div(tokenPrice).toNumber(),
      minMaxQuote: caclMinMaxQuoteBuying(amountB, slippagePercentage),
      decimals: selectedAssetMetadata?.decimals,
      quoteDecimals: qouteAssetMetadata?.decimals,
      showQuoteWarning: showQuoteWarning,
    }),
    [
      pickDodoContractBasedOnToken,
      estate.token_address,
      pickDodoContractQuoteToken,
      amountB,
      tokenPrice,
      slippagePercentage,
      selectedAssetMetadata?.decimals,
      qouteAssetMetadata?.decimals,
      showQuoteWarning,
    ]
  );

  const marketSellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[estate.token_address],

      tokenAddress: estate.token_address,
      tokensAmount: amountB?.toNumber(),
      minMaxQuote: caclMinMaxQuoteSelling(
        tokenPrice.times(amountB ?? 0),
        slippagePercentage
      ),
      decimals: selectedAssetMetadata?.decimals,
      quoteDecimals: qouteAssetMetadata?.decimals,
      showQuoteWarning: showQuoteWarning,
    }),
    [
      pickDodoContractBasedOnToken,
      estate.token_address,
      amountB,
      tokenPrice,
      slippagePercentage,
      selectedAssetMetadata?.decimals,
      qouteAssetMetadata?.decimals,
      showQuoteWarning,
    ]
  );

  // Market buy | sell
  const { invokeAction: handleMarketBuy, status: buyStatus } =
    useContractAction(buyBaseToken, marketBuyProps);

  const { invokeAction: handleMarketSell, status: sellStatus } =
    useContractAction(sellBaseToken, marketSellProps);

  // status of the operation
  const status = useMemo(
    () => pickStatusFromMultiple(buyStatus, sellStatus),
    [buyStatus, sellStatus]
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

        <span
          className={clsx(
            "px-2 py-[2px] rounded-[4px] text-body-xs  text-center",
            isSecondaryEstate
              ? "text-sand-800 bg-[#F6AFAFBF]"
              : "text-yellow-950 bg-[#FFD38FBF]"
          )}
        >
          {estate.assetDetails.propertyDetails.propertyType}
        </span>
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
            <div className="mb-8">
              <TabSwitcher tabs={tabs} activeTabId={activetabId} />
            </div>
          )}

          {/* TODO exctract as helper component */}
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
                  <div className="flex justify-between text-card-headline text-sand-900 w-full">
                    <h3>{estate.name}</h3>
                    <h3>
                      {orderType === BUY ? (
                        <Money
                          smallFractionFont={false}
                          cryptoDecimals={selectedAssetMetadata?.decimals}
                        >
                          {amountB?.div(tokenPrice).toNumber() ?? 0}
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
                    <span className="text-body text-sand-900">
                      $
                      {orderType === BUY
                        ? (amountB?.toNumber() ?? 0)
                        : (total?.toNumber() ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activetabId === BUY || activetabId === SELL) && (
            <BuySellScreen
              estate={estate}
              toggleScreen={() => setAvtiveTabId(CONFIRM)}
              actionType={activetabId}
              amount={amountB}
              setAmount={setAmountB}
              total={total}
              slippagePercentage={slippagePercentage}
              setSlippagePercentage={setSlippagePercentage}
              hasQuoteError={hasQuoteError}
            />
          )}

          {activetabId === OTC && <OTCPopupContent estate={estate} />}
          {activetabId === CONFIRM && (
            <BuySellConfirmationScreen
              actionType={orderType === BUY ? BUY : SELL}
              actionCb={orderType === BUY ? handleMarketBuy : handleMarketSell}
              status={status}
            />
          )}
        </div>
      </>
    </div>
  );
};

export const OTCPopupContent: FC<{ estate: SecondaryEstate }> = ({
  estate,
}) => {
  const [activeScreenId, setActiveScreenId] = useState<OTCScreenState>(OTC);
  const [activeTabId, setActiveTabId] = useState<OTCTabType>(OTC_BUY);

  const toggleBuyScreen = useCallback((id: OTCScreenState) => {
    setActiveScreenId(id);
  }, []);

  const toggleTabScreen = useCallback((id: OTCTabType) => {
    setActiveTabId(id);
  }, []);

  // TODO take from buysell screen
  const amount = 10;
  const price = 45;

  const tabs: TabType<OTCTabType>[] = useMemo(
    () => [
      {
        id: OTC_BUY,
        label: "OTC Buy",
        handleClick: toggleTabScreen,
      },
      {
        id: OTC_SELL,
        label: "OTC Sell",
        handleClick: toggleTabScreen,
      },
    ],
    [toggleTabScreen]
  );
  return (
    <div className="flex flex-col justify-between text-content h-full">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activeScreenId === CONFIRM && (
              <button onClick={() => toggleBuyScreen("otc")}>
                <ArrowLeftIcon className="size-6 mr-2" />
              </button>
            )}
          </div>

          {activeScreenId !== CONFIRM && (
            <TabSwitcher
              variant="secondary"
              tabs={tabs}
              activeTabId={activeTabId}
              grow={true}
            />
          )}

          {activeScreenId === OTC && (
            <OTCBuySellScreen
              symbol={estate.symbol}
              estate={estate}
              toggleScreen={toggleBuyScreen}
              activeTabId={activeTabId}
            />
          )}
          {activeScreenId === CONFIRM && (
            <BuySellConfirmationScreen
              estate={estate}
              tokenPrice={price}
              total={price * amount}
              amount={amount}
              actionType={activeTabId}
              estFee={0.21}
              actionCb={() => {}}
            />
          )}
        </div>
      </>
    </div>
  );
};
