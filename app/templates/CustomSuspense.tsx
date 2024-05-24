import { FC, PropsWithChildren } from 'react';
import { Spinner } from '~/atoms/Spinner';

export const CustomSuspense: FC<PropsWithChildren & { loading: boolean }> = ({
  children,
  loading,
}) => {
  return loading ? <Spinner /> : children;
};
