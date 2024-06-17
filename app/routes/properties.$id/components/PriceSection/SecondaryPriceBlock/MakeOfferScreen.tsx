import { Button } from '~/lib/atoms/Button';
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';
import { FC, useState } from 'react';
import { InputNumber } from '~/lib/molecules/Input/Input';
import { Divider } from '~/lib/atoms/Divider';

type MakeOfferScreenProps = {
  toggleMakeOfferScreen: () => void;
};

export const MakeOfferScreen: FC<MakeOfferScreenProps> = ({
  toggleMakeOfferScreen,
}) => {
  const [offeredPrice, setOfferedPrice] = useState<string | number>('');
  const [amount, setAmount] = useState<string | number>('');

  return (
    <>
      <div className="flex-1 text-content">
        <div
          role="presentation"
          className="flex items-center gap-x-3 cursor-pointer w-max"
          onClick={toggleMakeOfferScreen}
        >
          <ArrowLeftIcon className="stoke-current w-6 h-6" />
          <h3 className="text-card-headline">Make Collection Offer</h3>
        </div>
        <p className="text-body-xs mt-1 mb-[20px]">Explainer</p>
        <div className="flex flex-col gap-y-3">
          <InputNumber
            handleValue={setOfferedPrice}
            label={'Offered Price'}
            value={offeredPrice}
            placeholder={'0.00'}
            valueText="USDT"
            name={'offeredPrice'}
            labelVariant="opacity"
          />
          <InputNumber
            handleValue={setAmount}
            label={'Amount'}
            value={amount}
            placeholder={'Minimum 1'}
            valueText="OCEAN"
            name={'offeredPrice'}
            labelVariant="opacity"
          />
        </div>
        <Divider className="my-4" />
        <div className="mb-3">
          <div className="flex justify-between text-secondary-content text-caption-regular mb-1">
            <p>Available Balance</p>
            <p>1,034.75 USDT</p>
          </div>
          <div className="flex justify-between text-secondary-content text-caption-regular mb-1">
            <p>Max Buy</p>
            <p>17.84 OCEAN</p>
          </div>
          <div className="flex justify-between text-secondary-content text-caption-regular">
            <p>Est. Fee</p>
            <p>-- OCEAN</p>
          </div>
        </div>

        <InputNumber
          label={'Total'}
          value={
            offeredPrice && amount ? Number(offeredPrice) + Number(amount) : 0
          }
          placeholder={'0'}
          valueText="USDT"
          name={'total'}
          disabled
        />
      </div>

      <Button>Make an Offer</Button>
    </>
  );
};
