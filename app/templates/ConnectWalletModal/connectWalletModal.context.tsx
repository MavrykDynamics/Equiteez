/**
 * Opens the sign-in modal from anywhere (header button, trade panels).
 * Without email wallets it connects Mavryk Wallet directly, as before the
 * modal existed.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import { ConnectWalletModal } from "./ConnectWalletModal";

type OpenConnectWallet = () => void;

const connectWalletModalContext = createContext<OpenConnectWallet | null>(null);

export function ConnectWalletModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { dynamic } = useWalletContext();
  const { connect } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);

  const openConnectWallet = useCallback<OpenConnectWallet>(() => {
    if (!dynamic) {
      // Opening the extension popup must not wait for the caller
      void Promise.resolve()
        .then(connect)
        .catch(() => console.error("Failed to connect wallet."));
      return;
    }

    setIsOpen(true);
  }, [connect, dynamic]);

  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => openConnectWallet, [openConnectWallet]);

  return (
    <connectWalletModalContext.Provider value={value}>
      {children}
      {dynamic && <ConnectWalletModal isOpen={isOpen} onClose={close} />}
    </connectWalletModalContext.Provider>
  );
}

export function useConnectWallet(): OpenConnectWallet {
  const openConnectWallet = useContext(connectWalletModalContext);

  if (!openConnectWallet) {
    throw new Error(
      "useConnectWallet should be used within ConnectWalletModalProvider"
    );
  }

  return openConnectWallet;
}
