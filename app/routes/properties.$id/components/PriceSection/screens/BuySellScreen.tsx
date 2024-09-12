import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '~/lib/atoms/Button';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import {
  ClickableExpanderArea,
  CustomExpander,
  ExpanderBodyContent,
  ExpanderFaceContent,
} from '~/lib/organisms/CustomExpander/CustomExpander';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';

// icons
import CheckIcon from 'app/icons/ok.svg?react';
import {
  BUY,
  BuyScreenState,
  CONFIRM,
  SellScreenState,
  OrderType,
} from '../consts';
import Money from '~/lib/atoms/Money';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { stablecoinContract } from '~/consts/contracts';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { calculateEstfee } from '~/lib/utils/calcFns';
import BigNumber from 'bignumber.js';
import { BalanceInput } from '~/templates/BalanceInput';
import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { rateToNumber } from '~/lib/utils/numbers';
import { toTokenSlug } from '~/lib/assets';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: OrderType; // buy | sell
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  amount: BigNumber | undefined;
  total: BigNumber | undefined;
  setAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
  setTotal?: React.Dispatch<React.SetStateAction<BigNumber | undefined>>;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  amount,
  total,
  setAmount,
}) => {
  const { symbol, token_address } = estate;
  const slug = useMemo(() => toTokenSlug(token_address), [token_address]);
  const { usdToTokenRates } = useCurrencyContext();
  const { tokensMetadata } = useTokensContext();

  const { userTokensBalances } = useUserContext();

  console.log(userTokensBalances, 'userTokensBalances');
  const [slippagePercentage, setSlippagePercentage] = useState<string>(
    spippageOptions[0]
  );

  const usdBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const tokenBalance = useMemo(
    () => userTokensBalances[token_address]?.toNumber() || 0,
    [userTokensBalances, token_address]
  );

  const isBuyAction = actionType === BUY;
  const hasTotalError = isBuyAction
    ? amount
      ? amount.toNumber() > usdBalance
      : false
    : amount
    ? amount?.toNumber() > tokenBalance
    : false;

  const minReceived = useMemo(() => {
    if (!total) return 0;

    const slippageAdjustment =
      Number(total) * (1 - Number(slippagePercentage || 0) / 100);
    return new BigNumber(usdBalance)
      .minus(new BigNumber(slippageAdjustment))
      .div(rateToNumber(usdToTokenRates[slug]))
      .toNumber()
      .toFixed(2);
  }, [total, slippagePercentage, usdBalance, usdToTokenRates, slug]);

  const handleContinueClick = useCallback(() => {
    toggleScreen(CONFIRM);
  }, [toggleScreen]);

  const handleOutputChange = useCallback(
    (val: BigNumber | undefined) => {
      if (isBuyAction)
        setAmount(
          val?.times(rateToNumber(usdToTokenRates[slug])) ?? new BigNumber(0)
        );
      else
        setAmount(
          val?.div(rateToNumber(usdToTokenRates[slug])) ?? new BigNumber(0)
        );
    },
    [isBuyAction, setAmount, slug, usdToTokenRates]
  );

  const input1Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount,
            selectedAssetSlug: toTokenSlug(stablecoinContract),
            label: 'You Pay',
          }
        : { amount, selectedAssetSlug: slug, label: 'You Sell' },
    [amount, isBuyAction, slug]
  );

  const input2Props = useMemo(
    () =>
      isBuyAction
        ? {
            amount:
              amount?.div(rateToNumber(usdToTokenRates[slug])) || undefined,
            selectedAssetSlug: slug,
          }
        : {
            amount:
              amount?.times(rateToNumber(usdToTokenRates[slug])) || undefined,
            selectedAssetSlug: toTokenSlug(stablecoinContract),
          },
    [amount, isBuyAction, slug, usdToTokenRates]
  );

  const balanceTotal = useMemo(
    () =>
      isBuyAction
        ? amount
          ? `$${input1Props.amount?.toNumber()}`
          : '--'
        : amount
        ? `$${input2Props.amount?.toNumber()}`
        : '--',
    [amount, input1Props.amount, input2Props.amount, isBuyAction]
  );

  const symbolToShow = isBuyAction
    ? symbol
    : tokensMetadata[toTokenSlug(stablecoinContract)]?.symbol;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <BalanceInput
              onChange={(data) => setAmount(data)}
              amountInputDisabled={false}
              errorCaption={
                hasTotalError
                  ? 'The amount entered exceeds your available balance.'
                  : undefined
              }
              {...input1Props}
            >
              <div className="text-body-xs text-sand-600 flex items-center justify-between font-semibold">
                <span>{balanceTotal}</span>
                <div className="text-body-xs font-semibold">
                  Balance:&nbsp;
                  <Money smallFractionFont={false} shortened>
                    {isBuyAction ? usdBalance : tokenBalance}
                  </Money>
                </div>
              </div>
            </BalanceInput>

            <BalanceInput
              onChange={handleOutputChange}
              amountInputDisabled={false}
              label="You Receive"
              {...input2Props}
            >
              <div className="text-body-xs text-sand-600 flex items-center justify-between font-semibold">
                <span>{balanceTotal}</span>
                <div className='className="text-body-xs font-semibold"'>
                  Balance:&nbsp;
                  <Money smallFractionFont={false} shortened>
                    {isBuyAction ? tokenBalance : usdBalance}
                  </Money>
                </div>
              </div>
            </BalanceInput>

            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col">
              <CustomExpander>
                <ClickableExpanderArea>
                  <ExpanderFaceContent>
                    <div className="text-body-xs font-semibold text-content flex items-center w-full">
                      1 {symbol} =&nbsp;
                      <div>
                        <span className="-mr-[1px]">$</span>
                        <Money smallFractionFont={false} cryptoDecimals={2}>
                          {rateToNumber(usdToTokenRates[slug]) || '0'}
                        </Money>
                      </div>
                    </div>
                  </ExpanderFaceContent>
                </ClickableExpanderArea>
                <ExpanderBodyContent>
                  <div className="mt-4 flex flex-col">
                    <div className="mt-2 text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Min Received
                        <InfoTooltip content="Min Received" />
                      </div>
                      <p>
                        <Money smallFractionFont={false} shortened>
                          {minReceived}
                        </Money>
                        &nbsp;{symbolToShow}
                      </p>
                    </div>
                    <div className="mt-2 text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Slippage
                        <InfoTooltip content="Slippage" />
                      </div>
                      <SlippageDropdown
                        slippagePercentage={slippagePercentage}
                        setSlippagePercentage={setSlippagePercentage}
                      />
                    </div>
                    <div className="mt-[10px] text-body-xs flex justify-between">
                      <div className="flex items-center gap-2">
                        Est. Fee
                        <InfoTooltip content="Est fee" />
                      </div>
                      <p>
                        <Money smallFractionFont={false} shortened>
                          {isBuyAction
                            ? calculateEstfee(total?.toNumber() ?? 0)
                            : input2Props.amount?.toNumber() ?? 0}
                        </Money>
                        &nbsp;{symbolToShow}
                      </p>
                    </div>
                  </div>
                </ExpanderBodyContent>
              </CustomExpander>
            </div>
          </div>
        </div>
      </div>
      <Button
        className="mt-6"
        onClick={handleContinueClick}
        disabled={hasTotalError || !amount || slippagePercentage.length === 0}
      >
        Continue
      </Button>
    </div>
  );
};

