import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WagmiProvider, useAccount, useConnectors } from "wagmi";

import { REthereumWalletModal } from "~/lib/organisms/REthereumWalletModal/REthereumWalletModal";

import { createEthereumConfig, ETHEREUM_CHAIN } from "./ethereum.config";
import type { EthereumContext } from "./ethereum.provider.types";
import { useEthereumDepositAsset } from "./hooks/useEthereumDepositAsset";
import { useEthereumWalletActions } from "./hooks/useEthereumWalletActions";

export const ethereumContext = createContext<EthereumContext | undefined>(
  undefined
);

export function EthereumProvider({ children }: { children: ReactNode }) {
  const [config] = useState(createEthereumConfig);

  return (
    <WagmiProvider config={config}>
      <EthereumStateProvider>{children}</EthereumStateProvider>
    </WagmiProvider>
  );
}

function EthereumStateProvider({ children }: { children: ReactNode }) {
  const {
    address,
    chainId,
    connector: activeConnector,
    isConnected,
    isReconnecting,
  } = useAccount();
  const connectors = useConnectors();
  const {
    connect,
    signOut,
    switchNetwork,
    handleConnectWallet,
    handleClose,
    isWalletModalOpen,
    isConnecting,
    error,
  } = useEthereumWalletActions(isConnected, activeConnector, chainId);
  const isWrongNetwork = isConnected && chainId !== ETHEREUM_CHAIN.id;
  const depositAsset = useEthereumDepositAsset(
    address,
    isConnected,
    isWrongNetwork
  );

  const value = useMemo<EthereumContext>(
    () => ({
      userAddress: isConnected ? (address ?? null) : null,
      chainId: chainId ?? null,
      isConnected,
      isConnecting,
      isReconnecting,
      isWrongNetwork,
      error,
      ...depositAsset,
      connect,
      signOut,
      switchNetwork,
    }),
    [
      address,
      chainId,
      connect,
      depositAsset,
      error,
      isConnected,
      isConnecting,
      isReconnecting,
      isWrongNetwork,
      signOut,
      switchNetwork,
    ]
  );

  return (
    <ethereumContext.Provider value={value}>
      {children}
      <REthereumWalletModal
        connectors={connectors}
        error={error}
        isBusy={isConnecting || isReconnecting}
        isOpen={isWalletModalOpen}
        onClose={handleClose}
        onConnect={handleConnectWallet}
        onDisconnect={signOut}
        userAddress={value.userAddress}
      />
    </ethereumContext.Provider>
  );
}

export function useEthereumContext() {
  const context = useContext(ethereumContext);
  if (!context)
    throw new Error("ethereumContext should be used within EthereumProvider");
  return context;
}
