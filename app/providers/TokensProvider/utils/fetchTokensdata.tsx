import { api } from '~/lib/utils/api';
import {
  TokenMetadata,
  tokenMetadataSchema,
  TokenType,
} from '../tokens.provider.types';
import { TOKENS_SCAM_RECORD } from './consts';

type RwaTokenType = {
  contract: { address: string };
  tokenId: string;
};

export const fetchTokensData = async () => {
  try {
    const { data } = await api<RwaTokenType[]>(
      `${process.env.REACT_APP_TZKT_API}/v1/tokens`
    );

    const tokens = data.reduce<TokenType[]>((acc, t) => {
      acc.push({
        contract: t.contract.address,
        id: t.tokenId,
      });

      return acc;
    }, []);

    return tokens.filter((t) => !TOKENS_SCAM_RECORD[t.contract]);
  } catch (e) {
    throw new Error('Error while fetching tokens');
  }
};

export const fetchTokensMetadata = async (
  tokens: TokenType[]
): Promise<StringRecord<TokenMetadata>> => {
  try {
    const promises = tokens.map((t) =>
      api<TokenMetadata>(
        `${process.env.TOKENS_METADATA_API}/metadata/${t.contract}/${t.id}`,
        { method: 'GET' },
        tokenMetadataSchema
      )
    );

    const data = (await Promise.all(promises)).map(
      (zodResponse) => zodResponse.data
    );

    const parsedData = data.reduce<StringRecord<TokenMetadata>>(
      (acc, meta, idx) => {
        acc[tokens[idx].contract] = meta;
        return acc;
      },
      {}
    );

    return parsedData;
  } catch (e) {
    throw new Error('Error while fetching tokens metadata');
  }
};
