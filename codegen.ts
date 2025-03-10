import { CodegenConfig } from "@graphql-codegen/cli";
import { visit } from "graphql";

// mapper of top level tables
const INDEXER_TABLES = {
  // TOKENS
  token: true,

  // Dexes
  orderbook: true,
  dodo_mav: true,
  marketplace: true,
  kyc_member: true

};

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_API,
  documents: ["app/**/*.{ts,tsx}"],
  generates: {
    "app/utils/__generated__/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
      documentTransforms: [
        {
          transform: ({ documents }) => {
            return documents.map((documentFile) => {
              if (!documentFile?.document) return documentFile;

              documentFile.document = visit(documentFile.document, {
                leave(node) {
                  /**
                   * if field has alias (node.alias)
                   * if field has name (node?.name?.value)
                   * if field is in INDEXER_TABLES mapper (INDEXER_TABLES[node.name.value])
                   */
                  // @ts-expect-error
                  if (
                    node.alias &&
                    node?.name?.value &&
                    INDEXER_TABLES[node.name.value]
                  ) {
                    // update table tabe to use prefix based on env
                    // @ts-expect-error
                    node.name.value = `${node.name.value}`;
                  }
                  return node;
                },
              });
              return documentFile;
            });
          },
        },
      ],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
