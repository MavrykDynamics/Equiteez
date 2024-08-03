import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import clsx from 'clsx';

// icons
import DotFill from '~/icons/dot-fill.svg?react';
import DotEmpty from '~/icons/dot-empty.svg?react';
import EQLogo from '~/icons/eq-small-logo.svg?react';
import { Button } from '~/lib/atoms/Button';
import {
  pickDodoContractBasedOnToken,
  pickMarketBasedOnSymbol,
  pickMockBaseToken,
} from '~/consts/contracts';
import {
  placeBuyOrderAndMatch,
  placeSellOrder,
} from '~/contracts/buySellLimit.contract';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { buyBaseToken, sellBaseToken } from '~/contracts/dodo.contract';
import { BUY_TAB, LIMIT_TYPE, MARKET_TYPE, SELL_TAB } from './consts';
import { AdminScreen } from './AdminScreen';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { useContractAction } from '~/contracts/hooks/useContractAction';

type BuySellTabsProps = {
  symbol: string;
  tokenAddress: string;
};

const useBuySellActions = (
  price: number,
  amount: number,
  tokenAddress: string,
  symbol: string
) => {
  const buySellProps = useMemo(
    () => ({
      marketContractAddress: pickMarketBasedOnSymbol[symbol],
      tokensAmount: Number(amount),
      pricePerToken: Number(price),
    }),
    [amount, price, symbol]
  );

  const { invokeAction: handleLimitBuy } = useContractAction(
    placeBuyOrderAndMatch,
    buySellProps
  );

  const { invokeAction: handleLimitSell } = useContractAction(
    placeSellOrder,
    buySellProps
  );

  const marketBuySellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      mockQuoteLpToken: pickMockBaseToken[tokenAddress],
      tokensAmount: amount,
      minMaxQuote: 1000, // minMaxQuote
    }),
    [amount, tokenAddress]
  );

  const { invokeAction: handleMarketBuy } = useContractAction(
    buyBaseToken,
    marketBuySellProps
  );
  const {
    invokeAction: handleMarketSell,
    status,
    isLoading,
  } = useContractAction(sellBaseToken, marketBuySellProps);

  return {
    handleLimitSell,
    handleLimitBuy,
    status,
    isLoading,
    handleMarketBuy,
    handleMarketSell,
  };
};

export const BuySellTabs: FC<BuySellTabsProps> = ({ symbol, tokenAddress }) => {
  const { tokensPrices } = useTokensContext();
  const { isAdmin } = useUserContext();
  // tabs state
  const [activetabId, setAvtiveTabId] = useState(BUY_TAB);

  // dropdown state
  const items = useMemo(
    () => [
      {
        id: MARKET_TYPE,
        label: 'Market',
        value: 'market',
      },
      {
        id: LIMIT_TYPE,
        label: 'Limit',
        value: 'limit',
      },
    ],
    []
  );

  const [activeItem, setActiveItem] = useState(() => items[0]);

  // inputs state
  const [price, setPrice] = useState<number | string>(Number(''));
  const [amount, setAmount] = useState<number | string>(Number(''));

  // contract calls based on markt or limit
  const { handleLimitSell, handleMarketBuy, handleMarketSell, handleLimitBuy } =
    useBuySellActions(Number(price), Number(amount), tokenAddress, symbol);

  // derived state (it's boolean value, so no need to memoize it)
  const isLimitType = activeItem.id === LIMIT_TYPE;

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const pickBuySellAction = useMemo(
    () =>
      (() => {
        if (isLimitType) {
          return activetabId === BUY_TAB ? handleLimitBuy : handleLimitSell;
        }

        return activetabId === BUY_TAB ? handleMarketBuy : handleMarketSell;
      })(),
    [
      activetabId,
      handleLimitBuy,
      handleLimitSell,
      handleMarketBuy,
      handleMarketSell,
      isLimitType,
    ]
  );

  // set fixed price for the market type
  useEffect(() => {
    if (!isLimitType) {
      setPrice(tokensPrices[tokenAddress]);
    }
  }, [isLimitType, tokenAddress, tokensPrices]);

  // swaitch screens based on active tab
  const tabs: TabType[] = useMemo(
    () => [
      {
        id: BUY_TAB,
        label: 'Buy',
        handleClick: handleTabClick,
      },
      {
        id: SELL_TAB,
        label: 'Sell',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  return (
    <section className="flex flex-col w-full">
      <TabSwitcher
        variant="secondary"
        tabs={tabs}
        activeTabId={activetabId}
        grow={true}
      />
      {isAdmin && <AdminScreen symbol={symbol} tokenAddress={tokenAddress} />}
      <div className="mt-4">
        <CustomDropdown>
          <ClickableDropdownArea>
            <DropdownFaceContent
              className={clsx(
                'text-caption-regular text-content w-full border border-divider',
                'rounded-lg mb-3 py-4 px-[14px]'
              )}
            >
              <div className="flex items-center gap-x-2 w-full">
                {activeItem.label}
              </div>
            </DropdownFaceContent>
            <DropdownBodyContent topMargin={24} maxHeight={350}>
              {items.map((item) => (
                <button
                  onClick={() => setActiveItem(item)}
                  className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity"
                  key={item.id}
                >
                  <div> {item.label}</div>
                </button>
              ))}
            </DropdownBodyContent>
          </ClickableDropdownArea>
        </CustomDropdown>
        <div className="flex flex-col w-full gap-3 text-caption-regular">
          <div className="flex flex-col w-full gap-3">
            <div className="flex flex-col w-full gap-3">
              <div
                className={`w-full flex justify-between eq-input py-3 px-[14px]`}
              >
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
                      disabled={!isLimitType}
                    ></input>
                  </span>
                  <span className="">USDT</span>
                </span>
              </div>

              <div
                className={`w-full flex justify-between eq-input py-3 px-[14px]`}
              >
                <span className="text-content-secondary opacity-50">
                  Amount
                </span>

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
                <span className="eq-slider">
                  0%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                <span className="eq-slider">&nbsp;25%&nbsp;</span>
                <span className="eq-slider">&nbsp;&nbsp;50%&nbsp;&nbsp;</span>
                <span className="eq-slider">&nbsp;&nbsp;&nbsp;75%</span>
                <span className="eq-slider">100%</span>
              </div>
            </div>
          </div>

          <div className="flex w-full">
            <div
              className={`w-full flex justify-between eq-input py-3 px-[14px]`}
            >
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
            <Button
              onClick={pickBuySellAction}
              className="w-full mt-1"
              variant={activetabId === 'buy' ? 'green-secondary' : 'red'}
            >
              {activetabId === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
