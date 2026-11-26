import { getAddress, isAddress } from "viem";

/**
 * Static table of the twelve 1Click source networks (backend.md §7). Metadata
 * only carries a network key, so names, explorers and address formats live
 * here. Assets on a network missing from this table are hidden.
 */
export type IntentNetworkFamily =
  | "evm"
  | "solana"
  | "near"
  | "aptos"
  | "bitcoin";

export type IntentNetwork = {
  key: string;
  name: string;
  family: IntentNetworkFamily;
  /** EVM chain ID; `null` for other families. */
  evmChainId: number | null;
  /** Ticker of the network's own currency (display only). */
  nativeSymbol: string;
  /** Explorer links; `undefined` when the network has none configured. */
  explorer: {
    tx: (hash: string) => string;
    address: (address: string) => string;
  };
  /** Shown in the refund address field. */
  addressPlaceholder: string;
  /**
   * Whether a typo can still produce a valid address (no checksum). The user
   * must then confirm the pasted address explicitly.
   */
  hasChecksum: boolean;
};

const evmExplorer = (base: string) => ({
  tx: (hash: string) => `${base}/tx/${hash}`,
  address: (address: string) => `${base}/address/${address}`,
});

const evm = (
  key: string,
  name: string,
  evmChainId: number,
  nativeSymbol: string,
  explorer: string
): IntentNetwork => ({
  key,
  name,
  family: "evm",
  evmChainId,
  nativeSymbol,
  explorer: evmExplorer(explorer),
  addressPlaceholder: "0x…",
  hasChecksum: true,
});

export const INTENT_NETWORKS: readonly IntentNetwork[] = [
  evm("eth", "Ethereum", 1, "ETH", "https://etherscan.io"),
  evm("arb", "Arbitrum One", 42161, "ETH", "https://arbiscan.io"),
  evm("base", "Base", 8453, "ETH", "https://basescan.org"),
  evm("op", "OP Mainnet", 10, "ETH", "https://optimistic.etherscan.io"),
  evm("pol", "Polygon", 137, "POL", "https://polygonscan.com"),
  evm("bsc", "BNB Smart Chain", 56, "BNB", "https://bscscan.com"),
  evm("avax", "Avalanche C-Chain", 43114, "AVAX", "https://snowtrace.io"),
  evm("gnosis", "Gnosis", 100, "XDAI", "https://gnosisscan.io"),
  {
    key: "sol",
    name: "Solana",
    family: "solana",
    evmChainId: null,
    nativeSymbol: "SOL",
    explorer: {
      tx: (hash) => `https://solscan.io/tx/${hash}`,
      address: (address) => `https://solscan.io/account/${address}`,
    },
    addressPlaceholder: "Solana address",
    hasChecksum: false,
  },
  {
    key: "near",
    name: "NEAR",
    family: "near",
    evmChainId: null,
    nativeSymbol: "NEAR",
    explorer: {
      tx: (hash) => `https://nearblocks.io/txns/${hash}`,
      address: (address) => `https://nearblocks.io/address/${address}`,
    },
    addressPlaceholder: "alice.near",
    hasChecksum: false,
  },
  {
    key: "aptos",
    name: "Aptos",
    family: "aptos",
    evmChainId: null,
    nativeSymbol: "APT",
    explorer: {
      tx: (hash) =>
        `https://explorer.aptoslabs.com/txn/${hash}?network=mainnet`,
      address: (address) =>
        `https://explorer.aptoslabs.com/account/${address}?network=mainnet`,
    },
    addressPlaceholder: "0x… (64 hex characters)",
    hasChecksum: false,
  },
  {
    key: "btc",
    name: "Bitcoin",
    family: "bitcoin",
    evmChainId: null,
    nativeSymbol: "BTC",
    explorer: {
      tx: (hash) => `https://mempool.space/tx/${hash}`,
      address: (address) => `https://mempool.space/address/${address}`,
    },
    addressPlaceholder: "bc1… / 1… / 3…",
    hasChecksum: true,
  },
];

