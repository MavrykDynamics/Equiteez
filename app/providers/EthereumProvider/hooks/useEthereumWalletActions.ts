import { useCallback, useEffect, useRef, useState } from "react";
import {
  useConnect,
  useDisconnect,
  useSwitchChain,
  type Connector,
} from "wagmi";

import { ETHEREUM_CHAIN } from "../ethereum.config";
import { getEthereumErrorMessage } from "../helpers/ethereumErrors";

type WalletAction =
  | { type: "connect"; connector: Connector }
  | { type: "switchNetwork" }
  | { type: "disconnect" };

export function useEthereumWalletActions(
  isConnected: boolean,
  activeConnector: Connector | undefined,
  chainId: number | undefined
) {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isActionPending = useRef(false);

  useEffect(() => {
    setError(null);
  }, [isConnected, activeConnector?.uid, chainId]);

  const handleWalletAction = useCallback(
    async (request: WalletAction) => {
      if (isActionPending.current) return;

      isActionPending.current = true;
      setIsConnecting(true);
      setError(null);
      let action = request.type;

      try {
        if (request.type === "disconnect") {
          await disconnectAsync();
        } else if (request.type === "switchNetwork") {
          if (!isConnected) throw new Error("Ethereum wallet is disconnected.");
          await switchChainAsync({ chainId: ETHEREUM_CHAIN.id });
        } else {
          const { connector } = request;

          if (!isConnected || activeConnector?.uid !== connector.uid) {
            if (isConnected) await disconnectAsync();
            // Retain the connected account if the subsequent switch is declined.
            await connectAsync({ connector });
          }

          action = "switchNetwork";
          if ((await connector.getChainId()) !== ETHEREUM_CHAIN.id) {
            await switchChainAsync({ connector, chainId: ETHEREUM_CHAIN.id });
          }
        }

        setIsWalletModalOpen(false);
      } catch (error) {
        setError(getEthereumErrorMessage(error, action));
      } finally {
        isActionPending.current = false;
        setIsConnecting(false);
      }
    },
    [
      activeConnector?.uid,
      connectAsync,
      disconnectAsync,
      isConnected,
      switchChainAsync,
    ]
  );

  const connect = useCallback(() => {
    setError(null);
    setIsWalletModalOpen(true);
  }, []);
  const handleClose = useCallback(() => setIsWalletModalOpen(false), []);
  const handleConnectWallet = useCallback(
    (connector: Connector) =>
      handleWalletAction({ type: "connect", connector }),
    [handleWalletAction]
  );
  const signOut = useCallback(
    () => handleWalletAction({ type: "disconnect" }),
    [handleWalletAction]
  );
  const switchNetwork = useCallback(
    () => handleWalletAction({ type: "switchNetwork" }),
    [handleWalletAction]
  );

  return {
    connect,
    signOut,
    switchNetwork,
    handleConnectWallet,
    handleClose,
    isWalletModalOpen,
    isConnecting,
    error,
  };
}
