// app/components/Icon.tsx
import React, { FC, SVGProps, useLayoutEffect, useState } from "react";

type IconProps = {
  icon: string;
  className?: string;
};

export const Icon: React.FC<IconProps> = ({ icon, className = "" }) => {
  const [SvgIcon, setSvgIcon] = useState<FC<SVGProps<SVGSVGElement>> | null>(
    null
  );

  useLayoutEffect(() => {
    // Dynamically import the icon using the svgName prop
    import(`../../icons/${icon}.svg?react`)
      .then((mod) => setSvgIcon(() => mod.default))
      .catch((err) => {
        console.error(`Failed to load icon "${icon}":`, err);
        setSvgIcon(null); // Handle missing icons gracefully
      });
  }, [icon]);

  if (!SvgIcon) return null;

  return <SvgIcon className={className} />;
};