const spippageOptions = ['0.3', '0.5', '1', 'custom'];

type SlippageDropdownProps = {
  slippagePercentage: string;
  setSlippagePercentage: (val: string) => void;
};

const SlippageDropdown: FC<SlippageDropdownProps> = ({
  slippagePercentage,
  setSlippagePercentage,
}) => {
  const [selectedOption, setSelectedOption] = useState(spippageOptions[0]);

  const isCustom = selectedOption === 'custom';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*?)\..*/g, '$1')
      .replace(/(\d+\.\d?).*/g, '$1');

    if (value && parseFloat(value) > 100) {
      return;
    }

    setSlippagePercentage(value);
  };

  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <div className="px-2 py-1 border border-dark-green-100 rounded-lg bg-white">
          <DropdownFaceContent gap={1}>
            <div className="max-w-8 text-nowrap">
              <input
                type="text"
                value={isCustom ? slippagePercentage : selectedOption}
                onChange={handleInputChange}
                name={'slippage'}
                className="w-6 text-right"
                disabled={!isCustom}
              />
              %
            </div>
          </DropdownFaceContent>
        </div>
        {slippagePercentage.length === 0 && (
          <span className="text-error">Required</span>
        )}
        <DropdownBodyContent customWidth={113} position="right" topMargin={12}>
          <div className="flex flex-col">
            {spippageOptions.map((option) => (
              <button
                key={option}
                className="py-3 px-4 bg-white flex items-center justify-between hover:bg-dark-green-100 capitalize"
                onClick={() => {
                  setSelectedOption(option);
                  if (option !== 'custom') {
                    setSlippagePercentage(option);
                  }
                }}
              >
                {option.concat(option !== 'custom' ? '%' : '')}
                {option === selectedOption && (
                  <CheckIcon className="size-4 stroke-dark-green-500" />
                )}
              </button>
            ))}
          </div>
        </DropdownBodyContent>
      </ClickableDropdownArea>
    </CustomDropdown>
  );
};
