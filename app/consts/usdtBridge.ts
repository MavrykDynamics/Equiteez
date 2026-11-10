import { parseGwei } from "viem";
import type { AssetMetadataBase, TokenMetadata } from "~/lib/metadata/types";
import { TokenStandardsEnum } from "~/lib/metadata/types";

// Bridge Basenet/ArbSep deployment: Mock USDT (Arbitrum Sepolia) -> wUSDT (Basenet).
export const USDT_BRIDGE = {
  approvalConfirmations: 1,
  lockConfirmations: 3,
  chainId: 421614,
  chainName: "Arbitrum Sepolia",
  // Arbitrum Sepolia's base fee sits at ~0.02 gwei; a tighter max fee can be
  // rejected when the base fee ticks up between estimation and inclusion.
  minMaxFeePerGas: parseGwei("0.025"),
  address: "0x856c1E8aaFD4FA4586b8B299941f79a593de40a6",
  destinationNetwork: "basenet",
  sourceToken: {
    address: "0x5C05e82bE66B19476bAcb558E62e7d449b98635F",
    name: "Mock USDT",
    symbol: "USDT",
    decimals: 18,
  } as const satisfies AssetMetadataBase,
  destinationToken: {
    address: "KT1Wewg18Z8D3kjYqJqXZL1fqSGqjWe5MABE",
    id: "0",
    name: "Tether USDT",
    symbol: "wUSDT",
    decimals: 6,
    standard: TokenStandardsEnum.Fa2,
  } as const satisfies TokenMetadata,
} as const;

export const USDT_BRIDGE_DESTINATION_SLUG = `${USDT_BRIDGE.destinationToken.address}_${USDT_BRIDGE.destinationToken.id}`;

// The Basenet launchpad still quotes primary sales in the previous bridge's wUSDT.
// Keep it separate from the bridge destination until the launchpad is migrated.
export const PRIMARY_PURCHASE_QUOTE_TOKEN = {
  ...USDT_BRIDGE.destinationToken,
  address: "KT1Pn5Zpx1bJx5H51btk92pfwvUMCKtp2Q2v",
} as const satisfies TokenMetadata;

export const PRIMARY_PURCHASE_QUOTE_TOKEN_SLUG = `${PRIMARY_PURCHASE_QUOTE_TOKEN.address}_${PRIMARY_PURCHASE_QUOTE_TOKEN.id}`;
