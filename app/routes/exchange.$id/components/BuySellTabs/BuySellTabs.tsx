import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TabType } from '~/lib/atoms/Tab';
import { TabSwitcher } from '~/lib/organisms/TabSwitcher';

// icons
import { Button } from '~/lib/atoms/Button';
import {
  pickDodoContractBasedOnToken,
  pickOrderbookContract,
  stablecoinContract,
} from '~/consts/contracts';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { buyBaseToken, sellBaseToken } from '~/contracts/dodo.contract';
import { BUY_TAB, LIMIT_TYPE, MARKET_TYPE, OTC_TYPE, SELL_TAB } from './consts';
import { AdminScreen } from './AdminScreen';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { useContractAction } from '~/contracts/hooks/useContractAction';
import { ESnakeblock } from '~/templates/ESnakeBlock/ESnakeblock';
import { rwaToFixed } from '~/lib/utils/formaters';
import Money from '~/lib/atoms/Money';
import clsx from 'clsx';
import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { toTokenSlug } from '~/lib/assets';
import BigNumber from 'bignumber.js';
import { calculateEstfee } from '~/lib/utils/calcFns';
import usePrevious from '~/lib/ui/hooks/usePrevious';
import { orderbookBuy, orderbookSell } from '~/contracts/orderbook.contract';
import { rateToNumber } from '~/lib/utils/numbers';
import { isDefined } from '~/lib/utils';
import { AssetField } from '~/lib/organisms/AssetField';

type BuySellTabsProps = {
  symbol: string;
  tokenAddress: string;
};

const useBuySellActions = (
  price: BigNumber | undefined,
  amount: BigNumber | undefined,
  tokenAddress: string
) => {
  const slug = useMemo(() => toTokenSlug(tokenAddress), [tokenAddress]);
  const { tokensMetadata } = useTokensContext();
  const { usdToTokenRates } = useCurrencyContext();
  const selectedAssetMetadata = useMemo(
    () => tokensMetadata[slug],
    [slug, tokensMetadata]
  );

  const buyProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[tokenAddress],
      tokensAmount: amount?.div(rateToNumber(usdToTokenRates[slug])).toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [tokenAddress, amount, usdToTokenRates, slug, price, tokensMetadata]
  );

  const sellProps = useMemo(
    () => ({
      marketContractAddress: pickOrderbookContract[tokenAddress],
      rwaTokenAddress: tokenAddress,
      tokensAmount: amount?.toNumber(),
      pricePerToken: price?.toNumber(),
      decimals: tokensMetadata[slug]?.decimals,
    }),
    [amount, price, slug, tokenAddress, tokensMetadata]
  );

  const { invokeAction: handleLimitBuy } = useContractAction(
    orderbookBuy,
    buyProps
  );

  const { invokeAction: handleLimitSell } = useContractAction(
    orderbookSell,
    sellProps
  );

  const marketBuyProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],
      tokensAmount: amount?.div(rateToNumber(usdToTokenRates[slug])).toNumber(),
      minMaxQuote: 1000,
      decimals: selectedAssetMetadata?.decimals,
    }),
    [amount, slug, tokenAddress, selectedAssetMetadata, usdToTokenRates]
  );

  const marketSellProps = useMemo(
    () => ({
      dodoContractAddress: pickDodoContractBasedOnToken[tokenAddress],

      tokenAddress: tokenAddress,
      tokensAmount: amount?.toNumber(),
      minMaxQuote: 1000, // minMaxQuote
      decimals: selectedAssetMetadata?.decimals,
    }),
    [amount, tokenAddress, selectedAssetMetadata]
  );

  // MArket buy | sell
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

