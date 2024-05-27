import { FC } from 'react';
import { Button } from '~/atoms/Button';
import { Divider } from '~/atoms/Divider';
import { HashShortView } from '~/atoms/HashShortView';
import {
  NativeTable,
  NativeTableColumn,
  NativeTableHeader,
  NativeTableRow,
} from '~/atoms/NativeTable/NativeTable';
import { InputNumber } from '~/molecules/Input/Input';

const tableTopbarItems = [
  'Seller',
  'For Sale',
  'Price',
  'Total Value',
  'Tokens to Buy',
];

const tableRowDataArr = [
  {
    address: 'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
    forSale: 450,
    price: '$68.38',
    total: '$30,771.9',
  },
  {
    address: 'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
    forSale: 68,
    price: '$70.56',
    total: '$4,798.08',
  },
  {
    address: 'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
    forSale: 133,
    price: '$71.89',
    total: '$9,562.43',
  },
  {
    address: 'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
    forSale: 11,
    price: '$70.91',
    total: '$780.02',
  },
  {
    address: 'mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV',
    forSale: 264,
    price: '$69.76',
    total: '$18,407.66',
  },
];

type PriceOTCBuyTabProps = {
  toggleMakeOfferScreen?: () => void;
};

export const PriceOTCBuyTab: FC<PriceOTCBuyTabProps> = ({
  toggleMakeOfferScreen,
}) => {
  return (
    <div className="flex flex-col">
      <Divider className="my-4" />
      <div className="flex items-center justify-between mb-4">
        <p className="text-content text-body-xs">Lowest Price: 58.00 USDT</p>
        <Button variant="outline" onClick={toggleMakeOfferScreen}>
          <span className="text-body-xs leading-5 font-semibold">
            Make an Offer
          </span>
        </Button>
      </div>
      <NativeTable>
        <NativeTableHeader
          items={tableTopbarItems}
          customGrid={'156px repeat(3, 97px) 106px'}
        />

        {tableRowDataArr.map(({ address, forSale, price, total }) => (
          <NativeTableRow
            key={price}
            customGrid={'156px repeat(3, 97px) 106px'}
          >
            <NativeTableColumn>
              <HashShortView hash={address} />
            </NativeTableColumn>
            <NativeTableColumn>{forSale}</NativeTableColumn>
            <NativeTableColumn>{price}</NativeTableColumn>
            <NativeTableColumn>{total}</NativeTableColumn>
            <div className="pl-2 py-[6px]">
              <div className="flex justify-center py-[6px] px-8 border border-divider rounded-md">
                <input
                  type="number"
                  placeholder="0.00"
                  className="text-content text-body-xs w-full  focus:outline-none"
                />
              </div>
            </div>
          </NativeTableRow>
        ))}
      </NativeTable>
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
        label={'Total'}
        value={0}
        placeholder={'0'}
        valueText="USDT"
        name={'total'}
        className="text-body-xs"
        disabled
      />
    </div>
  );
};
