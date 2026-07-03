import { api } from "app/lib/utils/api";
import { TokenType } from "../tokens.provider.types";
import { TOKENS_SCAM_RECORD } from "./consts";
import { TokenMetadata } from "~/lib/metadata";

type RwaTokenType = {
  contract: { address: string };
  tokenId: string;
};

const withIndexerBypass = (url: string) => {
  const bypassSecret = process.env.INDEXER_ALLOWLIST_BYPASS_SECRET;

  if (!bypassSecret) {
    return url;
  }

  const indexerUrl = new URL(url);
  indexerUrl.searchParams.set("bypass", bypassSecret);

  return indexerUrl.toString();
};

export const fetchTokensData = async () => {
  try {
    const { data } = await api<RwaTokenType[]>(
      withIndexerBypass(`${process.env.API_URL}/tokens`)
    );

    const tokens: TokenType[] = data.map((t) => ({
      contract: t.contract.address,
      id: t.tokenId,
    }));

    return tokens.filter((t) => !TOKENS_SCAM_RECORD[t.contract]);
  } catch (e) {
    console.error(e), "Error while fetching tokens";
    return [];
  }
};

export const fetchTokensMetadata = async (
  tokens: TokenType[]
): Promise<StringRecord<TokenMetadata>> => {
  try {
    const tokenContractsArr = tokens.map((t) => t.contract);
    const queryBody = {
      query: `query TokensMetadataQuery {
        token_metadata(where: {contract: {_in: ${JSON.stringify(
          tokenContractsArr
        )}}}) {
          contract
          metadata
        }
      }`,
      variables: null,
      operationName: "TokensMetadataQuery",
    };

    const { data: apiData } = await api<{
      data: { token_metadata: { contract: string; metadata: TokenMetadata }[] };
    }>(withIndexerBypass(process.env.TOKENS_METADATA_API), {
      body: JSON.stringify(queryBody),
      method: "POST",
    });

    const {
      data: { token_metadata },
    } = apiData;

    const tokensRecord = tokens.reduce<StringRecord<TokenType>>(
      (acc, token) => {
        acc[token.contract] = token;

        return acc;
      },
      {}
    );

    const parsedData = token_metadata.reduce<StringRecord<TokenMetadata>>(
      (acc, meta) => {
        const token = tokensRecord[meta.contract];

        if (!token) {
          return acc;
        }

        const decimals = Number(meta.metadata?.decimals);

        acc[meta.contract.concat(`_${token.id}`)] = {
          ...meta.metadata,
          address: meta.contract,
          id: token.id,
          decimals: Number.isFinite(decimals) ? decimals : 0,
        };
        return acc;
      },
      {}
    );

    return parsedData;
  } catch (e) {
    console.error(e, "Error while fetching tokens metadata");
    return {};
  }
};
