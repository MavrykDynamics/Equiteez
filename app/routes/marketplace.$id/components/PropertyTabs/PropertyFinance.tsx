// components
import { Table } from "~/lib/atoms/Table/Table";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";
import { ColoredCard } from "~/lib/atoms/ColoredCard";
import {
  ClickableExpanderArea,
  CustomExpander,
  ExpanderBodyContent,
  ExpanderFaceContent,
} from "~/lib/organisms/CustomExpander/CustomExpander";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import { formatDate } from "~/lib/utils/date";
import Money from "~/lib/atoms/Money";

export const PropertyFinanceTab = () => {
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <>Loading...</>;
  const { propertyFinancials, expectedIncome } =
    activeEstate.assetDetails.financials;

  return (
    <div>
      <Table className="bg-white">
        <TableHeader>Property Financials</TableHeader>
        <TableItem>
          <p>Gross Rent / Year</p>

          <p className="flex">
            $<Money>{propertyFinancials.grossRentYearly.toString()}</Money>
          </p>
        </TableItem>
        <TableItem>
          <p>Gross Rent / Month</p>

          <p className="flex">
            $<Money>{propertyFinancials.grossRentMonthly.toString()}</Money>
          </p>
        </TableItem>

        <CustomExpander>
          <ClickableExpanderArea>
            <TableItem>
              <ExpanderFaceContent>Monthly Costs</ExpanderFaceContent>

              <p className="flex">
                -$
                <Money>
                  {propertyFinancials.monthlyCosts.costs.toString()}
                </Money>
              </p>
            </TableItem>
          </ClickableExpanderArea>

          <ExpanderBodyContent>
            <div className="flex flex-col px-4 bg-[#E3E1DD40]">
              <TableItem textVariant="body-xs">
                <p>Net ReProperty Management (8.00%)</p>
                <p className="flex">
                  -$
                  <Money>
                    {propertyFinancials.monthlyCosts.netReproperty.toString()}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Equiteez Platform (2.00%)</p>
                <p className="flex">
                  -$
                  <Money>
                    {propertyFinancials.monthlyCosts.platform.toString()}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Maintenance Expenses</p>
                <p className="flex">
                  -$
                  <Money>
                    {propertyFinancials.monthlyCosts.expenses.toString()}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Property Taxes</p>
                <p className="flex">
                  -$
                  <Money>
                    {propertyFinancials.monthlyCosts.taxes.toString()}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Insurance</p>
                <p className="flex">
                  -$
                  <Money>
                    {propertyFinancials.monthlyCosts.insurance.toString()}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Utilities</p>
                <p>{propertyFinancials.monthlyCosts.utilities}</p>
              </TableItem>
            </div>
          </ExpanderBodyContent>
        </CustomExpander>

        <TableItem customBorder="border-b border-active-tab">
          <p>Net Rent / Month</p>

          <p className="flex">
            $<Money>{propertyFinancials.netRentMonthly}</Money>
          </p>
        </TableItem>
        <TableItem
          textVariant="bold"
          customBorder="border-none mt-2"
          customPadding={8}
        >
          <p>Net Rent / Year</p>
          <p className="flex">
            $<Money>{propertyFinancials.netRentYearly}</Money>
          </p>
        </TableItem>
        <CustomExpander>
          <ClickableExpanderArea>
            <TableItem
              customPadding={8}
              textVariant="bold"
              customBorder="border-none"
            >
              <ExpanderFaceContent>Total Investment</ExpanderFaceContent>

              <p className="flex">
                $<Money>{propertyFinancials.totalInvestment.total}</Money>
              </p>
            </TableItem>
          </ClickableExpanderArea>
          <ExpanderBodyContent>
            <div className="flex flex-col px-4 bg-[#E3E1DD40]">
              <TableItem textVariant="body-xs">
                <p>Underlying Asset Price</p>

                <p className="flex">
                  $
                  <Money>
                    {propertyFinancials.totalInvestment.underlyingAssetPrice}
                  </Money>
                </p>
              </TableItem>
              <TableItem textVariant="body-xs">
                <p>Initial Maintenance Reserve</p>

                <p className="flex">
                  $
                  <Money>
                    {propertyFinancials.totalInvestment.initialMaintenanceReserve.toString()}
                  </Money>
                </p>
              </TableItem>
            </div>
          </ExpanderBodyContent>
        </CustomExpander>
        <TableItem textVariant="bold" customPadding={8} isLast>
          <div className="flex items-center gap-x-1">
            Expected Income
            {/* <InfoTooltip content={"Expected Income "} /> */}
          </div>
          <p>{expectedIncome.income}%</p>
        </TableItem>
      </Table>
      <div className="mb-8" />
      <Table className="bg-white">
        <TableHeader>Expected Income</TableHeader>
        <TableItem>
          <p>Expected Income</p>
          <p className="font-semibold">{expectedIncome.income}%</p>
        </TableItem>
        <TableItem>
          <p>Income per Token</p>
          <p>${expectedIncome.incomePerTokenYearly} / Year</p>
        </TableItem>
        <TableItem>
          <p>Income Start Date</p>
          <p>{formatDate(expectedIncome.incomeStartDate)}</p>
        </TableItem>
        <TableItem>
          <p>Token Price</p>
          <p>${expectedIncome.tokenPrice}</p>
        </TableItem>
        <TableItem isLast>
          <p>Total Tokens</p>
          <Money>{expectedIncome.totalTokens}</Money>
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
