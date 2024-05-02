import { Link } from '@remix-run/react';
import { Logo } from '../Logo';

export const Header = () => {
  return (
    <div className="px-11 flex items-center justify-between h-[60px] border-b border-divider">
      <Logo />
      <HeaderLinksBlock />
    </div>
  );
};

const HeaderLinksBlock = () => {
  return (
    <header className="flex gap-x-9 items-center h-full">
      <Link to="/" className="text-body-xs text-content">
        New Listings
      </Link>
      <Link to="/" className="text-body-xs text-content">
        Marketplace
      </Link>
      <Link to="/" className="text-body-xs text-content">
        Sign Up
      </Link>
    </header>
  );
};
