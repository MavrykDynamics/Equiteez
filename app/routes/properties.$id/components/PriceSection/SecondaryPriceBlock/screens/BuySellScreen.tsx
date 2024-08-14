import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '~/lib/atoms/Button';
import { InputNumber } from '~/lib/molecules/Input/Input';
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
import { ESnakeblock } from '~/templates/ESnakeBlock/ESnakeblock';

// icons
import CheckIcon from 'app/icons/ok.svg?react';
import { BuyScreenState, SellScreenState } from './consts';
import Money from '~/lib/atoms/Money';
import { useUserContext } from '~/providers/UserProvider/user.provider';
import { stablecoinContract } from '~/consts/contracts';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { calculateEstfee } from '~/lib/utils/calcFns';
import BigNumber from 'bignumber.js';
import { rwaToFixed } from '~/lib/utils/formaters';

type BuySellScreenProps = {
  estate: SecondaryEstate;
  actionType: 'buy' | 'sell';
  toggleScreen: (id: BuyScreenState & SellScreenState) => void;
  currency: string;
  amount: string | number;
  total: string | number;
  setAmount: (v: string | number) => void;
  setTotal: (v: string | number) => void;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  estate,
  toggleScreen,
  actionType,
  currency,
  amount,
  total,
  setAmount,
  setTotal,
}) => {
  const { symbol, token_address } = estate;

  const { userTokensBalances } = useUserContext();
  const { tokensPrices } = useTokensContext();
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [slippagePercentage, setSlippagePercentage] = useState<string>(
    spippageOptions[0]
  );

  const buyBalance = useMemo(
    () => userTokensBalances[stablecoinContract]?.toNumber() || 0,
    [userTokensBalances]
  );

  const isBuyAction = actionType === 'buy';
  const hasTotalError =
    typeof total === 'number' ? Number(total) > buyBalance : false;

  useEffect(() => {
    if (selectedPercentage) {
      const amountToSpend = (selectedPercentage * buyBalance) / 100;
      const numberOfTokens = rwaToFixed(
        amountToSpend / tokensPrices[token_address]
      );
      setAmount(numberOfTokens);
    } else {
      setAmount(0);
    }
  }, [selectedPercentage, setAmount, buyBalance, tokensPrices, token_address]);

  const minReceived = useMemo(() => {
    if (!total) return 0;

    const slippageAdjustment =
      Number(total) * (1 - Number(slippagePercentage || 0) / 100);
    return new BigNumber(buyBalance)
      .minus(new BigNumber(slippageAdjustment))
      .div(tokensPrices[token_address])
      .toNumber()
      .toFixed(2);
  }, [total, slippagePercentage, buyBalance, tokensPrices, token_address]);

  const handleContinueClick = useCallback(() => {
    toggleScreen('confirm');
  }, [toggleScreen]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <h3 className="text-content text-card-headline capitalize">
            {actionType}
          </h3>
          <div className="text-body-xs text-content flex items-center justify-between">
            <span>Available Balance</span>
            <div>
              {isBuyAction ? (
                <Money smallFractionFont={false} shortened>
                  {userTokensBalances[stablecoinContract] || 0}
                </Money>
              ) : (
                <Money smallFractionFont={false} shortened>
                  {userTokensBalances[token_address] || '0'}
                </Money>
              )}
              &nbsp;{currency}
            </div>
          </div>

          <InputNumber
            // handleValue={setPrice}
            label={'Market Price'}
            value={(tokensPrices[token_address] || 0).toFixed(2)}
            placeholder={'0.00'}
            valueText="USDT"
            name={'price'}
            className="text-body"
            disabled
          />

          <InputNumber
            handleValue={setAmount}
            label={'Amount'}
            value={amount || ''}
            placeholder={'Minimum 1'}
            valueText={symbol}
            name={'amount'}
            className="text-body"
          />
        </div>

        <div className="my-6">
          <ESnakeblock
            selectedOption={selectedPercentage}
            setSelectedOption={setSelectedPercentage}
          />
        </div>

        <CustomExpander>
          <ClickableExpanderArea>
            <div className="text-body-xs text-content flex justify-between">
              <ExpanderFaceContent>Min Received</ExpanderFaceContent>
              <div>
                <Money smallFractionFont={false}>{minReceived}</Money>
                <span>&nbsp;{symbol}</span>
              </div>
            </div>
          </ClickableExpanderArea>

          <ExpanderBodyContent>
            <div className="mt-2 flex flex-col pl-3">
              <div className="flex items-center justify-between text-body-xs text-content">
                <p>Slippage</p>
                <SlippageDropdown
                  slippagePercentage={slippagePercentage}
                  setSlippagePercentage={setSlippagePercentage}
                />
              </div>
            </div>
          </ExpanderBodyContent>
        </CustomExpander>

        <div className="mt-3 text-body-xs flex justify-between mb-6">
          <div className="flex items-center gap-2">
            Est. Fee
            <InfoTooltip content="Est fee" />
          </div>
          <p>
            <Money smallFractionFont={false} shortened>
              {calculateEstfee(total)}
            </Money>
            &nbsp;{symbol}
          </p>
        </div>

        <InputNumber
          label={<p className="font-semibold">Total</p>}
          value={total}
          handleValue={setTotal}
          placeholder={'0.00'}
          valueText="USDT"
          name={'total'}
          className="text-body"
          errorCaption={
            hasTotalError ? 'Amount exceeds available balance' : undefined
          }
        />
      </div>
      <Button
        variant="dark"
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
        <div className="px-2 py-1 border border-brand-green-100 rounded-lg">
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
                className="py-3 px-4 bg-white flex items-center justify-between hover:bg-brand-green-100 capitalize"
                onClick={() => {
                  setSelectedOption(option);
                  if (option !== 'custom') {
                    setSlippagePercentage(option);
                  }
                }}
              >
                {option.concat(option !== 'custom' ? '%' : '')}
                {option === selectedOption && (
                  <CheckIcon className="size-4 stroke-brand-green-500" />
                )}
              </button>
            ))}
          </div>
        </DropdownBodyContent>
      </ClickableDropdownArea>
    </CustomDropdown>
  );
};

// utils
