import { FC } from 'react';

export const TableHeader: FC<PropsWithChildren> = ({ children }) => {
  return <h3 className="mb-6 text-content text-card-headline">{children}</h3>;
};
