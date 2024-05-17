import { FC, createContext, useEffect, useState, useContext } from 'react';
import { dappClient } from './WalletCore';

type WalletContext = {
  dapp: ReturnType<typeof dappClient> | null;
};

export const walletContext = createContext<WalletContext>(undefined!);

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletContext>({
    dapp: null,
  });

  useEffect(() => {
    const dapp = dappClient();
    setWalletState({ dapp });
  }, []);

  return (
    <walletContext.Provider value={walletState}>
      {children}
    </walletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(walletContext);

  if (!context) {
    throw new Error('walletContext should be used within WalletProvider');
  }

  return context;
};
