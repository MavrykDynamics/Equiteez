/* eslint-disable react/no-unescaped-entities */

// components
import { Table } from "~/lib/atoms/Table/Table";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";

// icons
import ClockIcon from "app/icons/clock.svg?react";

// styles
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { formatDate } from "~/lib/utils/date";
import Money from "~/lib/atoms/Money";
import { Spinner } from "~/lib/atoms/Spinner";

export const PropertyOfferingTab = () => {
  const { activeMarket } = useMarketsContext();

  if (!activeMarket) return <Spinner size={56} />;

  const {
    offering,
    valuation: { priorValuation, initialValuation },
  } = activeMarket.assetDetails;

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

          <p className="flex">
            $<Money>{offering.minInvestmentAmount}</Money>
          </p>
        </TableItem>
        <TableItem>
          <p>Max. Investment Amount</p>

          <p className="flex">
            $<Money>{offering.maxInvestmentAmount}</Money>
          </p>
        </TableItem>
        <TableItem>
          <p>Amount Raised</p>

          <p className="flex">
            $<Money>{offering.raisedAmount}</Money>
          </p>
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
            <p className="text-body font-semibold">
              {formatDate(priorValuation.date)}
            </p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              487 days since prior valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>
          <p className="flex">
            $<Money>{priorValuation.assetValuation}</Money>
          </p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Annual Change
            {/* <InfoTooltip content={"Annual Change"} /> */}
          </div>
          <p className="text-success">+{priorValuation.annualChange}% </p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>

          <p className="flex">
            $<Money>{priorValuation.totalInvestment}</Money>
          </p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Capital ROI
            {/* <InfoTooltip content={"Capital ROI"} /> */}
          </div>
          <p className="text-success">+{priorValuation.capitalROI}%</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p className="flex">
            $<Money>{priorValuation.tokenPrice}</Money>
          </p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Reg Distributed
            {/* <InfoTooltip content={"Capital ROI"} /> */}
          </div>

          <p className="flex text-success">
            $<Money>{priorValuation.regDistributed}</Money>
          </p>
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
            <p className="text-body font-semibold">
              {formatDate(initialValuation.date)}
            </p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              Initial Valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>

          <p className="flex">
            $<Money>{initialValuation.assetValuation}</Money>
          </p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>

          <p className="flex">
            $<Money>{initialValuation.totalInvestment}</Money>
          </p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>

          <p className="flex">
            $<Money>{initialValuation.tokenPrice}</Money>
          </p>
        </TableItem>
        <TableItem isLast>
          <p>Additional Info</p>
          <p>{initialValuation.info}</p>
        </TableItem>
      </Table>
    </div>
  );
};
