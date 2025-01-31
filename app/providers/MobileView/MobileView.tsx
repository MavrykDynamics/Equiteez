import { FC } from "react";

import styles from "./mobileView.module.css";
import DocBg from "~/a11y/DocBg";

// assets
import BgImg from "app/assets/mobile/bg.webp";

import LogoIcon from "app/icons/logo.svg?react";
import { SOCIALS } from "~/consts/icons";

export const MobileView: FC<PropsWithChildren & { isMobile?: boolean }> = ({
  isMobile = false,
  children,
}) => {
  return isMobile ? (
    <div className={styles.wrapper}>
      <DocBg bgClassName="bg-dark-green-900" />
      <div className={styles.content}>
        <div className="flex items-center gap-[10px] mb-[26px]">
          <LogoIcon className="text-sand-50 stroke-current" />
          <span className="text-sand-50 text-[26px] font-bold leading-6">
            EQUITEEZ
          </span>
        </div>

        <div className="flex flex-col gap-4 text-sand-50 text-base items-center max-w-[285px]">
          <p>
            Mobile and tablet version of our website is not available at this
            time.
          </p>
          <p>Please, open on a desktop screen or laptop.</p>
        </div>
        <div className="flex items-center gap-[21px] mt-11">
          {SOCIALS.map(({ id, url, Icon }) => (
            <a
              key={id}
              href={url}
              referrerPolicy="no-referrer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex justify-center items-center">
                <Icon className={`fill-white`} />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.bg}>
        <img src={BgImg} loading="lazy" draggable={false} alt="white town bg" />
      </div>
    </div>
  ) : (
    children
  );
};
