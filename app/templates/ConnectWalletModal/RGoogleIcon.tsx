/**
 * Google "G" for "Continue With Google" (Figma 8410:47794). The design
 * exports it as the coloured artwork clipped by a mask; both are drawn as
 * exported, in the same 24px slot.
 */
import googleIconUrl from "app/icons/RGoogleIcon.svg?url";
import googleIconMaskUrl from "app/icons/RGoogleIconMask.svg?url";

import styles from "./RGoogleIcon.module.css";

export function RGoogleIcon() {
  return (
    <span aria-hidden className={styles.icon}>
      <span
        className={styles.clip}
        style={{ maskImage: `url("${googleIconMaskUrl}")` }}
      >
        <img alt="" className={styles.artwork} src={googleIconUrl} />
      </span>
    </span>
  );
}
