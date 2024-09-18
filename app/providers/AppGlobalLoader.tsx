import { FC } from 'react';
import { useWalletContext } from './WalletProvider/wallet.provider';
import { Spinner } from '~/lib/atoms/Spinner/Spinner';

export const AppGlobalLoader: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useWalletContext();

  if (isLoading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-mvrk-dark">
        <Spinner size={56} />
      </div>
    );

  return <div>{children}</div>;
};
