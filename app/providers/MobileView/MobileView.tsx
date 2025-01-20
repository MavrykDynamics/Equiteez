import { FC } from "react";

import styles from "./mobileView.module.css";
import DocBg from "~/a11y/DocBg";

import LogoIcon from "app/icons/logo.svg?react";

export const MobileView: FC<PropsWithChildren> = ({ children }) => {
  const isMobile = true;
  return isMobile ? (
    <div className={styles.wrapper}>
      <DocBg bgClassName="bg-dark-green-500" />
      <div className="flex items-center gap-[10px] mb-[26px]">
        <LogoIcon className="text-sand-50 stroke-current" />
        <span className="text-sand-50 text-[26px] font-bold leading-6">
          EQUITEEZ
        </span>
      </div>

      <div className="flex flex-col gap-4 text-sand-50 text-base items-center">
        <p>
          Mobile and tablet version of our website is not available at this
          time.
        </p>
        <p>Please, open on a desktop screen or laptop.</p>
      </div>
    </div>
  ) : (
    children
  );
};
