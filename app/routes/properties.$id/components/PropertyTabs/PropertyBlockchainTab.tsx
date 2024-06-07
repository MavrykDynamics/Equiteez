// components
import { HashChip } from '~/molecules/HashChip';
import { Table } from '~/atoms/Table/Table';
import { TableHeader } from '~/atoms/Table/TableHeader';
import { TableItem } from '~/atoms/Table/TableItem';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import { Navigate } from '@remix-run/react';

export const PropertyBlockchainTab = () => {
  const { activeEstate } = useEstatesContext();
  if (!activeEstate) return <Navigate to="/" replace />;

  const { blockchain } = activeEstate.assetDetails;
  return (
    <div>
      {blockchain.map((chainData) => (
        <Table key={chainData.assetId}>
          <TableHeader>{chainData.name} Blockchain</TableHeader>
          <TableItem>
            <p>Identifier</p>
            <p>{chainData.identifier}</p>
          </TableItem>
          <TableItem>
            <p>Total Tokens</p>
            <p>{chainData.totalTokens}</p>
          </TableItem>
          <TableItem>
            <p>Asset Issuer</p>
            <p>
              <HashChip hash={chainData.assetIssuer} />
            </p>
          </TableItem>
          <TableItem isLast>
            <p>Asset ID</p>
            <p>
              <HashChip hash={chainData.assetId} />
            </p>
          </TableItem>
        </Table>
      ))}
    </div>
  );
};
