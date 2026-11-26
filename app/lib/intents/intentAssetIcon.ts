import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import EthereumLogo from "~/icons/ethereum-logo.svg";

/**
 * Logos available in the app for 1Click source networks and tokens. Metadata
 * carries no icon URLs, only a `coingeckoId` hint; anything not listed here
 * renders the lettered `RTokenIcon` fallback.
 */
const networkIcons: Partial<Record<string, string>> = {
  eth: EthereumLogo,
};

const coingeckoIcons: Partial<Record<string, string>> = {
  ethereum: EthereumLogo,
  weth: EthereumLogo,
  tether: UsdtToken,
  usdt0: UsdtToken,
};

const symbolIcons: Partial<Record<string, string>> = {
  ETH: EthereumLogo,
  WETH: EthereumLogo,
  USDT: UsdtToken,
};

// Wrapped/bridged variants (USDT0, wUSDT) share the base logo.
const normalizeSymbol = (symbol: string) => {
  const upper = symbol.trim().toUpperCase();
  return upper.includes("USDT") ? "USDT" : upper;
};

export const getIntentNetworkIcon = (network: string | undefined) =>
  network ? networkIcons[network] : undefined;

export const getIntentTokenIcon = (
  symbol: string | undefined,
  coingeckoId?: string | null
) =>
  (coingeckoId ? coingeckoIcons[coingeckoId] : undefined) ??
  (symbol ? symbolIcons[normalizeSymbol(symbol)] : undefined);
