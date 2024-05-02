import { FC } from 'react';

import clsx from 'clsx';

import DocBg from 'app/a11y/DocBg';

import { Header } from './Header';

const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className={clsx('min-h-screen mx-auto max-w-[1440px]')}>
      <DocBg bgClassName={clsx('bg-background')} />

      <div className={clsx('relative')}>
        <Header />
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
