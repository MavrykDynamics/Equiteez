import { Link, LinkProps } from "@remix-run/react";
import { FC } from "react";

export const CustomLink: FC<LinkProps & { disabled?: boolean }> = ({
  children,
  to,
  disabled = false,
  ...props
}) => {
  if (!to || disabled) return <div {...props}>{children}</div>;

  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};
