import clsx from 'clsx';
import { FC, useMemo } from 'react';
import ArrowRight from 'app/icons/arrow-right.svg?react';
import { Link, LinkProps } from '@remix-run/react';

type LinkWithIconProps = {
  disabled?: boolean;
  CustomIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  iconPosition?: 'start' | 'end';
  iconClassName?: string;
} & LinkProps &
  React.RefAttributes<HTMLAnchorElement>;

export const LinkWithIcon: FC<LinkWithIconProps> = ({
  to,
  children,
  className,
  disabled,
  CustomIcon,
  iconClassName,
  iconPosition = 'end',
  ...rest
}) => {
  const Icon = useMemo(
    () => (CustomIcon ? CustomIcon : ArrowRight),
    [CustomIcon]
  );
  return (
    <Link
      to={to}
      className={clsx(
        'transition ease-in-out duration-200',
        'text-buttons text-green-main',
        'hover:text-green-secondary',
        'flex items-center',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...rest}
    >
      {iconPosition === 'start' && (
        <Icon className={clsx('w-6 h-6 stroke-current mr-2', iconClassName)} />
      )}
      {children}
      {iconPosition === 'end' && (
        <Icon className={clsx('w-6 h-6 stroke-current ml-1', iconClassName)} />
      )}
    </Link>
  );
};
