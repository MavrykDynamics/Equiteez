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
import { rwaToFixed } from '~/lib/utils/formaters';
import { formatToNumber } from '~/lib/molecules/Input/utils';
import Money from '~/lib/atoms/Money';
import usePrevious from '~/hooks/use-previous';
import clsx from 'clsx';
import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { toTokenSlug } from '~/lib/assets';
import BigNumber from 'bignumber.js';

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
  const slug = useMemo(() => toTokenSlug(tokenAddress), [tokenAddress]);
  const { isAdmin, userTokensBalances } = useUserContext();
  const { usdToTokenRates } = useCurrencyContext();
  // tabs state
  const [activetabId, setAvtiveTabId] = useState(BUY_TAB);
  const isBuyAction = activetabId === BUY_TAB;

  const [activeItem, setActiveItem] = useState(LIMIT_TYPE);

  // inputs state
  const [price, setPrice] = useState<number | string>('');

  // TODO fix amount logic
  const [amount, setAmount] = useState<number | string | undefined>();
  const [total, setTotal] = useState<string | number>('');
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const prevSelectedPercentage = usePrevious(selectedPercentage);

  const buyBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const maxBuy = useMemo(() => {
    const amountToSpend = (100 * buyBalance) / 100;
    return rwaToFixed(
      amountToSpend / new BigNumber(usdToTokenRates[slug] ?? 1).toNumber()
    );
  }, [buyBalance, slug, usdToTokenRates]);

  const hasTotalError =
    typeof total === 'number' ? Number(total) > buyBalance : false;

  useEffect(() => {
    if (selectedPercentage) {
      const amountToSpend = (selectedPercentage * buyBalance) / 100;
      const numberOfTokens = rwaToFixed(
        amountToSpend / new BigNumber(usdToTokenRates[slug] ?? 1).toNumber()
      );
      setAmount(numberOfTokens);
    } else if (
      selectedPercentage === 0 &&
      prevSelectedPercentage &&
      prevSelectedPercentage !== 0
    ) {
      setAmount(0);
    }
  }, [
    selectedPercentage,
    buyBalance,
    tokenAddress,
    prevSelectedPercentage,
    usdToTokenRates,
    slug,
  ]);

  // derived state (it's boolean value, so no need to memoize it)
  const isLimitType = activeItem === LIMIT_TYPE;

  // update total
  useEffect(() => {
    if (amount && usdToTokenRates[slug]) {
      setTotal(rwaToFixed(Number(amount) * Number(price)));
    } else if (!amount) {
      setTotal('');
    }
  }, [amount, isLimitType, price, slug, tokenAddress, usdToTokenRates]);

  // contract calls based on markt or limit
  const { handleLimitSell, handleMarketBuy, handleMarketSell, handleLimitBuy } =
    useBuySellActions(Number(price), Number(amount), tokenAddress, symbol);

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
      setPrice(new BigNumber(usdToTokenRates[slug] ?? 0).toNumber());
    }
  }, [isLimitType, slug, tokenAddress, usdToTokenRates]);

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
        id: LIMIT_TYPE,
        label: 'Limit',
        value: 'limit',
        handleClick: handleItemlick,
      },
      {
        id: MARKET_TYPE,
        label: 'Market',
        value: 'market',
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
                      name="price"
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
                      onChange={(e) => setAmount(e.target.value)}
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
            <div
              className={`w-full flex justify-between eq-input py-3 px-[14px] bg-white`}
            >
              <span className="text-content-secondary opacity-50">Total</span>

              <span className="flex gap-1">
                <span className="">
                  <input
                    name="total"
                    type="number"
                    value={total}
                    placeholder="0.00"
                    className="w-full bg-transparent focus:outline-none text-right font-semibold"
                    disabled
                  ></input>
                </span>
                <span className="font-semibold">USDT</span>
              </span>
            </div>

            {hasTotalError && (
              <span className={clsx('text-body-xs text-error mt-2')}>
                {'Amount exceeds available balance'}
              </span>
            )}
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
              className="w-full mt-1 py-[10px]"
            >
              <span className="text-body-xs font-bold">
                {activetabId === 'buy' ? 'Buy' : 'Sell'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
