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
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';

const tableTopbarItems = [
  'Seller',
  'For Sale',
  'Price',
  'Total Value',
  'Tokens to Buy',
];

type PriceOTCBuyTabProps = {
  toggleMakeOfferScreen?: () => void;
  estate: SecondaryEstate;
};

export const PriceOTCBuyTab: FC<PriceOTCBuyTabProps> = ({
  toggleMakeOfferScreen,
  estate,
}) => {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1">
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

          {estate.assetDetails.otc.buying.map(
            ({ seller, price, tokensForSale, totalValue }) => (
              <NativeTableRow
                key={price}
                customGrid={'156px repeat(3, 97px) 106px'}
              >
                <NativeTableColumn>
                  <HashShortView hash={seller} />
                </NativeTableColumn>
                <NativeTableColumn>{tokensForSale}</NativeTableColumn>
                <NativeTableColumn>{price}</NativeTableColumn>
                <NativeTableColumn>{totalValue}</NativeTableColumn>
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
            )
          )}
        </NativeTable>
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
          value={0}
          placeholder={'0'}
          valueText="USDT"
          name={'total'}
          className="text-body-xs"
          disabled
        />
      </div>

      <Button>Buy</Button>
    </div>
  );
};
