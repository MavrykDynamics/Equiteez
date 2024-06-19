import { Button } from '~/lib/atoms/Button';
import {
  NativeTable,
  NativeTableRow,
  NativeTableColumn,
  NativeTableHeader,
} from '~/lib/atoms/NativeTable/NativeTable';
import { Spacer } from '~/lib/atoms/Spacer';
import { Table } from '~/lib/atoms/Table/Table';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';

const headerItems = ['Seller', 'Tokens for Sale', 'Price', 'Total Value'];

export const PropertyOTCTab = () => {
  const { activeEstate } = useEstatesContext();

  if (!activeEstate) return <>Loading...</>;
  const { otc } = (activeEstate as SecondaryEstate).assetDetails;
  return (
    <section>
      <Table>
        <div className="mb-2">
          <TableHeader>Buying</TableHeader>
        </div>
        <NativeTable>
          <NativeTableHeader items={headerItems} />

          {otc.buying.map(({ seller, tokensForSale, price, totalValue }) => (
            <NativeTableRow key={seller}>
              <NativeTableColumn>{seller}</NativeTableColumn>
              <NativeTableColumn>{tokensForSale}</NativeTableColumn>
              <NativeTableColumn>{price}</NativeTableColumn>
              <NativeTableColumn>{totalValue}</NativeTableColumn>
              <Button size="custom" className="self-center">
                <span className="w-full text-center text-body-xs font-semibold leading-5 py-[6px] px-6">
                  Buy
                </span>
              </Button>
            </NativeTableRow>
          ))}
        </NativeTable>
      </Table>
      <Spacer height={32} />
      <Table>
        <div className="mb-2">
          <TableHeader>Selling</TableHeader>
        </div>
        <NativeTable>
          <NativeTableHeader items={headerItems} />

          {otc.selling.map(({ seller, tokensForSale, price, totalValue }) => (
            <NativeTableRow key={seller}>
              <NativeTableColumn>{seller}</NativeTableColumn>
              <NativeTableColumn>{tokensForSale}</NativeTableColumn>
              <NativeTableColumn>{price}</NativeTableColumn>
              <NativeTableColumn>{totalValue}</NativeTableColumn>
              <Button size="custom" className="self-center" variant="red">
                <span className="w-full text-center text-body-xs font-semibold leading-5 py-[6px] px-6">
                  Sell
                </span>
              </Button>
            </NativeTableRow>
          ))}
        </NativeTable>
      </Table>
    </section>
  );
};
