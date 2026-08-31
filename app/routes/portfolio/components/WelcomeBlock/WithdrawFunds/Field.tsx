import type { ReactNode } from "react";

import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./WithdrawFundsModal.module.css";

type FieldProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

export function Field({ children, className, label }: FieldProps) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")}>
      <RText size="body-sm">{label}</RText>
      {children}
    </label>
  );
}
