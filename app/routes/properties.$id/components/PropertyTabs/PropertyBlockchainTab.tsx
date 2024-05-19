// components
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
          <p>0xDcfE...6FcdAb</p>
        </TableItem>
        <TableItem>
          <p>Asset ID</p>
          <p>0x2C0C...b0BC49</p>
        </TableItem>
      </Table>
    </div>
  );
};
