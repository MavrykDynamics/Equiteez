/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, PropsWithChildren } from 'react';
import { Spinner } from '~/lib/atoms/Spinner';

export const CustomSuspense: FC<PropsWithChildren & { loading: boolean }> = ({
  children,
  loading,
}) => {
  return loading ? <Spinner /> : children;
};

export const LoadableComponent: FC<{
  loading: boolean;
  Component: any;
  componentProps: any;
}> = ({ Component, loading, componentProps }) => {
  return loading ? <Spinner /> : <Component {...componentProps} />;
};
