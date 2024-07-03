import { FC } from 'react';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';

// icons
import ClockIcon from 'app/icons/clock.svg?react';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { TableItemSmall } from '~/lib/atoms/Table/TableItem';
import { formatDate } from '~/lib/utils/date';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';

export const FinancialTab: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
  const {
    valuation: { priorValuation, initialValuation },
  } = estate.assetDetails;

  return (
    <section className="w-full">
      <TableHeader mb={1}>
        <div className="flex items-center justify-between">
          <p className="text-body-xs font-semibold leading-5">
            {formatDate(priorValuation.date)}
          </p>

          <p className="text-caption-regular text-content-secondary flex items-center">
            <ClockIcon className="w-3 h-3 stroke-1 stroke-current mr-1" />
            487 days since prior valuation
          </p>
        </div>
      </TableHeader>

      <TableItemSmall>
        <p>Asset Valuation</p>
        <p>${priorValuation.assetValuation}</p>
      </TableItemSmall>
      <TableItemSmall>
        <div className="flex items-center gap-x-1">
          Annual Change <InfoTooltip content={'Annual Change'} />
        </div>
        <p className="text-success">+{priorValuation.annualChange}% </p>
      </TableItemSmall>
      <TableItemSmall>
        <p>Total Investment</p>
        <p>${priorValuation.totalInvestment}</p>
      </TableItemSmall>
      <TableItemSmall>
        <div className="flex items-center gap-x-1">
          Capital ROI <InfoTooltip content={'Capital ROI'} />
        </div>
        <p className="text-success">+{priorValuation.capitalROI}%</p>
      </TableItemSmall>
      <TableItemSmall>
        <p>Token Price</p>
        <p>${priorValuation.tokenPrice}</p>
      </TableItemSmall>
      <TableItemSmall>
        <div className="flex items-center gap-x-1">
          Reg Distributed <InfoTooltip content={'Capital ROI'} />
        </div>
        <p className="text-success">${priorValuation.regDistributed}</p>
      </TableItemSmall>
      <div className="mb-6" />
      <TableHeader mb={1}>
        <div className="flex items-center justify-between">
          <p className="text-body-xs font-semibold leading-5">
            {formatDate(initialValuation.date)}
          </p>

          <p className="text-caption-regular text-content-secondary flex items-center">
            <ClockIcon className="w-3 h-3 stroke-1 stroke-current mr-1" />
            487 days since prior valuation
          </p>
        </div>
      </TableHeader>
      <TableItemSmall>
        <p>Asset Valuation</p>
        <p>${initialValuation.assetValuation}</p>
      </TableItemSmall>
      <TableItemSmall>
        <p>Total Investment</p>
        <p>${initialValuation.totalInvestment}</p>
      </TableItemSmall>
      <TableItemSmall>
        <p>Token Price</p>
        <p>${initialValuation.tokenPrice}</p>
      </TableItemSmall>
      <TableItemSmall isLast>
        <p>Additional Info</p>
        <p>{initialValuation.info}</p>
      </TableItemSmall>
    </section>
  );
};
