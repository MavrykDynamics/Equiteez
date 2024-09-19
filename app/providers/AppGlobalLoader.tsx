import { FC } from 'react';
import { useWalletContext } from './WalletProvider/wallet.provider';
import { Spinner } from '~/lib/atoms/Spinner/Spinner';
import { useTokensContext } from './TokensProvider/tokens.provider';

export const AppGlobalLoader: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useWalletContext();
  const { isLoading: isTokensMetaLoading } = useTokensContext();

  if (isLoading || isTokensMetaLoading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-mvrk-dark">
        <Spinner size={56} />
      </div>
    );

  return <div>{children}</div>;
};
