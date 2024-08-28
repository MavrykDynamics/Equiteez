import { FC, useCallback, useEffect, useMemo, useState } from 'react';

// providers
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

//screens
import { BuySellScreen } from './screens/BuySellScreen';
import { BuySellConfirmationScreen } from './screens/BuySellConfirmationScreen';
import { OTCBuySellScreen } from './screens/OTCBuySellScreen';

// components
import { Button } from '~/lib/atoms/Button';
import { Divider } from '~/lib/atoms/Divider';
import { Table } from '~/lib/atoms/Table/Table';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { TabType } from '~/lib/atoms/Tab';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';

// contract actions
import { pickOrderbookContract } from '~/consts/contracts';

// icons
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';

//consts & types
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import {
  BUY,
  CONFIRM,
  OTC,
  OTC_BUY,
  OTC_SELL,
  OTCScreenState,
  OTCTabType,
  SELL,
} from './screens/consts';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { CommaNumber } from '~/lib/atoms/CommaNumber';
import { orderbookBuy, orderbookSell } from '~/contracts/orderbook.contract';
import { useContractAction } from '~/contracts/hooks/useContractAction';
import { ProgresBar } from './components/ProgressBar/ProgressBar';
import usePrevious from '~/hooks/use-previous';
import BigNumber from 'bignumber.js';
import { isDefined } from '~/lib/utils';

// types
export type OrderType = typeof BUY | typeof SELL | typeof OTC | typeof CONFIRM;

export const SecondaryPriceBlock: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(BUY);
  const { activeEstate } = useEstatesContext();

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType(BUY);
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  if (!activeEstate) return <>Loading...</>;
  const estate = activeEstate as SecondaryEstate;

  return (
    <section className="self-start">
      <Table className="bg-white">
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <CommaNumber
            value={estate.assetDetails.priceDetails.price}
            beginningText="$"
          />
        </div>
        <div className="text-content body flex justify-between mb-4">
          <p className="flex items-center gap-1">
            Total Return
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.priceDetails.annualReturn}%
          </p>
        </div>
        <div className="text-content body flex justify-between mb-4">
          <p className="flex items-center gap-1">
            Expected Income
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.financials.expectedIncome.income}%
          </p>
        </div>
        <div className="text-content body flex justify-between">
          <p className="flex items-center gap-1">
            Investors
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.offering.minInvestmentAmount}
          </p>
        </div>
        <Divider className="my-4" />
        <div className="text-content text-buttons flex justify-between mb-6">
          <p>Total Liquidity</p>
          <div className="flex items-center gap-1">
            ${estate.assetDetails.priceDetails.totalLiquidity}
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </div>
        </div>

        <ProgresBar />
        <div className="grid gap-3 grid-cols-2 mt-4">
          <Button onClick={handleOpen.bind(null, BUY)}>Buy</Button>
          <Button variant="outline" onClick={handleOpen.bind(null, SELL)}>
            Sell
          </Button>
        </div>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <PopupContent estate={estate} orderType={orderType} />
      </PopupWithIcon>
    </section>
  );
};

const PopupContent: FC<{ estate: SecondaryEstate; orderType: OrderType }> = ({
  estate,
  orderType,
}) => {
  const { tokensPrices, tokensMetadata } = useTokensContext();
  const [activetabId, setAvtiveTabId] = useState(orderType);
  const prevTabId = usePrevious(activetabId) as OrderType;

  const handleTabClick = useCallback((id: OrderType) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
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
        <span className="px-2 py-[2px] rounded-[4px] text-body-xs text-sand-800 bg-red-50 text-center">
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
              <HeadlinePreviewSection />
            )}
          </div>
          <Divider className="my-6" />

          {activetabId !== CONFIRM && (
            <div className="mb-8">
              <TabSwitcher tabs={tabs} activeTabId={activetabId} />
            </div>
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
                  <div className="flex justify-between text-card-headline text-sand-900 w-full">
                    <h3>{estate.name}</h3>
                    <h3>
                      {amountB?.toNumber() ?? 0} {estate.symbol}
                    </h3>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="px-2 py-[2px] rounded-[4px] text-body-xs text-sand-800 bg-red-50 text-center">
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
              estate={estate}
              tokenPrice={tokensPrices[estate.token_address]}
              total={Number(total)}
              actionType={prevTabId === BUY ? BUY : SELL}
              amount={0}
              estFee={0.21}
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

// const SellPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
//   const [activeScreenId, setActiveScreenid] = useState<SellScreenState>(SELL);
//   const { tokensPrices, tokensMetadata } = useTokensContext();

//   // amount & total
//   const [total, setTotal] = useState<string | number>('');

//   const { amount, previewAmount, handleAmountChange } = useTokensAmount(
//     estate.token_address
//   );

//   useEffect(() => {
//     if (previewAmount && tokensPrices[estate.token_address]) {
//       setTotal(
//         rwaToFixed(Number(previewAmount) * tokensPrices[estate.token_address])
//       );
//     } else if (!previewAmount) {
//       setTotal('');
//     }
//   }, [previewAmount, estate.token_address, tokensPrices]);

//   const toggleSellScreen = useCallback((id: SellScreenState) => {
//     setActiveScreenid(id);
//   }, []);

//   const sellProps = useMemo(
//     () => ({
//       marketContractAddress: pickOrderbookContract[estate.token_address],
//       rwaTokenAddress: estate.token_address,
//       tokensAmount: Number(amount),
//       pricePerToken: Number(tokensPrices[estate.token_address]),
//       decimals: tokensMetadata[estate.token_address]?.decimals,
//     }),
//     [amount, estate.token_address, tokensMetadata, tokensPrices]
//   );

//   const { invokeAction: handleOrderbookSell } = useContractAction(
//     orderbookSell,
//     sellProps
//   );

//   return (
//     <div className="flex flex-col justify-between text-content h-full">
//       <>
//         <div className="flex-1 flex flex-col">
//           <div className="flex items-center">
//             {activeScreenId === CONFIRM && (
//               <button onClick={() => toggleSellScreen(SELL)}>
//                 <ArrowLeftIcon className="size-6 mr-2" />
//               </button>
//             )}
//             <h3 className="text-card-headline">{estate.name}</h3>
//           </div>
//           <Divider className="my-6" />

//           {activeScreenId === SELL && (
//             <BuySellScreen
//               estate={estate}
//               toggleScreen={toggleSellScreen}
//               actionType={SELL}
//               currency={estate.symbol}
//               amount={amount}
//               setAmount={handleAmountChange}
//               total={total}
//               setTotal={setTotal}
//             />
//           )}
//           {activeScreenId === CONFIRM && (
//             <BuySellConfirmationScreen
//               estate={estate}
//               tokenPrice={tokensPrices[estate.token_address]}
//               total={Number(total)}
//               actionType={SELL}
//               estFee={0.21}
//               amount={amount}
//               actionCb={handleOrderbookSell}
//             />
//           )}
//         </div>
//       </>
//     </div>
//   );
// };

const OTCPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
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

  // @ts-expect-error // id is string, but types for ids, TODO update TabType with generics
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
