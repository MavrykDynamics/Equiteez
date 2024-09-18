import clsx from 'clsx';
import { FC } from 'react';

export type TabType<G = string> = {
  id: G;
  label: string;
  grow?: boolean;
  disabled?: boolean;
  handleClick: (id: G) => void;
};

export type TabVariant = 'primary' | 'secondary' | 'tertiary';

type TabProps = {
  active?: boolean;
  variant?: TabVariant;
} & TabType;

const variants = {
  primary: {
    className: clsx(
      'px-4 py-[10px]  text-buttons cursor-pointer rounded-lg outline-none',
      'flex justify-center items-center min-w-[115px]'
    ),
    active: (active: boolean | undefined) =>
      active
        ? 'bg-sand-800 text-white hover:bg-sand-700'
        : 'bg-inactive-tab text-sand-700',
    disabled: 'opacity-50 pointer-events-none',
  },
  secondary: {
    className: clsx(
      'px-4 py-2  text-caption cursor-pointer rounded-lg outline-none',
      'flex justify-center items-center min-w-[115px]'
    ),
    active: (active: boolean | undefined) =>
      active
        ? 'bg-sand-800 text-white hover:bg-sand-700'
        : 'bg-inactive-tab text-sand-700',
    disabled: 'opacity-50 pointer-events-none bg-gray-50',
  },
  tertiary: {
    className: clsx('text-caption cursor-pointer'),
    active: (active: boolean | undefined) =>
      active ? 'text-dark-green-500 underline' : 'text-sand-300',
    disabled: 'opacity-50 pointer-events-none',
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
