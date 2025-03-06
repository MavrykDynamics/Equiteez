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
  kyc_member: true,
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
                Field(node) {
                  if (
                    node.alias &&
                    node.name?.value &&
                    INDEXER_TABLES[node.name.value]
                  ) {
                    return {
                      ...node,
                      name: {
                        ...node.name,
                        value: `${node.name.value}`, // Ensure name stays consistent
                      },
                      arguments: node.arguments || [], // Preserve arguments like limit and offset
                    };
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
