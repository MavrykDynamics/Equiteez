import type BigNumber from "bignumber.js";
import type { Address } from "viem";

import type { AssetMetadataBase } from "~/lib/metadata";

export type EthereumBalanceStatus =
  | "disconnected"
  | "wrongNetwork"
  | "loading"
  | "error"
  | "ready";

export type EthereumContext = {
  userAddress: Address | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  error: string | null;
  tokenMetadata: AssetMetadataBase;
  tokenBalance: BigNumber | undefined;
  balanceStatus: EthereumBalanceStatus;
  connect: () => void;
  signOut: () => Promise<void>;
  switchNetwork: () => Promise<void>;
  refreshBalance: () => Promise<void>;
};
