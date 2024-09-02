import { FC, useCallback, useState } from 'react';

// providers
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

// components
import { Button } from '~/lib/atoms/Button';
import { Divider } from '~/lib/atoms/Divider';
import { Table } from '~/lib/atoms/Table/Table';
import { PopupWithIcon } from '~/templates/PopupWIthIcon/PopupWithIcon';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';

//consts & types
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { BUY, CONFIRM, OTC, SELL } from '../consts';
import { CommaNumber } from '~/lib/atoms/CommaNumber';
import { ProgresBar } from '../components/ProgressBar/ProgressBar';
import { PopupContent } from '../popups';

// types
export type OrderType = typeof BUY | typeof SELL | typeof OTC | typeof CONFIRM;

export const SecondaryPriceBlock: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(BUY);
  const { activeEstate } = useEstatesContext();

  const handleRequestClose = useCallback(() => {
    setIsOpen(false);
    setOrderType(BUY);
  }, []);

  const handleOpen = useCallback((orderType: OrderType) => {
    setOrderType(orderType);
    setIsOpen(true);
  }, []);

  if (!activeEstate) return <>Loading...</>;
  const estate = activeEstate as SecondaryEstate;

  return (
    <section className="self-start">
      <Table className="bg-white">
        <div className="text-content text-card-headline flex justify-between mb-6">
          <p>Current Price</p>
          <CommaNumber
            value={estate.assetDetails.priceDetails.price}
            beginningText="$"
          />
        </div>
        <div className="text-content body flex justify-between mb-4">
          <p className="flex items-center gap-1">
            Total Return
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.priceDetails.annualReturn}%
          </p>
        </div>
        <div className="text-content body flex justify-between mb-4">
          <p className="flex items-center gap-1">
            Expected Income
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.financials.expectedIncome.income}%
          </p>
        </div>
        <div className="text-content body flex justify-between">
          <p className="flex items-center gap-1">
            Investors
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </p>
          <p className="text-buttons">
            {estate.assetDetails.offering.minInvestmentAmount.toFixed(0)}
          </p>
        </div>
        <Divider className="my-4" />
        <div className="text-content text-buttons flex justify-between mb-3">
          <p>Total Liquidity</p>
          <div className="flex items-center gap-1">
            ${estate.assetDetails.priceDetails.totalLiquidity}
            <InfoTooltip className="w-6 h-6" content={'Total Liquidity'} />
          </div>
        </div>

        <ProgresBar />
        <div className="grid gap-3 grid-cols-2 mt-4">
          <Button onClick={handleOpen.bind(null, BUY)}>Buy</Button>
          <Button variant="outline" onClick={handleOpen.bind(null, SELL)}>
            Sell
          </Button>
        </div>
      </Table>

      <PopupWithIcon
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        contentPosition={'right'}
      >
        <PopupContent estate={estate} orderType={orderType} />
      </PopupWithIcon>
    </section>
  );
};
