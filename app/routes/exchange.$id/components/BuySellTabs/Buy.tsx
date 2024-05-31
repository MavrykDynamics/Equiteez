import { FC, useCallback, useMemo, useState } from 'react';
import { usePropertyById } from '../../hooks/use-property-by-id';

import { TabType } from '~/atoms/Tab';
import { TabSwitcher } from '~/organisms/TabSwitcher';

import { Divider } from '~/atoms/Divider';

import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';

import otc from '~/mocks/otc.json';
import { Button } from '~/atoms/Button';
import MenuMulti from './MenuMulti';
import DotFill from '~/icons/dot-fill.svg?react';
import DotEmpty from '~/icons/dot-empty.svg?react';
import EQLogo from '~/icons/eq-small-logo.svg?react';
import { useParams } from '@remix-run/react';
import { buy } from '~/routes/properties.$id/components/PriceSection/actions/financial.actions';
import { pickMarketBasedOnSymbol } from '~/consts/contracts';
import {
  useStatusFlag,
  STATUS_PENDING,
  STATUS_IDLE,
  getStatusLabel,
} from '~/hooks/use-status-flag';
import { useWalletContext } from '~/providers/WalletProvider/wallet.provider';

type BuyProps = {
  symbol: string;
};

export const Buy: FC<BuyProps> = ({ symbol }) => {
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
              <span className="">{symbol}</span>
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
              {amount ? Number(price) * Number(amount) : ''}
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
          <span className="text-caption-regular">8471.04 {symbol}</span>
        </div>

        <div className="flex justify-between w-full">
          <span className="text-caption-regular">Est. Fee</span>
          <span className="text-caption-regular">-- USDT</span>
        </div>
      </div>

      <div className="flex w-full">
        <Button className="w-full" onClick={handleOpen}>
          Buy
        </Button>
      </div>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <BuyDEXContent
          initialAmount={Number(amount)}
          initialPrice={Number(price)}
          symbol={symbol}
        />
      </PopupWithIcon>
    </div>
  );
};

type BuyDEXContentProps = {
  initialAmount?: number;
  initialPrice?: number;
  symbol: string;
};

const BuyDEXContent: FC<BuyDEXContentProps> = ({
  initialAmount,
  initialPrice,
  symbol,
}) => {
  const { id } = useParams();
  const { estate } = usePropertyById(id);

  const columnsOTC = [
    {
      label: 'Seller',
      field: 'seller',
    },
    {
      label: 'For Sale',
      field: 'sale',
    },
    {
      label: 'Price',
      field: 'price',
    },
    {
      label: 'Total Value',
      field: 'value',
    },
    {
      label: 'Tokens to Buy',
    },
  ];

  const [activetabId, setAvtiveTabId] = useState('market');

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const tabs: TabType[] = useMemo(
    () => [
      {
        id: 'market',
        label: 'Market Buy',
        handleClick: handleTabClick,
      },
      {
        id: 'otc',
        label: 'OTC Buy',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();

  const [price, setPrice] = useState<number | string>(Number(initialPrice));
  const [amount, setAmount] = useState<number | string>(Number(initialAmount));

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
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col flex-grow gap-6">
        <div className="flex flex-col">
          <span className="text-card-headline">{estate?.title}</span>
          <span className="">{estate?.details.fullAddress}</span>
        </div>

        <div className="flex flex-col flex-grow gap-4">
          <TabSwitcher tabs={tabs} activeTabId={activetabId} grow={true} />

          {activetabId == 'market' ? (
            <>
              <div className="flex flex-col gap-2">
                {/* <div className={`w-full flex justify-end`}>
                  <span className="text-body-xs">
                    Market Price: {price} USDT
                  </span>
                </div> */}

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
                    <span>{symbol}</span>
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
                        {amount ? Number(price) * Number(amount) : ''}
                      </span>
                      <span className="">USDT</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <Button disabled={isLoading} onClick={handleBuy}>
                  {getStatusLabel(status, 'Buy')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Divider className=""></Divider>

              <div className={`w-full flex justify-between items-center`}>
                <span className="text-body-xs">Lowest Price: {price} USDT</span>

                <Button variant="outline" size="outline">
                  Make an Offer
                </Button>
              </div>

              <div className="flex">
                <div className="flow-root w-full">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            {columnsOTC.map((column) => (
                              <th
                                key={column.label}
                                scope="col"
                                className="whitespace-nowrap p-2 text-left text-caption-regular"
                              >
                                <span className="flex items-center gap-1">
                                  {column.label}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-transparent bg-white">
                          {otc.map((order, index) => (
                            <tr key={`${order.seller}${index}`}>
                              <td className="eq-table-cell">
                                {order.seller || ''}
                              </td>

                              <td className="eq-table-cell">
                                {order.sale || ''}
                              </td>

                              <td className="eq-table-cell">
                                ${order.price || ''}
                              </td>

                              <td className="eq-table-cell">
                                ${order.value || ''}
                              </td>

                              <td className="eq-table-cell justify-center max-w-32">
                                <div
                                  className={`w-full flex justify-start eq-input px-4 py-1.5`}
                                >
                                  <input
                                    name="text"
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-transparent focus:outline-none text-center"
                                  ></input>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                      <span className="">0</span>
                      <span className="">USDT</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <Button disabled={true}>Buy</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
