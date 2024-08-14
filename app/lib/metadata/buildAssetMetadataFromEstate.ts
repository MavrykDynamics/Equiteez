import { EstateType } from '~/providers/EstatesProvider/estates.types';
import { AssetMetadataBase } from '../types/metadata';

export function buildAssetMetadataFromEstate(
  estate: EstateType | null | undefined
) {
  if (!estate) return null;
  const fakeEstateMeta: AssetMetadataBase = {
    thumbnailUri: estate?.icon,
    decimals: estate?.decimals,
    name: estate?.name,
    symbol: estate?.symbol,
  };

  return fakeEstateMeta;
}
