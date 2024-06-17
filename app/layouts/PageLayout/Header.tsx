import { Link } from '@remix-run/react';
import { Logo } from '../Logo';
import { ConnectWallet } from './ConnectWallet';
import { Button } from '~/lib/atoms/Button';
import { getWalkScoreData } from '~/lib/api/walk-score';

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
  const handleClick = async () => {
    const data = await getWalkScoreData();
    console.log(data, 'data');
  };

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
      <Button onClick={handleClick}>Test</Button>

      <ConnectWallet />
    </header>
  );
};
