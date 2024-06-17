import { Link } from '@remix-run/react';
import { Logo } from '../Logo';
import { ConnectWallet } from './ConnectWallet';

export const Header = () => {
  return (
    <section className="flex justify-center border-b border-divider w-full bg-background">
      <div className="px-11 flex items-center justify-between h-[60px] w-container bg-background">
        <Logo />
        <HeaderLinksBlock />
      </div>
    </section>
  );
};

const HeaderLinksBlock = () => {

  return (
    <header className="flex gap-x-9 items-center h-full">
      <Link to="/" className="text-body-xs text-content">
        New Listings
      </Link>
      <Link to="/properties" className="text-body-xs text-content">
        Marketplace
      </Link>
      <Link to="/exchange" className="text-body-xs text-content">
        Exchange
      </Link>

      <ConnectWallet />
    </header>
  );
};
