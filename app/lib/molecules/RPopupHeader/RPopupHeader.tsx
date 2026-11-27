/**
 * Popup header from the Figma "Popup design rules" (8604:1412).
 *
 * A — no `icon`: back slot · title · close in one 28px bar, the description
 *     12px under it. For task, form and confirm popups.
 * B — with `icon`: a 24px bar with close (and an optional back), the 48px
 *     icon circle right under it, the title 24px lower and the description
 *     12px under the title. For status and success popups.
 *
 * The popup itself owns the 32 / 44px outer padding and the 24px between
 * the header and the first section.
 */
import clsx from "clsx";
import type { ReactNode } from "react";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPopupHeader.module.css";

export type RPopupHeaderIconTone = "neutral" | "muted" | "yellow" | "green";

export type RPopupHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  /** Back and close are off while something runs */
  isDisabled?: boolean;
  /** Turns the header into type B */
  icon?: RIconName;
  iconTone?: RPopupHeaderIconTone;
  isIconSpinning?: boolean;
  className?: string;
};

const ICON_TONE_CLASS: Record<RPopupHeaderIconTone, string | undefined> = {
  neutral: undefined,
  muted: styles.iconMuted,
  yellow: styles.iconYellow,
  green: styles.iconGreen,
};

export function RPopupHeader({
  title,
  description,
  onClose,
  onBack,
  isDisabled = false,
  icon,
  iconTone = "neutral",
  isIconSpinning = false,
  className,
}: RPopupHeaderProps) {
  const backSlot = onBack ? (
    <button
      aria-label="Back"
      className={styles.iconButton}
      disabled={isDisabled}
      onClick={onBack}
      type="button"
    >
      <RIcon name="arrow-long-left" size="medium" />
    </button>
  ) : (
    <span aria-hidden="true" className={styles.emptySlot} />
  );

  const closeButton = (
    <button
      aria-label="Close"
      className={styles.iconButton}
      disabled={isDisabled}
      onClick={onClose}
      type="button"
    >
      <RIcon name="close" size="medium" />
    </button>
  );

  const heading = (
    <RHeading className={styles.title} size="h6" weight="medium">
      {title}
    </RHeading>
  );

  const descriptionText = description ? (
    <RText className={styles.description} color="neutral-700" size="body-sm">
      {description}
    </RText>
  ) : null;

  if (icon) {
    return (
      <header className={clsx(styles.header, styles.headerB, className)}>
        <div className={styles.navBar}>
          {backSlot}
          {closeButton}
        </div>
        <div className={styles.iconBlock}>
          <span className={clsx(styles.iconCircle, ICON_TONE_CLASS[iconTone])}>
            <RIcon
              aria-hidden
              isSpinning={isIconSpinning}
              name={icon}
              size="medium"
            />
          </span>
          <div className={styles.text}>
            {heading}
            {descriptionText}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={clsx(styles.header, styles.text, className)}>
      <div className={styles.titleBar}>
        {backSlot}
        {heading}
        {closeButton}
      </div>
      {descriptionText}
    </header>
  );
}
