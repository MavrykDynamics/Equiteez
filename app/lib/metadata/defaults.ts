import { TokenMetadata, TokenStandardsEnum } from "./types";
import {toTokenSlug} from "~/lib/assets";
import {Asset, FA2Token} from "~/lib/assets/types";

export const MVRK_CONTRACT_ADDRESS = "mv2ZZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF2d";
export const MVRK_ASSET_SLUG = "mav";

export const MVRK_METADATA: TokenMetadata = {
  decimals: 6,
  symbol: "MVRK",
  name: "Mavryk",
  standard: TokenStandardsEnum.Mav,
  thumbnailUri: "ipfs://QmbHaFX2gyFEzdwp54vqtf7McL74BvT7r4pw6UVyfEdKhu",
  address: MVRK_CONTRACT_ADDRESS,
  id: "0",
};

export const isMavSlug = (asset: Asset | string): asset is typeof MVRK_ASSET_SLUG => asset === MVRK_ASSET_SLUG;
export const isFA2Token = (asset: Asset): asset is FA2Token =>
    isMavSlug(asset) ? false : typeof asset.id !== 'undefined';


export const MBG_CONTRACT_ADDRESS = "mbg2ZZZZZZZZZZZZZZZZZZZZZZZZZZDXMF11";
export const MBG_ASSET_SLUG = toTokenSlug(MBG_CONTRACT_ADDRESS);

export const MBG_METADATA: TokenMetadata = {
  decimals: 6,
  symbol: "MBG",
  name: "MBG",
  standard: TokenStandardsEnum.Mbg,
  thumbnailUri:
      "ipfs://bafkreiggfphjwug5y2uw2we6kfxkyvgqlvbxugnkq33dgslwqg27a6puem",
  address: MBG_CONTRACT_ADDRESS,
  id: "0",
};

// MOCKED ASSETS

export const MOCKED_ASSET_ADDRESSES = [
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ1",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ2",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ3",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ4",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ5",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ6",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ7",
  "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ8",
];

export const MOCKED_ASSET_SYMBOLS = {
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ1: "BTM",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ2: "SPH",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ3: "NTBM",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ4: "UTB",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ5: "LMB",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ6: "GLD",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ7: "QTM",
  KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ8: "KTL",
};
export const getMockedMetadata = (address: string, symbol: string) => {
  return {
    ...MVRK_METADATA,
    address,
    symbol,
  };
};
