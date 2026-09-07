import type { AssetMetadataBase, TokenMetadata } from "~/lib/metadata/types";
import { TokenStandardsEnum } from "~/lib/metadata/types";

// mavryk-bridge/app/config/bridge.ts: ETH_ERC20_1 -> MAV_WRAPPED_ERC20.
// Live metadata identifies these as Mock USDT / wUSDT (the repo labels are stale).
export const USDT_BRIDGE = {
  chainId: 11155111,
  address: "0x476a30d098eD197c2b109abaBbf5135D49df0967",
  destinationNetwork: "basenet",
  sourceToken: {
    address: "0x0111C65C13b3Ee07662340692CBA957B29572F27",
    name: "Mock USDT",
    symbol: "USDT",
    decimals: 18,
  } as const satisfies AssetMetadataBase,
  destinationToken: {
    address: "KT1J8yjtFGY6fiqjSNLpUjDnX2bj2HsUizAi",
    id: "0",
    name: "Tether USDT",
    symbol: "wUSDT",
    decimals: 6,
    standard: TokenStandardsEnum.Fa2,
  } as const satisfies TokenMetadata,
} as const;

export const USDT_BRIDGE_DESTINATION_SLUG = `${USDT_BRIDGE.destinationToken.address}_${USDT_BRIDGE.destinationToken.id}`;
