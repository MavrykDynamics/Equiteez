import clsx from "clsx";
import type { ReactNode } from "react";

import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "../RDepositFundsModal.module.css";

type WarningNoticeProps = {
  children: ReactNode;
  className?: string;
  icon: ReactNode;
};

export function WarningNotice({
  children,
  className,
  icon,
}: WarningNoticeProps) {
  return (
    <div className={clsx(styles.notice, styles.warning, className)}>
      <div className="flex items-start justify-center mt-1">{icon}</div>
      <RText color="neutral-700" size="body-sm">
        {children}
      </RText>
    </div>
  );
}
