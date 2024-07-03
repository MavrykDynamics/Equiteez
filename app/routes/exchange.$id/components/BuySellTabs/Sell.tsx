import { FC, useCallback, useState } from 'react';

import { Divider } from '~/lib/atoms/Divider';

import { Button } from '~/lib/atoms/Button';
import { sell } from '~/routes/properties.$id/components/PriceSection/actions/financial.actions';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import {
  useStatusFlag,
  STATUS_PENDING,
  STATUS_IDLE,
  getStatusLabel,
} from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';
import { usePropertyByAddress } from '~/routes/properties.$id/hooks/use-property-by-id';
import { FullScreenSpinner } from '~/lib/atoms/Spinner/Spinner';

type SellDEXContentProps = {
  initialAmount?: number;
  initialPrice?: number;
  symbol: string;
};

export const SellDEXContent: FC<SellDEXContentProps> = ({
  initialAmount,
  initialPrice,
  symbol,
}) => {
  const estate = usePropertyByAddress();

  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const [price, setPrice] = useState<number | string>(Number(initialPrice));
  const [amount, setAmount] = useState<number | string>(Number(initialAmount));

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

  if (!estate) return <FullScreenSpinner />;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col flex-grow gap-6">
        <div className="flex flex-col">
          <span className="text-card-headline">{estate?.name}</span>
          <span className="">
            {estate?.assetDetails.propertyDetails.fullAddress}
          </span>
        </div>

        <div className="flex flex-col flex-grow gap-4">
          <div className="flex flex-col gap-2">
            <div className={`w-full flex justify-start eq-input p-3`}>
              <span className="text-content-secondary opacity-50">Price</span>
              <span className="flex flex-grow gap-1">
                <input
                  name="price"
                  type="number"
                  min={0}
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-transparent focus:outline-none text-right"
                ></input>
                <span className="">USDT</span>
              </span>
            </div>

            <div className={`w-full flex justify-start eq-input p-3`}>
              <span className="text-content-secondary opacity-50">Amount</span>
              <span className="flex flex-grow gap-1">
                <input
                  name="amount"
                  type="number"
                  min={1}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Minimum 1"
                  className="w-full bg-transparent focus:outline-none text-right"
                ></input>
                <span className="">{symbol}</span>
              </span>
            </div>
          </div>

          <Divider></Divider>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Available Balance</span>
                <span className="text-caption-regular">1,034.7588004 USDT</span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Max Buy</span>
                <span className="text-caption-regular">8471.04 {symbol}</span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Est. Fee</span>
                <span className="text-caption-regular">-- USDT</span>
              </div>
            </div>

            <div className="flex">
              <div className={`w-full flex justify-between eq-input p-3`}>
                <span className="text-content-secondary opacity-50">Total</span>

                <span className="flex gap-1">
                  <span className="">
                    {amount ? Number(price) * Number(amount) : ''}
                  </span>
                  <span className="">USDT</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <Button variant="red" disabled={isLoading} onClick={handleSell}>
              {getStatusLabel(status, 'Sell')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
