import { FC } from 'react';

import clsx from 'clsx';

import DocBg from 'app/a11y/DocBg';

// layout components
import { Header } from './Header';
import { Footer } from './Footer';

type PageLayoutProps = {
  bg?: string;
} & PropsWithChildren;

const PageLayout: FC<PageLayoutProps> = ({
  children,
  bg = 'bg-background',
}) => {
  return (
    <div className={clsx('min-h-screen')}>
      <DocBg bgClassName={clsx(bg)} />

      <div className={clsx('relative')}>
        <Header />
        <div className="mx-auto max-w-[1440px]">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default PageLayout;
