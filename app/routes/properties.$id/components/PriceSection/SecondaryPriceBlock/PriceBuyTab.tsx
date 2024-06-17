import { FC, useCallback, useState } from 'react';
import { Button } from '~/lib/atoms/Button';
import { Divider } from '~/lib/atoms/Divider';
import {
  getStatusLabel,
  STATUS_IDLE,
  STATUS_PENDING,
  useStatusFlag,
} from '~/hooks/use-status-flag';
import { InputNumber } from '~/lib/molecules/Input/Input';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { buy } from '../actions/financial.actions';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';

type PriceBuyTabProps = {
  symbol: string;
};

export const PriceBuyTab: FC<PriceBuyTabProps> = ({ symbol }) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const [price, setPrice] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');

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
        marketContractAddress: pickMarketBasedOnSymbol[symbol],
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }, [amount, dapp, dispatch, price, symbol]);

  return (
    <div className="flex flex-col flex-1">
      <div className="mt-4 flex-1">
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
            <p>Max Buy</p>
            <p>17.84 {symbol}</p>
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
      <Button disabled={isLoading} onClick={handleBuy}>
        {getStatusLabel(status, 'Buy')}
      </Button>
    </div>
  );
};
