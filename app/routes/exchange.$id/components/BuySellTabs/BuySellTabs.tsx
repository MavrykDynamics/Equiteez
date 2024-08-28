import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';

// icons
import { Button } from '~/lib/atoms/Button';
import {
  pickDodoContractBasedOnToken,
  pickMarketBasedOnSymbol,
  stablecoinContract,
} from '~/consts/contracts';
import {
  placeBuyOrderAndMatch,
  placeSellOrder,
} from '~/contracts/buySellLimit.contract';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { buyBaseToken, sellBaseToken } from '~/contracts/dodo.contract';
import { BUY_TAB, LIMIT_TYPE, MARKET_TYPE, OTC_TYPE, SELL_TAB } from './consts';
import { AdminScreen } from './AdminScreen';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { useContractAction } from '~/contracts/hooks/useContractAction';
import { ESnakeblock } from '~/templates/ESnakeBlock/ESnakeblock';
import { InputNumber } from '~/lib/molecules/Input/Input';
import { rwaToFixed } from '~/lib/utils/formaters';
import { formatToNumber } from '~/lib/molecules/Input/utils';
import { useTokensAmount } from '~/lib/molecules/Input/hooks/useTokensAmount';
import Money from '~/lib/atoms/Money';
import usePrevious from '~/hooks/use-previous';

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
  const { tokensMetadata } = useTokensContext();

  const buySellProps = useMemo(
    () => ({
      marketContractAddress: pickMarketBasedOnSymbol[symbol],
      tokensAmount: Number(amount),
      pricePerToken: Number(price),
      decimals: tokensMetadata[tokenAddress]?.decimals,
    }),
    [amount, price, symbol, tokenAddress, tokensMetadata]
  );

  const { invokeAction: handleLimitBuy } = useContractAction(
    placeBuyOrderAndMatch,
    buySellProps
  );

  const { invokeAction: handleLimitSell } = useContractAction(
    placeSellOrder,
    buySellProps
  );

  const marketBuyProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      tokensAmount: amount,
      minMaxQuote: 1000,
      decimals: tokensMetadata[tokenAddress]?.decimals,
    }),
    [amount, tokenAddress, tokensMetadata]
  );

  const marketSellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],

      tokenAddress: tokenAddress,
      tokensAmount: amount,
      minMaxQuote: 1000, // minMaxQuote
      decimals: tokensMetadata[tokenAddress]?.decimals,
    }),
    [amount, tokenAddress, tokensMetadata]
  );

  const { invokeAction: handleMarketBuy } = useContractAction(
    buyBaseToken,
    marketBuyProps
  );
  const {
    invokeAction: handleMarketSell,
    status,
    isLoading,
  } = useContractAction(sellBaseToken, marketSellProps);

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
  const { isAdmin, userTokensBalances } = useUserContext();
  // tabs state
  const [activetabId, setAvtiveTabId] = useState(BUY_TAB);
  const isBuyAction = activetabId === BUY_TAB;

  const [activeItem, setActiveItem] = useState(MARKET_TYPE);

  // inputs state
  const [price, setPrice] = useState<number | string>(Number(''));
  const { amount, previewAmount, handleAmountChange } =
    useTokensAmount(tokenAddress);
  const [total, setTotal] = useState<string | number>('');
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const prevSelectedPercentage = usePrevious(selectedPercentage);

  const buyBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const maxBuy = useMemo(() => {
    const amountToSpend = (100 * buyBalance) / 100;
    return rwaToFixed(amountToSpend / tokensPrices[tokenAddress]);
  }, [buyBalance, tokenAddress, tokensPrices]);

  const hasTotalError =
    typeof total === 'number' ? Number(total) > buyBalance : false;

  useEffect(() => {
    if (selectedPercentage) {
      const amountToSpend = (selectedPercentage * buyBalance) / 100;
      const numberOfTokens = rwaToFixed(
        amountToSpend / tokensPrices[tokenAddress]
      );
      handleAmountChange(numberOfTokens);
    } else if (
      selectedPercentage === 0 &&
      prevSelectedPercentage &&
      prevSelectedPercentage !== 0
    ) {
      handleAmountChange(0);
    }
  }, [
    selectedPercentage,
    handleAmountChange,
    buyBalance,
    tokensPrices,
    tokenAddress,
    prevSelectedPercentage,
  ]);

  // update total
  useEffect(() => {
    if (previewAmount && tokensPrices[tokenAddress]) {
      setTotal(rwaToFixed(Number(previewAmount) * tokensPrices[tokenAddress]));
    } else if (!previewAmount) {
      setTotal('');
    }
  }, [previewAmount, tokenAddress, tokensPrices]);

  // contract calls based on markt or limit
  const { handleLimitSell, handleMarketBuy, handleMarketSell, handleLimitBuy } =
    useBuySellActions(Number(price), Number(amount), tokenAddress, symbol);

  // derived state (it's boolean value, so no need to memoize it)
  const isLimitType = activeItem === LIMIT_TYPE;

  const handleTabClick = useCallback((id: string) => {
    setAvtiveTabId(id);
  }, []);

  const handleItemlick = useCallback((activeItem: string) => {
    setActiveItem(activeItem);
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

  // dropdown state
  const items: TabType[] = useMemo(
    () => [
      {
        id: MARKET_TYPE,
        label: 'Market',
        value: 'market',
        handleClick: handleItemlick,
      },
      {
        id: LIMIT_TYPE,
        label: 'Limit',
        value: 'limit',
        handleClick: handleItemlick,
      },
      {
        id: OTC_TYPE,
        label: 'OTC',
        value: 'otc',
        handleClick: handleItemlick,
        disabled: true,
      },
    ],
    [handleItemlick]
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
        <div className="mb-4">
          <TabSwitcher
            variant="tertiary"
            activeTabId={activeItem}
            tabs={items}
          />
        </div>
        <div className="flex flex-col w-full gap-3 text-caption-regular">
          <div className="flex justify-between w-full">
            <span className="text-caption-regular">Avbl</span>
            <div className="text-caption-regular">
              {isBuyAction ? (
                <Money smallFractionFont={false} shortened>
                  {userTokensBalances[stablecoinContract] || 0}
                </Money>
              ) : (
                <Money smallFractionFont={false} shortened>
                  {userTokensBalances[tokenAddress] || '0'}
                </Money>
              )}
              &nbsp;{'USDT'}
            </div>
          </div>
          <div className="flex flex-col w-full gap-3">
            <div className="flex flex-col w-full gap-3">
              <div
                className={`w-full flex justify-between eq-input py-3 px-[14px] bg-white`}
              >
                <span className="text-content-secondary opacity-50">Price</span>

                <span className="flex gap-1">
                  <span className="">
                    <input
                      name="amount"
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) =>
                        setPrice(Number(formatToNumber(e.target.value)))
                      }
                      placeholder="0.00"
                      className="w-full bg-transparent focus:outline-none text-right font-semibold"
                      disabled={!isLimitType}
                    ></input>
                  </span>
                  <span className="font-semibold">USDT</span>
                </span>
              </div>

              <div
                className={`w-full flex justify-between eq-input py-3 px-[14px] bg-white`}
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
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Minimum 1"
                      className="w-full bg-transparent focus:outline-none text-right font-semibold"
                    ></input>
                  </span>
                  <span className="font-semibold">{symbol}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-1">
              <ESnakeblock
                selectedOption={selectedPercentage}
                setSelectedOption={setSelectedPercentage}
              />
            </div>
          </div>

          <div className="w-full mb-3">
            <InputNumber
              label={<p>Total</p>}
              value={total}
              handleValue={setTotal}
              placeholder={'0.00'}
              valueText="USDT"
              name={'total'}
              className="text-caption-regular px-[14px] bg-white font-semibold"
              errorCaptionCalassname="text-caption-regular"
              errorCaption={
                hasTotalError ? 'Amount exceeds available balance' : undefined
              }
            />
          </div>

          <div className="flex flex-col w-full gap-1">
            <div className="flex justify-between w-full">
              <span className="text-caption-regular">Max Buy</span>
              <span className="text-caption-regular">
                {maxBuy} {symbol}
              </span>
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
