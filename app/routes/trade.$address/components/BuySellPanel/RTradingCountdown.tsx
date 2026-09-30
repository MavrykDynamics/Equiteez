import { Fragment, useEffect, useState } from "react";

import styles from "./RTradingCountdown.module.css";

type RTradingCountdownProps = {
  /** Trading start as a Unix timestamp in milliseconds. */
  startsAt: number;
};

export function RTradingCountdown({ startsAt }: RTradingCountdownProps) {
  // Keep the server and first client render identical.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(startsAt)) return;

    setNow(Date.now());
    if (startsAt <= Date.now()) return;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= startsAt) window.clearInterval(interval);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startsAt]);

  if (!Number.isFinite(startsAt)) {
    throw new Error("Trading countdown requires a finite start timestamp.");
  }

  if (now === null || now >= startsAt) return null;

  const seconds = Math.ceil((startsAt - now) / 1000);
  const units = [
    { label: "days", value: Math.floor(seconds / 86400) },
    { label: "hours", value: Math.floor((seconds % 86400) / 3600) },
    { label: "minutes", value: Math.floor((seconds % 3600) / 60) },
    { label: "seconds", value: seconds % 60 },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
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
      </div>
    </div>
  );
}
