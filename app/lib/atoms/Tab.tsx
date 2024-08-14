import clsx from 'clsx';
import { FC } from 'react';

export type TabType<G = string> = {
  id: G;
  label: string;
  grow?: boolean;
  disabled?: boolean;
  handleClick: (id: string) => void;
};

export type TabVariant = 'primary' | 'secondary';

type TabProps = {
  active?: boolean;
  variant?: TabVariant;
} & TabType;

const variants = {
  primary: {
    className: clsx(
      'px-4 py-3 text-content text-buttons cursor-pointer rounded-lg outline-none',
      'flex justify-center items-center min-w-[115px]'
    ),
    active: (active: boolean | undefined) =>
      active ? 'bg-tabs' : 'bg-inactive-tab',
    disabled: 'opacity-50 pointer-events-none',
  },
  secondary: {
    className: clsx(
      'px-4 py-2 text-content text-caption cursor-pointer rounded-lg outline-none',
      'flex justify-center items-center min-w-[132px]'
    ),
    active: (active: boolean | undefined) =>
      active ? 'bg-white' : 'bg-transparent',
    disabled: 'opacity-50 pointer-events-none bg-gray-50',
  },
};

export const Tab: FC<TabProps> = ({
  active,
  disabled,
  label,
  grow,
  id,
  handleClick,
  variant = 'primary',
}) => {
  const handleInternalClick = () => handleClick(id);

  return (
    <button
      onClick={handleInternalClick}
      className={clsx(
        variants[variant].className,
        variants[variant].active(active),
        grow && 'flex-1',
        disabled && variants[variant].disabled
      )}
    >
      {label}
    </button>
  );
};
