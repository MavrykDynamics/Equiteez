import { Link } from '@remix-run/react';
import LogoIcon from 'app/icons/logo.svg?react';

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-x-[10px] w-auto">
      <LogoIcon className=" text-dark-green-500 stroke-current" />
      <span className="text-green-main text-[26px] font-semibold leading-6">
        EQUITEEZ
      </span>
    </Link>
  );
};
