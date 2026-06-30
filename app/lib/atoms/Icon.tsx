import { FC, SVGProps, useEffect, useState } from "react";

type IconProps = {
  icon: string;
  className?: string;
};

type IconModule = {
  default: FC<SVGProps<SVGSVGElement>>;
};

const iconModules = import.meta.glob<IconModule>(
  "../../icons/**/*.svg?react"
);

const MissingIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.5"
    />
    <path
      d="M8 12h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const getIconModuleKey = (icon: string) => `../../icons/${icon}.svg?react`;

export const Icon: FC<IconProps> = ({ icon, className = "" }) => {
  const [SvgIcon, setSvgIcon] = useState<FC<SVGProps<SVGSVGElement>> | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    if (!icon) {
      setSvgIcon(null);
      return;
    }

    const loadIcon = iconModules[getIconModuleKey(icon)];

    if (!loadIcon) {
      setSvgIcon(() => MissingIcon);
      return;
    }

    setSvgIcon(null);

    loadIcon()
      .then((mod) => {
        if (isMounted) {
          setSvgIcon(() => mod.default);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSvgIcon(() => MissingIcon);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [icon]);

  if (!SvgIcon) return null;

  return <SvgIcon className={className} />;
};
