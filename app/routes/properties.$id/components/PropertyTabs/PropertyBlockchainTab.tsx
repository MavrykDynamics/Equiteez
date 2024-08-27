// components
import { HashChip } from '~/lib/molecules/HashChip';
import { Table } from '~/lib/atoms/Table/Table';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { TableItem } from '~/lib/atoms/Table/TableItem';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';

export const PropertyBlockchainTab = () => {
  const { activeEstate } = useEstatesContext();
  if (!activeEstate) return <>Loading...</>;

  const { blockchain } = activeEstate.assetDetails;
  return (
    <div>
      {blockchain.map((chainData) => (
        <Table key={chainData.assetId} className="bg-white">
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
