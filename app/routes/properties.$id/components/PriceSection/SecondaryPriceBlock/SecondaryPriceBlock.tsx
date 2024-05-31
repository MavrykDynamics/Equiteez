import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '~/atoms/Button';
import { Divider } from '~/atoms/Divider';
import { TabType } from '~/atoms/Tab';
import { Table } from '~/atoms/Table/Table';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import {
  getStatusLabel,
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { TabSwitcher } from '~/organisms/TabSwitcher';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { PriceBuyTab } from './PriceBuyTab';
import { PriceOTCBuyTab } from './PriceOTCBuyTab';
import { MakeOfferScreen } from './MakeOfferScreen';

// contract actions
import { sell } from '../actions/financial.actions';
import { InputNumber } from '~/molecules/Input/Input';

type OrderType = 'buy' | 'sell' | '';

export const SecondaryPriceBlock: FC<{ symbol: string }> = ({ symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('');

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType('');
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  return (
    <section className="self-start">
      <Table>
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <p>$45.00</p>
        </div>
        <div className="text-content text-buttons flex justify-between mb-4">
          <p>Annual Return</p>
          <p>8.88%</p>
        </div>
        <div className="text-content text-buttons flex justify-between">
          <p>Rental Yield</p>
          <p>4.83%</p>
        </div>
        <Divider className="my-4" />
        <div className="text-content text-buttons flex justify-between mb-6">
          <p>Total Liquidity</p>
          <p>$100,000.00</p>
        </div>
        <Button onClick={handleOpen.bind(null, 'buy')}>Buy</Button>
        <Button
          variant="outline"
          className="mt-3"
          onClick={handleOpen.bind(null, 'sell')}
        >
          Sell
        </Button>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        {orderType === 'buy' && <BuyPopupContent symbol={symbol} />}
        {orderType === 'sell' && <SellPopupContent symbol={symbol} />}
      </PopupWithIcon>
    </section>
  );
};

const BuyPopupContent: FC<{ symbol: string }> = ({ symbol }) => {
  const [isOfferScreen, setIsOfferScreen] = useState(false);

  const toggleMakeOfferScreen = useCallback(() => {
    setIsOfferScreen(!isOfferScreen);
  }, [isOfferScreen]);

  const [activetabId, setAvtiveTabId] = useState('buy');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'buy',
        label: 'Buy',
        handleClick: handleTabClick,
      },
      {
        id: 'otcBuy',
        label: 'OTC Buy',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <div className="flex flex-col justify-between text-content h-full">
      {isOfferScreen ? (
        <MakeOfferScreen toggleMakeOfferScreen={toggleMakeOfferScreen} />
      ) : (
        <>
          <div className="flex-1 flex flex-col">
            <div>
              <h3 className="text-card-headline">{symbol} Front</h3>
              <p className="text-body-xs mb-6">
                335 Wilburton Lane, Northport, AL 35473
              </p>

              <TabSwitcher tabs={tabs} activeTabId={activetabId} />
            </div>

            {activetabId === 'buy' && <PriceBuyTab symbol={symbol} />}
            {activetabId === 'otcBuy' && (
              <PriceOTCBuyTab toggleMakeOfferScreen={toggleMakeOfferScreen} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// TODO move, this is done for demo purposes
const SellPopupContent: FC<{ symbol: string }> = ({ symbol }) => {
  const { status, dispatch, isLoading } = useStatusFlag();
  const { dapp } = useWalletContext();

  const [price, setPrice] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');

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
        marketContractAddress: pickMarketBasedOnSymbol[symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contact error');
    }
  }, [amount, dapp, dispatch, price, symbol]);

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <div className="flex-1">
        <h3 className="text-card-headline">{symbol} Front</h3>
        <p className="text-body-xs mb-6">
          335 Wilburton Lane, Northport, AL 35473
        </p>
        <div className="mt-4">
          <div className="flex flex-col gap-y-2">
            <InputNumber
              handleValue={setPrice}
              label={'Price'}
              value={price || ''}
              placeholder={'0.00'}
              valueText="USDT"
              name={'price'}
            />
            <InputNumber
              handleValue={setAmount}
              label={'Amount'}
              value={amount || ''}
              placeholder={'Minimum 1'}
              valueText={symbol}
              name={'amount'}
            />
          </div>
          <Divider className="my-4" />
          <div className="mb-3">
            <div className="flex justify-between text-secondary-content text-caption-regular mb-1">
              <p>Available Balance</p>
              <p>1,034.75 USDT</p>
            </div>
            <div className="flex justify-between text-secondary-content text-caption-regular mb-1">
              <p>Max Sell</p>
              <p>10.84 {symbol}</p>
            </div>
            <div className="flex justify-between text-secondary-content text-caption-regular">
              <p>Est. Fee</p>
              <p>-- {symbol}</p>
            </div>
          </div>

          <InputNumber
            label={'Total'}
            value={
              price && amount ? (Number(price) * Number(amount)).toFixed(2) : 0
            }
            placeholder={'0'}
            valueText="USDT"
            name={'total'}
            disabled
          />
        </div>
      </div>
      <Button disabled={isLoading} onClick={handleSell}>
        {getStatusLabel(status, 'Sell')}
      </Button>
    </div>
  );
};
