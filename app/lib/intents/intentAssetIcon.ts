import { mainnet, sepolia } from "wagmi/chains";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import EthereumLogo from "~/icons/ethereum-logo.svg";

/**
 * Logos available in the app for 1Click source networks and tokens. The
 * intents metadata carries no icon URLs; anything not listed here renders the
 * lettered `RTokenIcon` fallback.
 */
const chainIcons: Partial<Record<number, string>> = {
  [mainnet.id]: EthereumLogo,
  [sepolia.id]: EthereumLogo,
};

const tokenIcons: Partial<Record<string, string>> = {
  ETH: EthereumLogo,
  WETH: EthereumLogo,
  USDT: UsdtToken,
};

// Testnet and wrapped variants (Mock USDT, wUSDT) share the base logo.
const normalizeSymbol = (symbol: string) => {
  const upper = symbol.trim().toUpperCase();
  return upper.includes("USDT") ? "USDT" : upper;
};

export const getIntentChainIcon = (chainId: number | string) =>
  chainIcons[Number(chainId)];

export const getIntentTokenIcon = (symbol: string | undefined) =>
  symbol ? tokenIcons[normalizeSymbol(symbol)] : undefined;
