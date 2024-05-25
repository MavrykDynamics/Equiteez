/* eslint-disable react/no-unescaped-entities */

// components
import { Table } from '~/atoms/Table/Table';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';

// icons
import ClockIcon from 'app/icons/clock.svg?react';

// styles
import { InfoTooltip } from '~/organisms/InfoTooltip';

export const PropertyOfferingTab = () => {
  return (
    <div>
      <h3 className="mb-2">
        <TableHeader>Offering</TableHeader>
      </h3>
      <Table>
        <TableItem>
          <p>Offering Date</p>
          <p>22 Sep 2022</p>
        </TableItem>
        <TableItem>
          <p>Issuer</p>
          <p>Equiteez</p>
        </TableItem>
        <TableItem>
          <p>Min. Investment Amount</p>
          <p>$53.06</p>
        </TableItem>
        <TableItem>
          <p>Max. Investment Amount</p>
          <p>$84,900.00</p>
        </TableItem>
        <TableItem>
          <p>Amount Raised</p>
          <p>$84,900.00</p>
        </TableItem>
        <TableItem isLast>
          <p>Offering Percent (of Total Tokens)</p>
          <p>100.00%</p>
        </TableItem>
      </Table>
      <div className="mb-11" />
      <h3 className="mb-2">
        <TableHeader>Valuation</TableHeader>
      </h3>
      <Table>
        <TableHeader>
          <div className="flex items-center justify-between">
            <p>22 Jan 2024</p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              487 days since prior valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>
          <p>$84,000.00</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Annual Change <InfoTooltip content={'Annual Change'} />
          </div>
          <p className="text-success">+17.65% </p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>
          <p>$84,900.00</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Capital ROI <InfoTooltip content={'Capital ROI'} />
          </div>
          <p className="text-success">+13.92%</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>$53.07</p>
        </TableItem>
        <TableItem>
          <div className="flex items-center gap-x-1">
            Reg Distributed <InfoTooltip content={'Capital ROI'} />
          </div>
          <p className="text-success">$7,882.22</p>
        </TableItem>
        <TableItem>
          <p>Additional Info</p>
          <p>?</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table>
        <TableHeader>
          <div className="flex items-center justify-between">
            <p>22 Sep 2022</p>

            <p className="text-body text-secondary-content flex items-center">
              <ClockIcon className="w-6 h-6 stroke-1 stroke-current mr-1" />
              Initial Valuation
            </p>
          </div>
        </TableHeader>
        <TableItem>
          <p>Asset Valuation</p>
          <p>$68,000.00</p>
        </TableItem>
        <TableItem>
          <p>Total Investment</p>
          <p>$78,816.00</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>$49.26</p>
        </TableItem>
        <TableItem isLast>
          <p>Additional Info</p>
          <p>?</p>
        </TableItem>
      </Table>
    </div>
  );
};
