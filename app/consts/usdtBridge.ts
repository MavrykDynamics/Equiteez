import type { AssetMetadataBase, TokenMetadata } from "~/lib/metadata/types";
import { TokenStandardsEnum } from "~/lib/metadata/types";

// mavryk-bridge/app/config/bridge.ts: ETH_ERC20_1 -> MAV_WRAPPED_ERC20.
// Redeployed Mock USDT / wUSDT pair from the bridge configuration.
export const USDT_BRIDGE = {
  approvalConfirmations: 1,
  lockConfirmations: 3,
  chainId: 11155111,
  address: "0x476a30d098eD197c2b109abaBbf5135D49df0967",
  destinationNetwork: "basenet",
  sourceToken: {
    address: "0xADA0b668C6598559c5C816A8b633EfE714c5b5F3",
    name: "Mock USDT",
    symbol: "USDT",
    decimals: 18,
  } as const satisfies AssetMetadataBase,
  destinationToken: {
    address: "KT1Pn5Zpx1bJx5H51btk92pfwvUMCKtp2Q2v",
    id: "0",
    name: "Tether USDT",
    symbol: "wUSDT",
    decimals: 6,
    standard: TokenStandardsEnum.Fa2,
  } as const satisfies TokenMetadata,
} as const;

export const USDT_BRIDGE_DESTINATION_SLUG = `${USDT_BRIDGE.destinationToken.address}_${USDT_BRIDGE.destinationToken.id}`;
