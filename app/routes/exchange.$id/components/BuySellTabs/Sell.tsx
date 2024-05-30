import { FC, useCallback, useMemo, useState } from 'react';
import { usePropertyById } from '../../hooks/use-property-by-id';

import { Divider } from '~/atoms/Divider';

import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { Button } from '~/atoms/Button';
import MenuMulti from './MenuMulti';
import DotFill from '~/icons/dot-fill.svg?react';
import DotEmpty from '~/icons/dot-empty.svg?react';
import EQLogo from '~/icons/eq-small-logo.svg?react';
import { useParams } from '@remix-run/react';
import { sell } from '~/routes/properties.$id/components/PriceSection/actions/financial.actions';
import { oceanContract } from '~/consts/contracts';
import { useStatusFlag, STATUS_PENDING, STATUS_IDLE, getStatusLabel } from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';

export const Sell = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const [price, setPrice] = useState<number | string>(Number(''));
  const [amount, setAmount] = useState<number | string>(Number(''));

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col w-full gap-6">
        <div className="flex flex-col w-full gap-3">
          <div className="w-full flex flex-col relative">
            <MenuMulti choose="Market" items={['Market', 'Limit']}></MenuMulti>
          </div>

          <div className={`w-full flex justify-between eq-input p-3`}>
            <span className="text-content-secondary opacity-50">Price</span>

            <span className="flex gap-1">
              <span className="">
                <input
                  name="amount"
                  type="number"
                  min={1}
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-transparent focus:outline-none text-right"
                ></input>
              </span>
              <span className="">USDT</span>
            </span>
          </div>

          <div className={`w-full flex justify-start eq-input p-3`}>
            <span className="text-content-secondary opacity-50">Amount</span>

            <span className="flex gap-1">
              <span className="">
                <input
                  name="amount"
                  type="number"
                  min={1}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Minimum 1"
                  className="w-full bg-transparent focus:outline-none text-right"
                ></input>
              </span>
              <span className="">CV</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full gap-1">
          <div className="flex w-full h-2.5 relative">
            <div className="absolute w-full h-full flex justify-between z-20">
              <EQLogo className="size-2.5 cursor-grab" />
              <DotEmpty className="size-2.5" />
              <DotEmpty className="size-2.5" />
              <DotEmpty className="size-2.5" />
              <DotFill className="size-2.5" />
            </div>

            <div className="absolute w-full h-full flex items-center z-10">
              <div className="w-full h-[1px] bg-divider"></div>
            </div>
          </div>

          <div className="flex w-full justify-between">
            <span className="eq-slider">0%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span className="eq-slider">&nbsp;25%&nbsp;</span>
            <span className="eq-slider">&nbsp;&nbsp;50%&nbsp;&nbsp;</span>
            <span className="eq-slider">&nbsp;&nbsp;&nbsp;75%</span>
            <span className="eq-slider">100%</span>
          </div>
        </div>
      </div>

      <div className="flex w-full">
        <div className={`w-full flex justify-between eq-input p-3`}>
          <span className="text-content-secondary opacity-50">Total</span>

          <span className="flex gap-1">
            <span className="">
              {!!amount ? Number(price) * Number(amount) : ''}
            </span>
            <span className="">USDT</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col w-full gap-1">
        <div className="flex justify-between w-full">
          <span className="text-caption-regular">Avbl</span>
          <span className="text-caption-regular">1,034.75 USDT</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="text-caption-regular">Max Buy</span>
          <span className="text-caption-regular">8471.04 CV</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="text-caption-regular">Est. Fee</span>
          <span className="text-caption-regular">-- USDT</span>
        </div>
      </div>

      <div className="flex w-full">
        <Button className="w-full" onClick={handleOpen}>
          Sell
        </Button>
      </div>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <SellDEXContent initialAmount={Number(amount)} initialPrice={Number(price)} />
      </PopupWithIcon>
    </div>
  );
};

type SellDEXContentProps = {
  initialAmount?: number;
  initialPrice?: number;
};

const SellDEXContent: FC<SellDEXContentProps> = ({ initialAmount, initialPrice }) => {
  const { id } = useParams();
  const { estate } = usePropertyById(id);

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
        marketContractAddress: oceanContract,
        dispatch,
        tokensAmount: Number(amount),
        pricePerToken: Number(price),
      });
    } catch (e) {
      // TODO handle Errors with context
      console.log(e, 'Sell contact error');
    }
  }, [amount, dapp, dispatch, price]);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col flex-grow gap-6">
        <div className="flex flex-col">
          <span className="text-card-headline">{estate?.title}</span>
          <span className="">{estate?.details.fullAddress}</span>
        </div>

        <div className="flex flex-col flex-grow gap-4">
          <div className="flex flex-col gap-2">
            <div className={`w-full flex justify-start eq-input p-3`}>
              <span className="text-content-secondary opacity-50">
                Price
              </span>
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
              <span className="text-content-secondary opacity-50">
                Amount
              </span>
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
                <span className="">CV</span>
              </span>
            </div>
          </div>

          <Divider></Divider>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between w-full">
                <span className="text-caption-regular">
                  Available Balance
                </span>
                <span className="text-caption-regular">
                  1,034.7588004 USDT
                </span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Max Buy</span>
                <span className="text-caption-regular">8471.04 CV</span>
              </div>

              <div className="flex justify-between w-full">
                <span className="text-caption-regular">Est. Fee</span>
                <span className="text-caption-regular">-- USDT</span>
              </div>
            </div>

            <div className="flex">
              <div className={`w-full flex justify-between eq-input p-3`}>
                <span className="text-content-secondary opacity-50">
                  Total
                </span>

                <span className="flex gap-1">
                  <span className="">
                    {!!amount ? Number(price) * Number(amount) : ''}
                  </span>
                  <span className="">USDT</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <Button disabled={isLoading} onClick={handleSell}>
              {getStatusLabel(status, 'Sell')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
