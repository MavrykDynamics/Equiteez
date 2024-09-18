import { api } from 'app/lib/utils/api';
import { TokenType } from '../tokens.provider.types';
import { TOKENS_SCAM_RECORD } from './consts';
import { TokenMetadata } from '~/lib/metadata';

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
        { method: 'GET' }
        // tokenMetadataSchema
      )
    );

    const data = (await Promise.all(promises)).map(
      (zodResponse) => zodResponse.data
    );

    const parsedData = data.reduce<StringRecord<TokenMetadata>>(
      (acc, meta, idx) => {
        acc[tokens[idx].contract.concat(`_${tokens[idx].id}`)] = meta;
        return acc;
      },
      {}
    );

    return parsedData;
  } catch (e) {
    console.log(e);
    throw new Error('Error while fetching tokens metadata');
  }
};
