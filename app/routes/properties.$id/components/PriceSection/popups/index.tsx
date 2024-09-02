import { FC, useCallback, useEffect, useMemo, useState } from 'react';

//screens
import { BuySellScreen } from '../screens/BuySellScreen';
import { BuySellConfirmationScreen } from '../screens/BuySellConfirmationScreen';
import { OTCBuySellScreen } from '../screens/OTCBuySellScreen';

// components
import { Divider } from '~/lib/atoms/Divider';
import { TabType } from '~/lib/atoms/Tab';

// contract actions
import { pickOrderbookContract } from '~/consts/contracts';

// icons
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';

//consts & types
import {
  SECONDARY_MARKET,
  SecondaryEstate,
} from '~/providers/EstatesProvider/estates.types';
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
} from '../consts';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { orderbookBuy, orderbookSell } from '~/contracts/orderbook.contract';
import { useContractAction } from '~/contracts/hooks/useContractAction';
import usePrevious from '~/hooks/use-previous';
import BigNumber from 'bignumber.js';
import { isDefined } from '~/lib/utils';
import { ProgresBar } from '../PrimaryPriceBlock';
import clsx from 'clsx';

export const PopupContent: FC<{
  estate: SecondaryEstate;
  orderType: OrderType;
}> = ({ estate, orderType }) => {
  const isSecondaryEstate = estate.assetDetails.type === SECONDARY_MARKET;

  const { tokensPrices, tokensMetadata } = useTokensContext();
  const [activetabId, setAvtiveTabId] = useState(orderType);
  const prevTabId = usePrevious(activetabId) as OrderType;

  const handleTabClick = useCallback((id: OrderType) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType<OrderType>[] = useMemo(
    () => [
      {
        id: BUY,
        label: 'Buy',
        handleClick: handleTabClick,
      },
      {
        id: SELL,
        label: 'Sell',
        handleClick: handleTabClick,
      },
      {
        id: OTC,
        label: 'OTC',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  // --- NEW
  const [amountB, setAmountB] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  useEffect(() => {
    if (isDefined(amountB) && tokensPrices[estate.token_address]) {
      setTotal(amountB.times(tokensPrices[estate.token_address]));
    } else if (!isDefined(amountB)) {
      setTotal(undefined);
    }
  }, [amountB, estate.token_address, tokensPrices]);

  const buyProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[estate.token_address],
      tokensAmount: amountB?.toNumber(),
      pricePerToken: Number(tokensPrices[estate.token_address]),
      decimals: tokensMetadata[estate.token_address]?.decimals,
    }),
    [amountB, estate.token_address, tokensMetadata, tokensPrices]
  );

  const sellProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[estate.token_address],
      rwaTokenAddress: estate.token_address,
      tokensAmount: amountB?.toNumber(),
      pricePerToken: Number(tokensPrices[estate.token_address]),
      decimals: tokensMetadata[estate.token_address]?.decimals,
    }),
    [amountB, estate.token_address, tokensMetadata, tokensPrices]
  );

  const { invokeAction: handleOrderbookSell } = useContractAction(
    orderbookSell,
    sellProps
  );

  const { invokeAction: handleOrderbookBuy } = useContractAction(
    orderbookBuy,
    buyProps
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
            'px-2 py-[2px] rounded-[4px] text-body-xs  text-center',
            isSecondaryEstate
              ? 'text-sand-800 bg-[#F6AFAFBF]'
              : 'text-yellow-950 bg-[#FFD38FBF]'
          )}
        >
          {estate.assetDetails.propertyDetails.propertyType}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activetabId === CONFIRM ? (
              <div className="flex items-center">
                <button onClick={() => setAvtiveTabId(prevTabId)}>
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
                      {amountB?.toNumber() ?? 0} {estate.symbol}
                    </h3>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="px-2 py-[2px] rounded-[4px] text-body-xs text-sand-800 bg-[#F6AFAFBF] text-center">
                      {estate.assetDetails.propertyDetails.propertyType}
                    </span>
                    <span className="text-body text-sand-900">
                      ${total?.toNumber() ?? 0}
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
              currency={activetabId === BUY ? 'USDT' : estate.symbol}
              amount={amountB}
              setAmount={setAmountB}
              total={total}
            />
          )}

          {activetabId === OTC && <OTCPopupContent estate={estate} />}
          {activetabId === CONFIRM && (
            <BuySellConfirmationScreen
              actionType={prevTabId === BUY ? BUY : SELL}
              actionCb={
                prevTabId === BUY ? handleOrderbookBuy : handleOrderbookSell
              }
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
        label: 'OTC Buy',
        handleClick: toggleTabScreen,
      },
      {
        id: OTC_SELL,
        label: 'OTC Sell',
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
              <button onClick={() => toggleBuyScreen('otc')}>
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