const byKey = new Map(INTENT_NETWORKS.map((network) => [network.key, network]));

export const getIntentNetwork = (key: string | null | undefined) =>
  key ? byKey.get(key) : undefined;

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Decoded byte length of a base58 string, or null when it is not base58. */
export function base58ByteLength(value: string): number | null {
  if (!value) return null;
  let number = 0n;
  for (const char of value) {
    const digit = BASE58.indexOf(char);
    if (digit < 0) return null;
    number = number * 58n + BigInt(digit);
  }
  let length = 0;
  for (let rest = number; rest > 0n; rest >>= 8n) length += 1;
  // Each leading "1" encodes a leading zero byte.
  for (const char of value) {
    if (char !== "1") break;
    length += 1;
  }
  return length;
}

const NEAR_NAMED = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
const NEAR_IMPLICIT = /^[0-9a-f]{64}$/;
const BTC_LEGACY = /^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/;
const BTC_SEGWIT = /^bc1q[02-9ac-hj-np-z]{38,58}$/;
const BTC_TAPROOT = /^bc1p[02-9ac-hj-np-z]{58}$/;

/**
 * Client-side refund address check per network (backend.md §7). The API
 * validates again and answers `400 VALIDATION_ERROR` on a bad address; this
 * only catches typos early. Returns an error message, or null.
 */
export function getRefundAddressError(
  network: IntentNetwork,
  value: string
): string | null {
  const address = value.trim();
  if (!address) return `Enter a refund address on ${network.name}.`;
  const invalid = `This is not a valid ${network.name} address.`;
  switch (network.family) {
    case "evm": {
      if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return invalid;
      if (/^0x0{40}$/i.test(address))
        return "The zero address cannot receive refunds.";
      const body = address.slice(2);
      const isMixedCase =
        body !== body.toLowerCase() && body !== body.toUpperCase();
      // A mixed-case address must carry a valid EIP-55 checksum.
      if (isMixedCase && !isAddress(address, { strict: true }))
        return "The address checksum is invalid. Check it or paste it in lowercase.";
      return null;
    }
    case "solana":
      return base58ByteLength(address) === 32 ? null : invalid;
    case "near":
      return address.length >= 2 &&
        address.length <= 64 &&
        (NEAR_IMPLICIT.test(address) || NEAR_NAMED.test(address))
        ? null
        : address !== address.toLowerCase()
          ? "NEAR account IDs are lowercase."
          : invalid;
    case "aptos":
      return /^0x[0-9a-fA-F]{64}$/.test(address)
        ? null
        : "Use the full Aptos address: 0x followed by 64 hex characters.";
    case "bitcoin": {
      if (BTC_LEGACY.test(address)) return null;
      const lower = address.toLowerCase();
      if (address !== lower && address !== address.toUpperCase())
        return "Bitcoin addresses must not mix upper and lower case.";
      return BTC_SEGWIT.test(lower) || BTC_TAPROOT.test(lower)
        ? null
        : "Use a Bitcoin mainnet address starting with 1, 3, bc1q or bc1p.";
    }
    default:
      return invalid;
  }
}

/**
 * Canonical form sent to the API: EVM addresses lower-cased (the backend
 * returns them that way), Bitcoin bech32 lower-cased, others as typed.
 */
export function normalizeRefundAddress(network: IntentNetwork, value: string) {
  const address = value.trim();
  if (network.family === "evm") return address.toLowerCase();
  if (network.family === "bitcoin" && /^bc1/i.test(address))
    return address.toLowerCase();
  return address;
}

/** Same address on this network, ignoring case where the network does. */
export function isSameNetworkAddress(
  network: Pick<IntentNetwork, "family">,
  a: string,
  b: string
) {
  if (network.family === "evm") {
    try {
      return getAddress(a) === getAddress(b);
    } catch {
      return a.toLowerCase() === b.toLowerCase();
    }
  }
  if (network.family === "bitcoin" && /^bc1/i.test(a))
    return a.toLowerCase() === b.toLowerCase();
  return a === b;
}
