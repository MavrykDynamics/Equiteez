import { useMemo, type MouseEvent } from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { NEXUS_LINK } from "~/consts";
import useTippy from "~/lib/ui/useTippy";

import styles from "./OperationHash.module.css";

type OperationHashProps = {
  className?: string;
  display?: "full" | "short";
  operationHash: string;
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
  display = "short",
  operationHash,
}: OperationHashProps) {
  const nexusEntityPath = getNexusEntityPath(operationHash);
  const copyTooltipRef = useTippy<HTMLDivElement>(
    useMemo(
      () => ({
        animation: "shift-away-subtle",
        content: "Copy hash",
        hideOnClick: false,
        placement: "top" as const,
        theme: "operation-hash",
        trigger: "mouseenter focus",
      }),
      []
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

  const handleCopy = () => {
    void navigator.clipboard?.writeText(operationHash);
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
          handleCopy();
        }}
      >
        <RText className={styles.hashText} size="body-sm">
          {display === "short" ? getShortHash(operationHash) : operationHash}
        </RText>
        <span className={styles.action}>
          <RIcon name="copy" size="small" />
        </span>
      </div>

      <a
        aria-label="View transaction in Nexus"
        className={styles.actionLink}
        href={`${NEXUS_LINK}/explorer/${nexusEntityPath}/${operationHash}`}
        onClick={handleActionClick}
        ref={nexusTooltipRef}
        rel="noreferrer"
        target="_blank"
      >
        <RIcon name="arrow-long-up-right" size="small" />
      </a>
    </span>
  );
}
