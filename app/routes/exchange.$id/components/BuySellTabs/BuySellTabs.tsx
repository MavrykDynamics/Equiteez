import { FC, useCallback, useMemo, useState } from 'react';
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
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { BuyDEXContent } from './Buy';
import { SellDEXContent } from './Sell';

type BuySellTabsProps = {
  symbol: string;
};

export const BuySellTabs: FC<BuySellTabsProps> = ({ symbol }) => {
  const [activetabId, setAvtiveTabId] = useState('buy');

  const [isOpen, setIsOpen] = useState(false);

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const [price, setPrice] = useState<number | string>(Number(''));
  const [amount, setAmount] = useState<number | string>(Number(''));

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
        id: 'sell',
        label: 'Sell',
        handleClick: handleTabClick,
      },
    ],
    [handleTabClick]
  );

  const items = useMemo(
    () => [
      {
        id: '1',
        label: 'Market',
        value: 'market',
      },
      {
        id: '2',
        label: 'Limit',
        value: 'limit',
      },
    ],
    []
  );

  const [activeItem, setActiveItem] = useState(() => items[0]);

  return (
    <section className="flex flex-col w-full">
      <TabSwitcher
        variant="secondary"
        tabs={tabs}
        activeTabId={activetabId}
        grow={true}
      />
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
              <div className={`w-full flex justify-between eq-input py-3 px-4`}>
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
              className="w-full mt-1"
              variant={activetabId === 'buy' ? 'green-secondary' : 'red'}
              onClick={handleOpen}
            >
              {activetabId === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </div>

          <PopupWithIcon
            isOpen={isOpen}
            onRequestClose={handleRequestClose}
            contentPosition={'right'}
          >
            {activetabId == 'buy' ? (
              <BuyDEXContent
                initialAmount={Number(amount)}
                initialPrice={Number(price)}
                symbol={symbol}
              />
            ) : (
              <SellDEXContent
                initialAmount={Number(amount)}
                initialPrice={Number(price)}
                symbol={symbol}
              />
            )}
          </PopupWithIcon>
        </div>
      </div>
    </section>
  );
};
