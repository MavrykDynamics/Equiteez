import type { BigNumber } from "bignumber.js";
import type { Address } from "viem";
import type { Connector } from "wagmi";

import type { AssetMetadataBase } from "~/lib/metadata";
import type { useUsdtBridge } from "./hooks/useUsdtBridge";

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
  bridge: ReturnType<typeof useUsdtBridge>;
  walletSelection: {
    connectors: readonly Connector[];
    isOpen: boolean;
    onClose: () => void;
    onConnect: (connector: Connector) => Promise<void>;
  };
};
