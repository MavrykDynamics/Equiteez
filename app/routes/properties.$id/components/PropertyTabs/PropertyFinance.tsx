// components
import { Table } from '~/atoms/Table/Table';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';
import { ColoredCard } from '~/atoms/ColoredCard';
import { InfoTooltip } from '~/organisms/InfoTooltip';
import { CustomExpander } from '~/organisms/CustomExpander/CustomExpander';

export const PropertyFinanceTab = () => {
  return (
    <div>
      <Table>
        <TableHeader>Property Financials</TableHeader>
        <TableItem>
          <p>Gross Rent / Year</p>
          <p>$14,160.00</p>
        </TableItem>
        <TableItem>
          <p>Gross Rent / Month</p>
          <p>$1,180.00</p>
        </TableItem>
        <CustomExpander
          expanderFaceContent={
            <TableItem>
              <p>Monthly Costs</p>
              <p>-$446.00</p>
            </TableItem>
          }
        >
          <TableItem>
            <p>Net ReProperty Management (8.00%)</p>
            <p>-$94.40</p>
          </TableItem>
          <TableItem>
            <p>Equiteez Platform (2.00%)</p>
            <p>-$23.60</p>
          </TableItem>
        </CustomExpander>

        <TableItem customBorder="border-b border-active-tab">
          <p>Net Rent / Month</p>
          <p>$734.00</p>
        </TableItem>
        <TableItem textVariant="bold" customBorder="border-none">
          <p>Net Rent / Year</p>
          <p>$8,808.00</p>
        </TableItem>
        <TableItem textVariant="bold" customBorder="border-none">
          <p>Total Investment</p>
          <p>$84,900.00</p>
        </TableItem>
        <TableItem textVariant="bold" isLast>
          <div className="flex items-center gap-x-1">
            Expected Income <InfoTooltip content={'Expected Income '} />
          </div>
          <p>10.37%</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table>
        <TableHeader>Expected Income</TableHeader>
        <TableItem>
          <p>Expected Income</p>
          <p className="font-semibold">10.37%</p>
        </TableItem>
        <TableItem>
          <p>Income per Token</p>
          <p>$5.51 / Year</p>
        </TableItem>
        <TableItem>
          <p>Income Start Date</p>
          <p>24 Oct 2024</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>$54.11</p>
        </TableItem>
        <TableItem isLast>
          <p>Total Tokens</p>
          <p>1,600</p>
        </TableItem>
        <div className="mt-6">
          <ColoredCard>
            All financial statements of property yield are best estimates based
            on current conditions, and can change at any time. We are targeting
            the above yield for investors; however, no assurance can be given
            that you will obtain any return on investment, and there is a risk
            that you can lose your entire investment.
          </ColoredCard>
        </div>
      </Table>
    </div>
  );
};
