import { Button } from '~/atoms/Button';
import {
  NativeTable,
  NativeTableRow,
  NativeTableColumn,
  NativeTableHeader,
} from '~/atoms/NativeTable/NativeTable';
import { Spacer } from '~/atoms/Spacer';
import { Table } from '~/atoms/Table/Table';
import { TableHeader } from '~/atoms/Table/TableHeader';

const headerItems = ['Seller', 'Tokens for Sale', 'Price', 'Total Value'];

const fakeTableData = [
  {
    name: 'Savannah Nguyen',
    tokensForSale: '450',
    price: '$68,382',
    total: '$30,771.9',
  },
  {
    name: 'Cody Fisher',
    tokensForSale: '68',
    price: '$70,56',
    total: '$4,798.08',
  },
  {
    name: 'Cameron Williamson',
    tokensForSale: '133',
    price: '$71,898',
    total: '$9,562.43',
  },
  {
    name: 'Jane Cooper',
    tokensForSale: '11',
    price: '$70,911',
    total: '$780.02',
  },
  {
    name: 'Marvin McKinney',
    tokensForSale: '264',
    price: '$69,726',
    total: '$18,407.66',
  },
];

export const PropertyOTCTab = () => {
  return (
    <section>
      <Table>
        <div className="mb-2">
          <TableHeader>Buying</TableHeader>
        </div>
        <NativeTable>
          <NativeTableHeader items={headerItems} />

          {fakeTableData.map(({ name, tokensForSale, price, total }) => (
            <NativeTableRow key={name}>
              <NativeTableColumn>{name}</NativeTableColumn>
              <NativeTableColumn>{tokensForSale}</NativeTableColumn>
              <NativeTableColumn>{price}</NativeTableColumn>
              <NativeTableColumn>{total}</NativeTableColumn>
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

          {fakeTableData.map(({ name, tokensForSale, price, total }) => (
            <NativeTableRow key={name}>
              <NativeTableColumn>{name}</NativeTableColumn>
              <NativeTableColumn>{tokensForSale}</NativeTableColumn>
              <NativeTableColumn>{price}</NativeTableColumn>
              <NativeTableColumn>{total}</NativeTableColumn>
              <Button size="custom" className="self-center">
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
