import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '~/lib/atoms/Button';
import { HashShortView } from '~/lib/atoms/HashShortView';
import {
  NativeTable,
  NativeTableColumn,
  NativeTableHeader,
  NativeTableRow,
} from '~/lib/atoms/NativeTable/NativeTable';
import { InputNumber } from '~/lib/molecules/Input/Input';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { OTC_BUY, OTCScreenState, OTCTabType } from './consts';
import { Divider } from '~/lib/atoms/Divider';

// icons
import ArrowDownIcon from 'app/icons/arrow-down.svg?react';
import { FormCheckbox } from '~/lib/molecules/FormCheckBox';
import clsx from 'clsx';

type OTCBuySellScreenProps = {
  symbol: string;
  estate: SecondaryEstate;
  toggleScreen: (id: OTCScreenState) => void;
  activeTabId: OTCTabType;
};

// table data
const tableBuyItems = [
  {
    id: 1,
    content: '',
    sortable: false,
  },
  {
    id: 2,
    content: 'Seller',
    sortable: false,
  },
  {
    id: 3,
    content: (
      <div className="flex items-center gap-1">
        <span>For Sale</span>
        <ArrowDownIcon className="size-4" />
      </div>
    ),
    sortable: true,
  },
  {
    id: 4,
    content: (
      <div className="flex items-center gap-1">
        <span>Price</span>
        <ArrowDownIcon className="size-4" />
      </div>
    ),
    sortable: true,
  },
  {
    id: 5,
    content: 'Total Value',
    sortable: false,
  },
];

const tableSellItems = [
  {
    id: 1,
    content: '',
    sortable: false,
  },
  {
    id: 2,
    content: 'Buyer',
    sortable: false,
  },
  {
    id: 3,
    content: (
      <div className="flex items-center gap-1">
        <span>Amount</span>
        <ArrowDownIcon className="size-4" />
      </div>
    ),
    sortable: true,
  },
  {
    id: 4,
    content: (
      <div className="flex items-center gap-1">
        <span>Price</span>
        <ArrowDownIcon className="size-4" />
      </div>
    ),
    sortable: true,
  },
  {
    id: 5,
    content: 'Total Value',
    sortable: false,
  },
];

export const OTCBuySellScreen: FC<OTCBuySellScreenProps> = ({
  symbol,
  toggleScreen,
  estate,
  activeTabId,
}) => {
  const [amount, setAmount] = useState<string | number>('');

  const [checkboxesState, setCheckboxesState] = useState(() =>
    estate.assetDetails.otc.buying.reduce<{ [x: string]: boolean }>(
      (acc, item) => {
        acc[item.seller] = false;

        return acc;
      },
      {}
    )
  );
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);

  const isBuytab = activeTabId === OTC_BUY;
  const tableItems = useMemo(
    () => (isBuytab ? tableBuyItems : tableSellItems),
    [isBuytab]
  );

  const headerItems = useMemo(
    () => tableItems.map((item) => item.content),
    [tableItems]
  );

  const handleContinueClick = useCallback(() => {
    toggleScreen('confirm');
  }, [toggleScreen]);

  const toggleCheckbox = useCallback(
    (seller: string) => {
      if (!checkboxesState[seller]) {
        setCheckboxesState({ ...checkboxesState, [seller]: true });
        setSelectedSeller(seller);
      }
      if (checkboxesState[seller]) {
        setCheckboxesState({ ...checkboxesState, [seller]: false });
        setSelectedSeller(null);
      }
    },
    [checkboxesState]
  );

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="flex-1 ">
        <div className="flex flex-col mt-6">
          <form>
            <NativeTable>
              <NativeTableHeader
                alternativeDesign
                items={headerItems}
                customGrid={'24px 148px repeat(3, 124px)'}
              />
              <div className="max-h-[267px] overflow-y-scroll">
                {estate.assetDetails.otc[isBuytab ? 'buying' : 'selling'].map(
                  ({ seller, price, tokensForSale, totalValue }) => {
                    const disabled = selectedSeller
                      ? selectedSeller !== seller
                      : false;
                    return (
                      <div
                        role="presentation"
                        key={price}
                        className={clsx(
                          disabled && 'pointer-events-none opacity-50',
                          'cursor-pointer transition 0.3s ease-in-out'
                        )}
                        onClick={() => toggleCheckbox(seller)}
                      >
                        <NativeTableRow
                          customGrid={'24px 148px repeat(3, 124px)'}
                        >
                          <NativeTableColumn className="py-4">
                            <div className="pointer-events-none">
                              <FormCheckbox
                                name={seller}
                                checked={checkboxesState[seller]}
                                disabled={disabled}
                              />
                            </div>
                          </NativeTableColumn>
                          <NativeTableColumn className="py-4">
                            <HashShortView hash={seller} />
                          </NativeTableColumn>
                          <NativeTableColumn className="py-4">
                            {tokensForSale}
                          </NativeTableColumn>
                          <NativeTableColumn className="py-4">
                            {price}
                          </NativeTableColumn>
                          <NativeTableColumn className="py-4">
                            {totalValue}
                          </NativeTableColumn>
                        </NativeTableRow>
                      </div>
                    );
                  }
                )}
              </div>
            </NativeTable>
          </form>

          <Divider className="my-6" />

          <div className="flex flex-col gap-4">
            <h2 className="text-card-headline text-content">OTC Order</h2>
            <p className=" text-body-xs text-content flex justify-between">
              <span>
                {isBuytab ? 'Available Balance' : 'Available For Sale'}
              </span>
              <span>20.00 NMD</span>
            </p>
            <InputNumber
              handleValue={setAmount}
              label={'Amount'}
              value={amount || ''}
              placeholder={'Minimum 1'}
              valueText={symbol}
              name={'amount'}
            />
          </div>
        </div>

        <Divider className="my-4" />

        <div className="text-body-xs flex justify-between mb-6">
          <div className="flex items-center gap-2">
            Est. Fee
            <InfoTooltip content="Est fee" />
          </div>
          <p>0.71 {symbol}</p>
        </div>

        <InputNumber
          label={'Total'}
          value={amount}
          placeholder={'0'}
          valueText="USDT"
          name={'total'}
        />
      </div>
      <Button
        variant="dark"
        onClick={handleContinueClick}
        className="mt-[145px]"
      >
        Continue
      </Button>
    </div>
  );
};
