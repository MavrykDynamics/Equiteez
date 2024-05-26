import { useState } from 'react';
import { Divider } from '~/atoms/Divider';
import { InputNumber } from '~/molecules/Input/Input';

export const PriceBuyTab = () => {
  const [price, setPrice] = useState<string | number>('');
  const [amount, setAmount] = useState<string | number>('');

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-y-2">
        <InputNumber
          handleValue={setPrice}
          label={'Price'}
          value={price}
          placeholder={'0.00'}
          valueText="USDT"
          name={'price'}
          className="text-body-xs"
        />
        <InputNumber
          handleValue={setAmount}
          label={'Amount'}
          value={amount}
          placeholder={'Minimum 1'}
          valueText="NMD"
          name={'amount'}
          className="text-body-xs"
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
          <p>17.84 NMD</p>
        </div>
        <div className="flex justify-between text-secondary-content text-caption-regular">
          <p>Est. Fee</p>
          <p>-- NMD</p>
        </div>
      </div>

      <InputNumber
        handleValue={setPrice}
        label={'Total'}
        value={price && amount ? Number(price) + Number(amount) : 0}
        placeholder={'0'}
        valueText="USDT"
        name={'price'}
        className="text-body-xs"
        disabled
      />
    </div>
  );
};
