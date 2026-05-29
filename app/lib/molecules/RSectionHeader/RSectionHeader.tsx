import clsx from "clsx";

import styles from "./RSectionHeader.module.css";

export type RSectionHeaderAlign = "center" | "left";
export type RSectionHeaderTone = "dark" | "light";

export type RSectionHeaderProps = {
  align?: RSectionHeaderAlign;
  eyebrow?: string;
  className?: string;
  description?: string;
  heading: string | string[];
  tone?: RSectionHeaderTone;
};

export function RSectionHeader({
  align = "left",
  className,
  description,
  eyebrow,
  heading,
  tone = "dark",
}: RSectionHeaderProps) {
  const headingLines = Array.isArray(heading) ? heading : [heading];

  return (
    <div
      className={clsx(
        styles.header,
        styles[align],
        styles[tone],
        className
      )}
    >
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2 className={styles.heading}>
        {headingLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
