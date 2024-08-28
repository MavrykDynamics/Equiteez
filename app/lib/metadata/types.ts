export enum TokenStandardsEnum {
  Fa2 = 'fa2',
  Fa12 = 'fa12',
  Mav = 'mav',
  Fa1dot2 = 'fa1.2',
}

export interface AssetMetadataBase {
  name: string;
  symbol: string;
  decimals: number;
  thumbnailUri?: string;
  address?: string;
}

export interface TokenMetadata extends AssetMetadataBase {
  address: string;
  id: string;
  standard?: TokenStandardsEnum;
  displayUri?: string;
  artifactUri?: string;
}
