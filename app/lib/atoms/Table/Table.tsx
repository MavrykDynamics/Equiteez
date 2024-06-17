import { FC } from 'react';

export const Table: FC<PropsWithChildren> = ({ children }) => {
  return (
    <section className="px-7 py-8 flex flex-col rounded-3xl shadow-card">
      {children}
    </section>
  );
};
