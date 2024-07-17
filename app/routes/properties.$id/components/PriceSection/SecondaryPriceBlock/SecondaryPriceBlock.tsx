import { FC, useCallback, useEffect, useMemo, useState } from 'react';

// hooks
import {
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';

// providers
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
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
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import { buy, sell } from '../actions/financial.actions';

// icons
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';

//consts & types
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import {
  BUY,
  BuyScreenState,
  CONFIRM,
  OTC,
  OTC_BUY,
  OTC_SELL,
  OTCScreenState,
  OTCTabType,
  SELL,
  SellScreenState,
  TOKEN_PRICE,
} from './screens/consts';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';

// types
type OrderType = typeof BUY | typeof SELL | typeof OTC | '';

export const SecondaryPriceBlock: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('');
  const { activeEstate } = useEstatesContext();

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType('');
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  if (!activeEstate) return <>Loading...</>;
  const estate = activeEstate as SecondaryEstate;

  return (
    <section className="self-start">
      <Table>
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <p>${estate.assetDetails.priceDetails.price}</p>
        </div>
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Annual Return</p>
          <p>{estate.assetDetails.priceDetails.annualReturn}%</p>
        </div>
        <div className="text-content text-buttons flex justify-between">
          <p>Rental Yield</p>
          <p>{estate.assetDetails.priceDetails.rentalYield}%</p>
        </div>
        <Divider className="my-4" />
        <div className="text-content text-buttons flex justify-between mb-6">
          <p>Total Liquidity</p>
          <div className="flex items-center gap-1">
            ${estate.assetDetails.priceDetails.totalLiquidity}
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 mt-3">
          <Button onClick={handleOpen.bind(null, BUY)}>Buy</Button>
          <Button variant="red" onClick={handleOpen.bind(null, SELL)}>
            Sell
          </Button>
        </div>
        <Divider className="my-3" />
        <Button
          className="bg-blue-300 hover:bg-blue-200"
          onClick={handleOpen.bind(null, OTC)}
        >
          OTC
        </Button>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        {orderType === 'buy' && <BuyPopupContent estate={estate} />}
        {orderType === 'sell' && <SellPopupContent estate={estate} />}
        {orderType === 'otc' && <OTCPopupContent estate={estate} />}
      </PopupWithIcon>
    </section>
  );
};

const BuyPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
  const { dapp } = useWalletContext();
  const { dispatch } = useStatusFlag();
  const [activeScreenId, setActiveScreenId] = useState<BuyScreenState>(BUY);

  // amount & total
  const [amount, setAmount] = useState<string | number>('');
  const [total, setTotal] = useState<string | number>('');

  useEffect(() => {
    if (typeof amount === 'number') {
      setTotal(amount * TOKEN_PRICE);
    }
  }, [amount]);

  const toggleBuyScreen = useCallback((id: BuyScreenState) => {
    setActiveScreenId(id);
  }, []);

  const handleBuy = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await buy({
        tezos,
        marketContractAddress: pickMarketBasedOnSymbol[estate.symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(TOKEN_PRICE),
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, estate.symbol]);

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activeScreenId === CONFIRM && (
              <button onClick={() => toggleBuyScreen(BUY)}>
                <ArrowLeftIcon className="size-6 mr-2" />
              </button>
            )}
            <h3 className="text-card-headline">{estate.name}</h3>
          </div>
          <Divider className="my-4" />

          {activeScreenId === BUY && (
            <BuySellScreen
              symbol={estate.symbol}
              toggleScreen={toggleBuyScreen}
              actionType={BUY}
              currency="USDT"
              amount={amount}
              setAmount={setAmount}
              total={total}
              setTotal={setTotal}
            />
          )}
          {activeScreenId === CONFIRM && (
            <BuySellConfirmationScreen
              symbol={estate.symbol}
              tokenPrice={TOKEN_PRICE}
              total={total}
              actionType={BUY}
              estFee={0.21}
              actionCb={handleBuy}
            />
          )}
        </div>
      </>
    </div>
  );
};

const SellPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
  const [activeScreenId, setActiveScreenid] = useState<SellScreenState>(SELL);

  // amount & total
  const [amount, setAmount] = useState<string | number>('');
  const [total, setTotal] = useState<string | number>('');

  useEffect(() => {
    if (typeof amount === 'number') {
      setTotal(amount * TOKEN_PRICE);
    }
  }, [amount]);

  const toggleSellScreen = useCallback((id: SellScreenState) => {
    setActiveScreenid(id);
  }, []);

  const { dispatch } = useStatusFlag();
  const { dapp } = useWalletContext();

  const handleSell = useCallback(async () => {
    try {
      dispatch(STATUS_PENDING);

      const tezos = dapp?.tezos();

      // No Toolkit
      if (!tezos) {
        dispatch(STATUS_IDLE);
        return;
      }
      await sell({
        tezos,
        marketContractAddress: pickMarketBasedOnSymbol[estate.symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(TOKEN_PRICE - 10),
      });
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contact error');
    }
  }, [amount, dapp, dispatch, estate.symbol]);

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activeScreenId === CONFIRM && (
              <button onClick={() => toggleSellScreen(SELL)}>
                <ArrowLeftIcon className="size-6 mr-2" />
              </button>
            )}
            <h3 className="text-card-headline">{estate.name}</h3>
          </div>
          <Divider className="my-4" />

          {activeScreenId === SELL && (
            <BuySellScreen
              symbol={estate.symbol}
              toggleScreen={toggleSellScreen}
              actionType={SELL}
              currency={estate.symbol}
              amount={amount}
              setAmount={setAmount}
              total={total}
              setTotal={setTotal}
            />
          )}
          {activeScreenId === CONFIRM && (
            <BuySellConfirmationScreen
              symbol={estate.symbol}
              tokenPrice={TOKEN_PRICE}
              total={total}
              actionType={SELL}
              estFee={0.21}
              actionCb={handleSell}
            />
          )}
        </div>
      </>
    </div>
  );
};

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
            <h3 className="text-card-headline">{estate.name}</h3>
          </div>
          <Divider className="my-6" />

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
              symbol={estate.symbol}
              tokenPrice={price}
              total={price * amount}
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
