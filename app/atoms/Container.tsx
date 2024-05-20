import { FC } from 'react';

const style = {
  width: '100vw',
  margin: '0 auto',
};

export const Container: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div style={style} className={className}>
      <div className="max-w-[1440px] mx-auto">{children}</div>
    </div>
  );
};
