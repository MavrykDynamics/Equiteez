import memoizee from 'memoizee';
import { fetchTzktAccountAssets } from '../apis/tzkt';
import { TzktAccountAsset } from '../apis/tzkt/types';
import { toTokenSlug } from '.';
import { fetchGasTokenBalance } from '../apis/tzkt/api';

export const loadAccountTokens = (account: string, chainId: string) =>
  Promise.all([
    // Fetching assets known to be FTs, not checking metadata
    fetchTzktAccountAssets(account, chainId, true).then((data) =>
      finishTokensLoading(data)
    ),
    // Fetching unknowns only, checking metadata to filter for FTs
    fetchTzktAccountUnknownAssets(account, chainId).then((data) =>
      finishTokensLoading(data)
    ),
    fetchGasTokenBalance(account, chainId).then((data) => data),
  ]).then(
    ([data1, data2, data3]) => {
      return mergeLoadedAssetsData(data1, data2, data3);
    },
    (error) => {
      console.error(error);
      throw error;
    }
  );

const fetchTzktAccountUnknownAssets = memoizee(
  // Simply reducing frequency of requests per set of arguments.
  (account: string, chainId: string) =>
    fetchTzktAccountAssets(account, chainId, null),
  {
    maxAge: 10_000,
    normalizer: ([account, chainId]) => `${account}_${chainId}`,
    promise: true,
  }
);

const finishTokensLoading = async (data: TzktAccountAsset[]) => {
  const slugs: string[] = [];
  const balances: StringRecord = {};
  const newMeta: FetchedMetadataRecord = {};

  for (const asset of data) {
    const slug = tzktAssetToTokenSlug(asset);

    slugs.push(slug);
    balances[slug] = asset.balance;
  }

  return { slugs, balances, newMeta };
};

export interface TokenMetadataResponse {
  decimals: number;
  symbol?: string;
  name?: string;
  thumbnailUri?: string;
  artifactUri?: string;
  displayUri?: string;
  image?: string;
}

export type FetchedMetadataRecord = Record<
  string,
  TokenMetadataResponse | null
>;

interface LoadedAssetsData {
  slugs: string[];
  balances: StringRecord;
  newMeta?: FetchedMetadataRecord;
}

const mergeLoadedAssetsData = (
  data1: LoadedAssetsData,
  data2: LoadedAssetsData,
  data3: number
) => ({
  slugs: data1.slugs.concat([...data2.slugs, 'mav']),
  balances: { ...data1.balances, ...data2.balances, mav: data3.toString() },
  newMeta: { ...data1.newMeta, ...data2.newMeta },
});

export const tzktAssetToTokenSlug = ({ token }: TzktAccountAsset) =>
  toTokenSlug(token.contract.address, token.tokenId);
