import { TokenMetadata, TokenStandardsEnum } from './types';

export const MVRK_CONTRACT_ADDRESS = 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg';
export const MVRK_ASSET_SLUG = 'mav';

export const MVRK_METADATA: TokenMetadata = {
  decimals: 6,
  symbol: 'MVRK',
  name: 'Mavryk',
  standard: TokenStandardsEnum.Mav,
  thumbnailUri: 'ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu',
  address: MVRK_CONTRACT_ADDRESS,
  id: '0',
};
