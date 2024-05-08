import clsx from 'clsx';
import { FC } from 'react';

export type TabType = {
  id: string;
  label: string;
  disabled?: boolean;
  handleClick: (id: string) => void;
};

type TabProps = {
  active?: boolean;
} & TabType;

export const Tab: FC<TabProps> = ({
  active,
  disabled,
  label,
  id,
  handleClick,
}) => {
  const handleInternalClick = () => handleClick(id);

  return (
    <button
      onClick={handleInternalClick}
      className={clsx(
        'px-4 py-3 text-content text-buttons cursor-pointer rounded-lg outline-none',
        'flex justify-center items-center min-w-[115px]',
        active ? 'bg-tabs' : 'bg-inactive-tab',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {label}
    </button>
  );
};