// TODO refector this component to use logic line on secondary markey BUY | SELL
// extract reusable components
export const BuySellTabs: FC<BuySellTabsProps> = ({ symbol, tokenAddress }) => {
  const slug = useMemo(() => toTokenSlug(tokenAddress), [tokenAddress]);
  const { isAdmin, userTokensBalances } = useUserContext();
  const { usdToTokenRates } = useCurrencyContext();
  const { tokensMetadata } = useTokensContext();
  // tabs state
  const [activetabId, setAvtiveTabId] = useState(BUY_TAB);
  const isBuyAction = activetabId === BUY_TAB;

  const [activeItem, setActiveItem] = useState(LIMIT_TYPE);

  // inputs state
  const [price, setPrice] = useState<BigNumber | undefined>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [total, setTotal] = useState<BigNumber | undefined>();

  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const prevSelectedPercentage = usePrevious(selectedPercentage);

  // refs
  const inputAmountRef = useRef<HTMLInputElement>(null);
  const inputPriceRef = useRef<HTMLInputElement>(null);

  // derived
  const selectedAssetMetadata = useMemo(
    () => tokensMetadata[slug],
    [slug, tokensMetadata]
  );

  // Handle input values for price and amount
  const handleAmountChange = (newAmount?: string) =>
    setAmount(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );

  const handlePriceChange = (newAmount?: string) =>
    setPrice(
      Boolean(newAmount) && isDefined(newAmount)
        ? new BigNumber(newAmount)
        : undefined
    );

  const handleAmountFocus = () => {
    inputAmountRef.current?.focus();
  };
  const handlePriceFocus = () => {
    inputPriceRef.current?.focus();
  };

  const usdBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[tokenAddress]?.toNumber() || 0,
    [userTokensBalances, tokenAddress]
  );

  const maxBuy = useMemo(() => {
    const amountToSpend = (100 * usdBalance) / 100;
    return rwaToFixed(
      new BigNumber(amountToSpend)
        .div(new BigNumber(usdToTokenRates[slug] ?? 1))
        .toNumber()
    );
  }, [usdBalance, slug, usdToTokenRates]);

  // extract logic into separate hook
  const hasTotalError = isBuyAction
    ? amount
      ? amount.gt(new BigNumber(usdBalance))
      : false
    : amount
    ? amount.gt(new BigNumber(tokenBalance))
    : false;

  const isBtnDisabled = useMemo(
    () => amount?.lte(0) || price?.lte(0) || hasTotalError || !amount || !price,
    [amount, hasTotalError, price]
  );

  useEffect(() => {
    if (selectedPercentage) {
      const amountToSpend = (selectedPercentage * usdBalance) / 100;
      const numberOfTokens = new BigNumber(amountToSpend).div(
        new BigNumber(usdToTokenRates[slug] ?? 1)
      );

      setAmount(numberOfTokens);
    } else if (
      selectedPercentage === 0 &&
      prevSelectedPercentage &&
      prevSelectedPercentage !== 0
    ) {
      setAmount(undefined);
    }
  }, [
    selectedPercentage,
    usdBalance,
    tokenAddress,
    prevSelectedPercentage,
    usdToTokenRates,
    slug,
  ]);

  // derived state (it's boolean value, so no need to memoize it)
  const isLimitType = activeItem === LIMIT_TYPE;

  // update total
  useEffect(() => {
    if (amount && usdToTokenRates[slug] && price) {
      setTotal(amount.multipliedBy(price));
    } else if (!amount) {
      setTotal(undefined);
    }
  }, [amount, isLimitType, price, slug, tokenAddress, usdToTokenRates]);

  // contract calls based on markt or limit
  const { handleLimitSell, handleMarketBuy, handleMarketSell, handleLimitBuy } =
    useBuySellActions(price, amount, tokenAddress);

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
      setPrice(new BigNumber(usdToTokenRates[slug] ?? 0));
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

  const symbolToShow = !isBuyAction
    ? symbol
    : tokensMetadata[toTokenSlug(stablecoinContract)]?.symbol;

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
              &nbsp;{symbolToShow}
            </div>
          </div>
          <div className="flex flex-col w-full gap-3">
            <div className="flex flex-col w-full gap-3">
              <div
                role="presentation"
                onClick={handlePriceFocus}
                className={`w-full flex justify-between eq-input py-3 px-[14px] bg-white`}
              >
                <span className="text-content-secondary opacity-50">Price</span>

                <span className="flex gap-1">
                  <span className="">
                    <AssetField
                      ref={inputPriceRef}
                      name="price"
                      type="number"
                      min={0}
                      max={9999999999999}
                      value={price
                        ?.toFixed(selectedAssetMetadata.decimals ?? 6)
                        .toString()}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                      className="w-full bg-transparent focus:outline-none text-right font-semibold"
                      disabled={!isLimitType}
                    ></AssetField>
                  </span>
                  <span className="font-semibold">USDT</span>
                </span>
              </div>

              <div
                role="presentation"
                onClick={handleAmountFocus}
                className={`w-full flex justify-between eq-input py-3 px-[14px] bg-white`}
              >
                <span className="text-content-secondary opacity-50">
                  Amount
                </span>

                <span className="flex gap-1">
                  <span className="">
                    <AssetField
                      ref={inputAmountRef}
                      name="amount"
                      type="text"
                      min={0}
                      max={9999999999999}
                      assetDecimals={selectedAssetMetadata.decimals ?? 6}
                      value={amount
                        ?.toFixed(selectedAssetMetadata.decimals ?? 6)
                        .toString()}
                      onChange={handleAmountChange}
                      placeholder="Minimum 1"
                      className="w-full bg-transparent focus:outline-none text-right font-semibold"
                    ></AssetField>
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
                    type="text"
                    value={total?.toNumber()}
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
              <div className="text-caption-regular">
                <Money smallFractionFont={false} shortened>
                  {!isBuyAction ? calculateEstfee(total ?? 0) : amount ?? 0}
                </Money>
                {symbolToShow}
              </div>
            </div>
          </div>

          <div className="flex w-full">
            <Button
              disabled={isBtnDisabled}
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
