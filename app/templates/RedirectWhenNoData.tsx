import { Navigate } from '@remix-run/react';
import { FC } from 'react';

type RedirectWhenNoDataProps = {
  data: unknown;
  to: string;
} & PropsWithChildren;

export const RedirectWhenNoData: FC<RedirectWhenNoDataProps> = ({
  data,
  to,
  children,
}) => {
  if (!data) return <Navigate to={to} replace />;

  return children;
};
