import { useMemo, type MouseEvent } from "react";
import clsx from "clsx";

import { RIcon, type RIconSize } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { NEXUS_LINK } from "~/consts";
import useCopyToClipboard from "~/lib/ui/useCopyToClipboard";
import useTippy from "~/lib/ui/useTippy";

import styles from "./OperationHash.module.css";

type OperationHashProps = {
  className?: string;
  /** The copy tooltip: "Copy address" when the hash is an address */
  copyLabel?: string;
  /**
   * "medium" draws the copy glyph at 12px (Figma Wallet → Signing key) while
   * it keeps its 16px slot, so the row height and gaps stay the same
   */
  copyIconSize?: RIconSize;
  display?: "full" | "short";
  operationHash: string;
  /** False for values Nexus has no page for, such as a public key */
  withNexusLink?: boolean;
};

function getShortHash(hash: string) {
  return `${hash.slice(0, 7)}...${hash.slice(-3)}`;
}

function getNexusEntityPath(operationHash: string) {
  if (operationHash.startsWith("KT")) {
    return "contract";
  }

  if (operationHash.startsWith("mv")) {
    return "account";
  }

  return "operation";
}

export function OperationHash({
  className,
  copyLabel = "Copy hash",
  copyIconSize = "small",
  display = "short",
  operationHash,
  withNexusLink = true,
}: OperationHashProps) {
  const nexusEntityPath = getNexusEntityPath(operationHash);
  // "Copied!" for 2 seconds after a copy, then the label again
  const { copied, setCopied } = useCopyToClipboard();
  const copyTooltipRef = useTippy<HTMLDivElement>(
    useMemo(
      () => ({
        animation: "shift-away-subtle",
        content: copied ? "Copied!" : copyLabel,
        hideOnClick: false,
        placement: "top" as const,
        theme: "operation-hash",
        trigger: "mouseenter focus",
      }),
      [copied, copyLabel]
    )
  );
  const nexusTooltipRef = useTippy<HTMLAnchorElement>(
    useMemo(
      () => ({
        animation: "shift-away-subtle",
        content: "Open on Nexus",
        hideOnClick: false,
        placement: "top" as const,
        theme: "operation-hash",
        trigger: "mouseenter focus",
      }),
      []
    )
  );

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      console.error("OperationHash: the clipboard is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(operationHash);
      setCopied(true);
    } catch (error) {
      // Leave the label as it is: nothing was copied
      console.error("OperationHash: copy failed", error);
    }
  };

  const handleActionClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <span className={clsx(styles.operationHash, styles[display], className)}>
      <div
        className={styles.operationHashText}
        ref={copyTooltipRef}
        onClick={(event) => {
          handleActionClick(event);
          void handleCopy();
        }}
      >
        <RText className={styles.hashText} size="body-sm">
          {display === "short" ? getShortHash(operationHash) : operationHash}
        </RText>
        <span
          className={clsx(
            styles.action,
            copyIconSize === "medium" && styles.actionLargeIcon
          )}
        >
          <RIcon
            name="copy"
            size={copyIconSize}
            // 1px line at either size, like the 16px icons next to it
            {...(copyIconSize === "medium" ? { strokeWidth: 1 } : {})}
          />
        </span>
      </div>

      {withNexusLink && (
        <a
          aria-label={
            nexusEntityPath === "operation"
              ? "View transaction in Nexus"
              : "View in Nexus"
          }
          className={styles.actionLink}
          href={`${NEXUS_LINK}/explorer/${nexusEntityPath}/${operationHash}`}
          onClick={handleActionClick}
          ref={nexusTooltipRef}
          rel="noreferrer"
          target="_blank"
        >
          <RIcon name="arrow-long-up-right" size="small" />
        </a>
      )}
    </span>
  );
}
