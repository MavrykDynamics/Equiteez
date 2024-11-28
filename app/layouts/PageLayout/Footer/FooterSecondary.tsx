import { FC, useMemo } from "react";
import { Link } from "@remix-run/react";
import { SECONDARY_SOCIALS } from "~/consts/icons";

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
      <div className={`text-${color} text-sm`}>
        © {year} Mavryk Dynamics. All Rights Reserved
      </div>

      <div className="flex items-center gap-6">
        {SECONDARY_SOCIALS.map(({ id, url, Icon }) => (
          <Link key={id} to={url}>
            <div className="size-6 flex justify-center items-center">
              <Icon className={`fill-${color}`} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
