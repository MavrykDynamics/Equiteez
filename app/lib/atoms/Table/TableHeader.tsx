import { FC } from 'react';

export const TableHeader: FC<PropsWithChildren & { mb?: number }> = ({
  mb = 6,
  children,
}) => {
  return (
    <h3 className={`mb-${mb} text-content text-card-headline`}>{children}</h3>
  );
};
