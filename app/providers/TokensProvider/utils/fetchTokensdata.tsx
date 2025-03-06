import { api } from "app/lib/utils/api";
import { TokenType } from "../tokens.provider.types";
import { TOKENS_SCAM_RECORD } from "./consts";
import { TokenMetadata } from "~/lib/metadata";

type RwaTokenType = {
  contract: { address: string };
  tokenId: string;
};

export const fetchTokensData = async () => {
  try {
    const { data } = await api<RwaTokenType[]>(`${process.env.API_URL}/tokens`);

    const tokens: TokenType[] = data.map((t) => ({
      contract: t.contract.address,
      id: t.tokenId,
    }));

    return tokens.filter((t) => !TOKENS_SCAM_RECORD[t.contract]);
  } catch (e) {
    console.log(e);
    throw new Error("Error while fetching tokens");
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
    }>(process.env.TOKENS_METADATA_API, {
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
        acc[meta.contract.concat(`_${tokensRecord[meta.contract].id}`)] = {
          ...meta.metadata,
          decimals: Number(meta.metadata?.decimals) ?? undefined,
        };
        return acc;
      },
      {}
    );

    return parsedData;
  } catch (e) {
    console.log(e);
    throw new Error("Error while fetching tokens metadata");
  }
};
