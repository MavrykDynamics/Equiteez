/**
 * Six-cell verification code field. One real input sits over the cells, so
 * typing, deleting, pasting and the browser's one-time-code autofill work as
 * in a plain input; the cells only show its digits.
 */
import clsx from "clsx";
import { useState } from "react";

import styles from "./ConnectWalletModal.module.css";

export const CODE_LENGTH = 6;

type CodeInputProps = {
  value: string;
  invalid?: boolean;
  onChange: (code: string) => void;
};

export function CodeInput({ value, invalid, onChange }: CodeInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  // The cell the next digit goes to; the last one once the code is full
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <div className={styles.codeField}>
      <input
        aria-invalid={invalid}
        aria-label="Verification code"
        autoComplete="one-time-code"
        className={styles.codeInput}
        inputMode="numeric"
        onBlur={() => setIsFocused(false)}
        onChange={(event) =>
          // Pasted codes may carry spaces or dashes: keep the digits only
          onChange(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
        }
        onFocus={() => setIsFocused(true)}
        pattern="[0-9]*"
        type="text"
        value={value}
      />
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <span
          aria-hidden
          className={clsx(
            styles.codeCell,
            invalid
              ? styles.codeCellError
              : isFocused && index === activeIndex && styles.codeCellActive
          )}
          key={index}
        >
          {value[index] ?? ""}
        </span>
      ))}
    </div>
  );
}
