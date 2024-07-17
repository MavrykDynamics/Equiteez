import { FC, useCallback, useState } from 'react';
import { Button } from '~/lib/atoms/Button';
import { Divider } from '~/lib/atoms/Divider';
import { Table } from '~/lib/atoms/Table/Table';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import {
  getStatusLabel,
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { BuyScreen } from './screens/BuyScreen';
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';

// contract actions
import { buy, sell } from '../actions/financial.actions';
import { InputNumber } from '~/lib/molecules/Input/Input';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { BuySellConfirmationScreen } from './screens/BuySellConfirmationScreen';

type OrderType = 'buy' | 'sell' | '';

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
          <Button onClick={handleOpen.bind(null, 'buy')}>Buy</Button>
          <Button variant="red" onClick={handleOpen.bind(null, 'sell')}>
            Sell
          </Button>
        </div>
        <Divider className="my-3" />
        <Button className="bg-blue-300 hover:bg-blue-200">OTC</Button>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        {orderType === 'buy' && <BuyPopupContent estate={estate} />}
        {orderType === 'sell' && <SellPopupContent estate={estate} />}
      </PopupWithIcon>
    </section>
  );
};

const BuyPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
  const { dapp } = useWalletContext();
  // TODO take values from BuyScreen or move state here
  const amount = 10;
  const price = 45;
  const { dispatch } = useStatusFlag();
  const [activetabId, setAvtiveTabId] = useState('buy');

  const toggleBuyScreen = useCallback((id: string) => {
    setAvtiveTabId(id);
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
        pricePerToken: Number(price),
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, price, estate.symbol]);

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            {activetabId === 'confirm' && (
              <button onClick={() => toggleBuyScreen('buy')}>
                <ArrowLeftIcon className="size-6 mr-2" />
              </button>
            )}
            <h3 className="text-card-headline">{estate.name}</h3>
          </div>
          <Divider className="my-4" />

          {activetabId === 'buy' && (
            <BuyScreen
              symbol={estate.symbol}
              toggleBuyScreen={toggleBuyScreen}
            />
          )}
          {activetabId === 'confirm' && (
            <BuySellConfirmationScreen
              symbol={estate.symbol}
              tokenPrice={price}
              total={price * amount}
              actionType="buy"
              estFee={0.21}
              actionCb={handleBuy}
            />
          )}
        </div>
      </>
    </div>
  );
};

// TODO move, this is done for demo purposes
const SellPopupContent: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
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
        marketContractAddress: pickMarketBasedOnSymbol[estate.symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contact error');
    }
  }, [amount, dapp, dispatch, price, estate.symbol]);

  return (
    <div className="flex flex-col justify-between text-content h-full">
      <div className="flex-1">
        <h3 className="text-card-headline">{estate.name}</h3>

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
              valueText={estate.symbol}
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
              <p>10.84 {estate.symbol}</p>
            </div>
            <div className="flex justify-between text-secondary-content text-caption-regular">
              <p>Est. Fee</p>
              <p>-- {estate.symbol}</p>
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
      <Button variant="red" disabled={isLoading} onClick={handleSell}>
        {getStatusLabel(status, 'Sell')}
      </Button>
    </div>
  );
};
