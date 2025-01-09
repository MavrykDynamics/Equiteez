// components
import { HashChip } from "~/lib/molecules/HashChip";
import { Table } from "~/lib/atoms/Table/Table";
import { TableHeader } from "~/lib/atoms/Table/TableHeader";
import { TableItem } from "~/lib/atoms/Table/TableItem";
import { useEstatesContext } from "~/providers/EstatesProvider/estates.provider";
import {
  ClickableExpanderArea,
  CustomExpander,
  ExpanderBodyContent,
  ExpanderFaceContent,
} from "~/lib/organisms/CustomExpander/CustomExpander";
import Money from "~/lib/atoms/Money";

const mockedAdminPkhs = [
  {
    name: "Account 1",
    address: "mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w",
  },
  {
    name: "Account 1",
    address: "mv1Q3DyGiVYDrRj5PrUVQkTA1LHwYy8gHwQV",
  },
];

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
            <p>
              <Money>{chainData.totalTokens}</Money>
            </p>
          </TableItem>
          <TableItem>
            <p>Asset Issuer</p>
            <p>Equiteez LTD</p>
          </TableItem>
          <TableItem>
            <p>Issuer Address</p>
            <p>
              <HashChip
                hash={chainData.assetIssuer}
                className="underline font-semibold"
              />
            </p>
          </TableItem>

          <CustomExpander>
            <ClickableExpanderArea>
              <TableItem>
                <ExpanderFaceContent>Admin Addresses</ExpanderFaceContent>
              </TableItem>
            </ClickableExpanderArea>

            <ExpanderBodyContent>
              <div className="px-4 bg-[#E3E1DD40]">
                {mockedAdminPkhs.map((item) => (
                  <TableItem key={item.address}>
                    <p>{item.name}</p>
                    <p>
                      <HashChip
                        hash={item.address}
                        className="underline font-semibold"
                      />
                    </p>
                  </TableItem>
                ))}
              </div>
            </ExpanderBodyContent>
          </CustomExpander>
          <TableItem isLast>
            <p>Asset ID</p>
            <p>
              <HashChip
                hash={chainData.assetId}
                className="underline font-semibold"
              />
            </p>
          </TableItem>
        </Table>
      ))}
    </div>
  );
};
