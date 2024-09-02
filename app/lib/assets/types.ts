import type { MAV_TOKEN_SLUG } from './index';

export interface AccountAsset {
  slug: string;
  status: string; // StoredAssetStatus
}

interface Token {
  contract: string;
  id?: string;
}

export interface FA2Token extends Token {
  id: string;
}

export type Asset = Token | typeof MAV_TOKEN_SLUG;

export type TokenStandardType = 'fa1.2' | 'fa2' | 'mav' | 'fa12';

export enum AssetTypesEnum {
  Collectibles = 'collectibles',
  Tokens = 'tokens',
  Rwas = 'rwas',
}
