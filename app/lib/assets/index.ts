import BigNumber from 'bignumber.js';
import { Asset } from './types';

export const toTokenSlug = (contract: string, id: BigNumber.Value = 0) => {
  return `${contract}_${new BigNumber(id).toFixed()}`;
};

export const fromAssetSlug = (slug: string) =>
  slug.split('_') as [contract: string, tokenId?: string];

export const MAV_TOKEN_SLUG = 'mav' as const;
export const TEMPLE_TOKEN_SLUG = 'KT1VaEsVNiBoA56eToEK6n6BcPgh1tdx9eXi_0';
export const TZBTC_TOKEN_SLUG = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn_0';

// RWAS
export const OCEAN_TOKEN_ADDRESS = 'KT1J1p1f1owAEjJigKGXhwzu3tVCvRPVgGCh';
export const MARS_TOKEN_ADDRESS = 'KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ9';

export const OCEAN_TOKEN_SLUG = toTokenSlug(OCEAN_TOKEN_ADDRESS, 0);
export const MARS_TOKEN_SLUG = toTokenSlug(MARS_TOKEN_ADDRESS, 0);

export const isMavAsset = (
  asset: Asset | string
): asset is typeof MAV_TOKEN_SLUG => asset === MAV_TOKEN_SLUG;

export const isTzbtcAsset = (
  asset: Asset | string
): asset is typeof TZBTC_TOKEN_SLUG => asset === TZBTC_TOKEN_SLUG;
