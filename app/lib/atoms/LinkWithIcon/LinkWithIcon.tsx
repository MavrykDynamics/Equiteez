import clsx from 'clsx';
import { FC, useMemo } from 'react';
import ArrowRight from 'app/icons/arrow-right.svg?react';
import { Link, LinkProps } from '@remix-run/react';

type LinkWithIconProps = {
  disabled?: boolean;
  CustomIcon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  iconPosition?: 'start' | 'end';
  variant?: Variant;
  iconClassName?: string;
} & LinkProps &
  React.RefAttributes<HTMLAnchorElement>;

type Variant = 'green' | 'content';

const variants = {
  green: 'text-green-main hover:text-green-secondary',
  content: 'text-content hover:opacity-50',
};

export const LinkWithIcon: FC<LinkWithIconProps> = ({
  to,
  children,
  className,
  disabled,
  CustomIcon,
  iconClassName,
  iconPosition = 'end',
  variant = 'green',
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
        'text-buttons',
        variants[variant],
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
