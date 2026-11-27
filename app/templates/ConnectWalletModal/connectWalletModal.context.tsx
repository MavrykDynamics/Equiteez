/**
 * Opens the sign-in modal from anywhere (header button, trade panels).
 * Without email wallets it connects Mavryk Wallet directly, as before the
 * modal existed.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import { ConnectWalletModal, type SignInProgress } from "./ConnectWalletModal";
import { describeError } from "~/services/direct/guardedInjector";

type OpenConnectWallet = () => void;

const connectWalletModalContext = createContext<OpenConnectWallet | null>(null);
// The sign-in modal is open: the user is going through the sign-in
const isSigningInContext = createContext(false);
// The modal is creating or restoring the account (null otherwise)
const signInProgressContext = createContext<SignInProgress | null>(null);

export function ConnectWalletModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { dynamic } = useWalletContext();
  const { connect } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<SignInProgress | null>(null);

  const openConnectWallet = useCallback<OpenConnectWallet>(() => {
    if (!dynamic) {
      // Opening the extension popup must not wait for the caller
      void Promise.resolve()
        .then(connect)
        .catch((error: unknown) =>
          // Name and message only: an error may carry request details
          console.error("Failed to connect wallet:", describeError(error))
        );
      return;
    }

    setIsOpen(true);
  }, [connect, dynamic]);

  // Back from "Continue with Google": the modal finishes the sign-in
  useEffect(() => {
    if (dynamic?.hasPendingGoogleSignIn()) setIsOpen(true);
  }, [dynamic]);

  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => openConnectWallet, [openConnectWallet]);

  return (
    <connectWalletModalContext.Provider value={value}>
      <isSigningInContext.Provider value={isOpen}>
        <signInProgressContext.Provider value={isOpen ? progress : null}>
          {children}
          {dynamic && (
            <ConnectWalletModal
              isOpen={isOpen}
              onClose={close}
              onProgressChange={setProgress}
            />
          )}
        </signInProgressContext.Provider>
      </isSigningInContext.Provider>
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

/** True while the sign-in modal is open (email, code, password and so on) */
export function useIsSigningIn(): boolean {
  return useContext(isSigningInContext);
}

/** "creating" or "restoring" while the modal sets the account up */
export function useSignInProgress(): SignInProgress | null {
  return useContext(signInProgressContext);
}
