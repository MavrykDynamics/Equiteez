// components
import { HashChip } from '~/molecules/HashChip';
import { Table } from '~/atoms/Table/Table';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';

export const PropertyBlockchainTab = () => {
  return (
    <div>
      <Table>
        <TableHeader>Mavryk Blockchain</TableHeader>
        <TableItem>
          <p>Identifier</p>
          <p>EQUITEEZ-COVE-7335-WILBURTON-LN-NORTHPORT-AL </p>
        </TableItem>
        <TableItem>
          <p>Total Tokens</p>
          <p>1,600</p>
        </TableItem>
        <TableItem>
          <p>Asset Issuer</p>
          <p>
            <HashChip hash={'mv1DXLvsp4T7X6gXLHn7szGN7WLooy14fQ3G'} />
          </p>
        </TableItem>
        <TableItem>
          <p>Asset ID</p>
          <p>
            <HashChip hash={'mv1DXbvsp4T7X6tQLHy3szGN7KJooy56fQ3H'} />
          </p>
        </TableItem>
      </Table>
    </div>
  );
};
