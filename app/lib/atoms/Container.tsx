import clsx from 'clsx';
import { FC } from 'react';

type ContainerProps = {
  maxWidth?: number;
  className?: string;
} & PropsWithChildren;

export const Container: FC<ContainerProps> = ({
  maxWidth = 1440,
  children,
  className,
}) => {
  return (
    <div style={{ maxWidth }} className={clsx('mx-auto', className)}>
      {children}
    </div>
  );
};
