import { Link, LinkProps } from "@remix-run/react";
import { FC, useMemo } from "react";

export const isExternalURL = (url: LinkProps["to"]) => {
  if (!url) return false;

  try {
    // Use window.location.origin as the base
    const fullURL = new URL(url as string, window.location.origin);
    return fullURL.origin !== window.location.origin;
  } catch (e) {
    console.error("Invalid URL:", e);
    return false;
  }
};

export const CustomLink: FC<LinkProps & { disabled?: boolean }> = ({
  children,
  to,
  disabled = false,
  ...props
}) => {
  const linkProps: Omit<LinkProps, "to"> = useMemo(
    () => ({
      ...props,
      ...(isExternalURL(to)
        ? {
            target: "_blank",
            referrerPolicy: "no-referrer",
            rel: "no-referrer",
          }
        : {}),
    }),
    [props, to]
  );

  if (!to || disabled) return <span {...props}>{children}</span>;

  return (
    <Link to={to} {...linkProps}>
      {children}
    </Link>
  );
};
