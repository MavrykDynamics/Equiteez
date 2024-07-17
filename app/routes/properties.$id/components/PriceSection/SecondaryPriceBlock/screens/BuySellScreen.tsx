import { FC, useCallback, useState } from 'react';
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

type BuySellScreenProps = {
  symbol: string;
  actionType: 'buy' | 'sell';
  toggleBuyScreen: (id: string) => void;
  currency: string;
};

export const BuySellScreen: FC<BuySellScreenProps> = ({
  symbol,
  toggleBuyScreen,
  actionType,
  currency,
}) => {
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [slippagePercentage, setSlippagePercentage] = useState<string>(
    spippageOptions[0]
  );
  const [amount, setAmount] = useState<string | number>('');

  const handleContinueClick = useCallback(() => {
    toggleBuyScreen('confirm');
  }, [toggleBuyScreen]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 ">
        <div className="flex flex-col gap-4">
          <h3 className="text-content text-card-headline capitalize">
            {actionType}
          </h3>
          <p className="text-body-xs text-content flex items-center justify-between">
            <span>Available Balance</span>
            {/* TODO take value from wallet */}
            <span>1,492.00 {currency}</span>
          </p>

          <InputNumber
            // handleValue={setPrice}
            label={'Price'}
            value={'45.00'}
            placeholder={'0.00'}
            valueText="USDT"
            name={'price'}
            disabled
          />

          <InputNumber
            handleValue={setAmount}
            label={'Amount'}
            value={amount || ''}
            placeholder={'Minimum 1'}
            valueText={symbol}
            name={'amount'}
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
              <p>9.81 {symbol}</p>
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
          <p>0.71 {symbol}</p>
        </div>

        <InputNumber
          label={<p className="font-semibold">Total</p>}
          value={amount}
          placeholder={'0'}
          valueText="USDT"
          name={'total'}
        />
      </div>
      <Button variant="dark" onClick={handleContinueClick}>
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
          <DropdownFaceContent>
            <div>
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
        <DropdownBodyContent customWidth={113} position="right" topMargin={12}>
          <div className="flex flex-col">
            {spippageOptions.map((option) => (
              <button
                key={option}
                className="py-3 px-4 bg-white flex items-center justify-between hover:bg-brand-green-100"
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
