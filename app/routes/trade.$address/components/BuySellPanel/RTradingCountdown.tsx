import { Fragment, useEffect, useState, type ReactNode } from "react";

import styles from "./RTradingCountdown.module.css";

type RTradingCountdownProps = {
  /** Untrusted ISO timestamps from the selected /launch API card. */
  saleStart?: unknown;
  saleEnd?: unknown;
  children?: ReactNode;
};

export function RTradingOverlay({ children }: { children: ReactNode }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function RTradingCountdown({
  saleStart,
  saleEnd,
  children,
}: RTradingCountdownProps) {
  const startsAt = typeof saleStart === "string" ? Date.parse(saleStart) : NaN;
  const endsAt = typeof saleEnd === "string" ? Date.parse(saleEnd) : NaN;
  const isValidWindow =
    Number.isFinite(startsAt) && Number.isFinite(endsAt) && endsAt > startsAt;
  // Keep the server and first client render identical.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!isValidWindow) return;

    setNow(Date.now());
    if (startsAt <= Date.now()) return;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= startsAt) window.clearInterval(interval);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startsAt, isValidWindow]);

  if (!isValidWindow || now === null || now >= startsAt || now >= endsAt)
    return null;

  const seconds = Math.ceil((startsAt - now) / 1000);
  const units = [
    { label: "days", value: Math.floor(seconds / 86400) },
    { label: "hours", value: Math.floor((seconds % 86400) / 3600) },
    { label: "minutes", value: Math.floor((seconds % 3600) / 60) },
    { label: "seconds", value: seconds % 60 },
  ];

  return (
    <RTradingOverlay>
      <p className={styles.heading}>Token Sale Starts Soon</p>
      <div
        aria-label={`Trading starts in ${units.map(({ label, value }) => `${value} ${label}`).join(", ")}`}
        className={styles.timer}
        role="timer"
      >
        {units.map(({ label, value }, index) => (
          <Fragment key={label}>
            {index > 0 && (
              <span aria-hidden="true" className={styles.separator}>
                :
              </span>
            )}
            <div aria-hidden="true" className={styles.unit}>
              <span className={styles.value}>
                {String(value).padStart(2, "0")}
              </span>
              <span className={styles.label}>{label}</span>
            </div>
          </Fragment>
        ))}
      </div>
      {children}
    </RTradingOverlay>
  );
}
