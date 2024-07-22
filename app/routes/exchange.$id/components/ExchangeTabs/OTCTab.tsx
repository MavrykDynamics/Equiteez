import { FC } from 'react';
import {
  NativeTable,
  NativeTableColumnSmall,
  NativeTableHeader,
  NativeTableRow,
} from '~/lib/atoms/NativeTable/NativeTable';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';

// Consts
const headerItems = ['Seller', 'Tokens for Sale', 'Price', 'Total Value'];

export const OTCTab: FC<{ estate: SecondaryEstate }> = ({ estate }) => {
  const { otc } = estate.assetDetails;

  return (
    <section>
      <div className="mb-7 -mt-2">
        <TableHeader mb={0}>
          <span className="text-body-xs leading-5 font-semibold">Buying</span>
        </TableHeader>
      </div>
      <NativeTable>
        <NativeTableHeader
          items={headerItems}
          slotWidth={189}
          alternativeDesign
        />

        {otc.buying.map(({ seller, tokensForSale, price, totalValue }) => (
          <NativeTableRow key={seller} colWidth={189}>
            <NativeTableColumnSmall>{seller}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{tokensForSale}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{price}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{totalValue}</NativeTableColumnSmall>
          </NativeTableRow>
        ))}
      </NativeTable>

      <div className="mb-7 mt-4">
        <TableHeader mb={0}>
          <span className="text-body-xs leading-5 font-semibold">Selling</span>
        </TableHeader>
      </div>
      <NativeTable>
        <NativeTableHeader
          items={headerItems}
          slotWidth={189}
          alternativeDesign
        />

        {otc.selling.map(({ seller, tokensForSale, price, totalValue }) => (
          <NativeTableRow key={seller} colWidth={189}>
            <NativeTableColumnSmall>{seller}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{tokensForSale}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{price}</NativeTableColumnSmall>
            <NativeTableColumnSmall>{totalValue}</NativeTableColumnSmall>
          </NativeTableRow>
        ))}
      </NativeTable>
    </section>
  );
};
