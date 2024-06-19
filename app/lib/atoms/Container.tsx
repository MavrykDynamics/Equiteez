import { FC } from 'react';

type ContainerProps = {
  maxWidth?: number;
} & PropsWithChildren;

export const Container: FC<ContainerProps> = ({
  maxWidth = 1440,
  children,
}) => {
  return (
    <div style={{ maxWidth }} className="mx-auto">
      {children}
    </div>
  );
};
