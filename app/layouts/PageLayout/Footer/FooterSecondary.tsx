import { FC, useMemo } from "react";
import { SOCIALS } from "~/consts/icons";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

type FooterSecondaryProps = {
  theme?: "dark" | "light";
};

export const FooterSecondary: FC<FooterSecondaryProps> = ({
  theme = "dark",
}) => {
  const year = useMemo(() => new Date().getFullYear(), []);

  const color = useMemo(
    () => (theme === "dark" ? "sand-900" : "white"),
    [theme]
  );

  return (
    <section className="w-full bg-transparent py-4 px-11 flex items-center justify-between">
      <div className={`text-${color} text-sm font-semibold`}>
        © {year} Mavryk Dynamics. All Rights Reserved
      </div>

      <div className="flex items-center gap-6">
        {SOCIALS.map(({ id, url, Icon }) => (
          <CustomLink key={id} to={url}>
            <div className="flex justify-center items-center">
              <Icon className={`fill-${color}`} />
            </div>
          </CustomLink>
        ))}
      </div>
    </section>
  );
};
