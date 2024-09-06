import { FC, createContext, useEffect, useState, useContext } from 'react';
import { dappClient } from './WalletCore.client';
import { TezosToolkit } from '@mavrykdynamics/taquito';

type WalletContext = {
  dapp: ReturnType<typeof dappClient> | null;
  tezos: TezosToolkit;
  isLoading: boolean;
};

export const walletContext = createContext<WalletContext>(undefined!);

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletContext>({
    dapp: null,
    isLoading: true,
    // TODO fix types and use null
    tezos: {} as TezosToolkit,
  });

  useEffect(() => {
    const dapp = dappClient();
    const tezos = dapp.tezos();
    setWalletState({ dapp, isLoading: false, tezos });
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
