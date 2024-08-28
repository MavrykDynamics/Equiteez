/* eslint-disable react/no-unescaped-entities */

// components
import { Table } from '~/lib/atoms/Table/Table';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { TableItem } from '~/lib/atoms/Table/TableItem';

// icons
import ClockIcon from 'app/icons/clock.svg?react';

// styles
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { formatDate } from '~/lib/utils/date';

export const PropertyOfferingTab = () => {
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <>Loading...</>;

  const {
    offering,
    valuation: { priorValuation, initialValuation },
  } = activeEstate.assetDetails;

  return (
    <div>
      <Table className="bg-white">
        <div className="mb-2">
          <TableHeader>Offering</TableHeader>
        </div>
        <TableItem>
          <p>Offering Date</p>
          <p>{formatDate(offering.offeringDate)}</p>
        </TableItem>
        <TableItem>
          <p>Issuer</p>
          <p>{offering.offeringIssuer}</p>
        </TableItem>
        <TableItem>
          <p>Min. Investment Amount</p>
          <p>${offering.minInvestmentAmount}</p>
        </TableItem>
        <TableItem>
          <p>Max. Investment Amount</p>
          <p>${offering.maxInvestmentAmount}</p>
        </TableItem>
        <TableItem>
          <p>Amount Raised</p>
          <p>${offering.raisedAmount}</p>
        </TableItem>
        <TableItem isLast>
          <p>Offering Percent (of Total Tokens)</p>
          <p>{offering.offeringPercent}%</p>
        </TableItem>
      </Table>
      <div className="mb-11" />

      <Table className="bg-white">
        <div className="mb-2">
          <TableHeader>Valuation</TableHeader>
        </div>
        <TableHeader>
          <div className="flex items-center justify-between">
            <p>{formatDate(priorValuation.date)}</p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              487 days since prior valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>
          <p>${priorValuation.assetValuation}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Annual Change <InfoTooltip content={'Annual Change'} />
          </div>
          <p className="text-success">+{priorValuation.annualChange}% </p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>
          <p>${priorValuation.totalInvestment}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Capital ROI <InfoTooltip content={'Capital ROI'} />
          </div>
          <p className="text-success">+{priorValuation.capitalROI}%</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>${priorValuation.tokenPrice}</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Reg Distributed <InfoTooltip content={'Capital ROI'} />
          </div>
          <p className="text-success">${priorValuation.regDistributed}</p>
        </TableItem>
        <TableItem isLast>
          <p>Additional Info</p>
          <p>{priorValuation.info}</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table className="bg-white">
        <TableHeader>
          <div className="flex items-center justify-between">
            <p>{formatDate(initialValuation.date)}</p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              Initial Valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>
          <p>${initialValuation.assetValuation}</p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>
          <p>${initialValuation.totalInvestment}</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>${initialValuation.tokenPrice}</p>
        </TableItem>
        <TableItem isLast>
          <p>Additional Info</p>
          <p>{initialValuation.info}</p>
        </TableItem>
      </Table>
    </div>
  );
};
