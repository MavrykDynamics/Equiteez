import LogoIcon from 'app/icons/logo.svg?react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-x-[10px] w-auto">
      <LogoIcon />
      <span className="text-green-main text-[26px] font-semibold leading-6">
        EQUITEEZ
      </span>
    </div>
  );
};
