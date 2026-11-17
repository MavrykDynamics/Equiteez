/** Small pieces shared by the wallet panel's home and asset views. */
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import useTippy from "~/lib/ui/useTippy";
import { NEXUS_LINK } from "~/consts/links.const";

import type {
  WalletPanelAsset,
  WalletPanelAssetKind,
} from "./useWalletPanelAssets";
import styles from "./DynamicWalletPanel.module.css";

/** The network the app signs on (RPC_NODE_CHAIN_IDS: Basenet only) */
export const NETWORK_LABEL = "Mavryk Basenet";

export const getNexusUrl = (address: string) =>
  `${NEXUS_LINK}/explorer/${address.startsWith("KT") ? "contract" : "account"}/${address}`;

const tooltip = (content: string) => ({
  animation: "shift-away-subtle",
  content,
  hideOnClick: false,
  placement: "top" as const,
  theme: "operation-hash",
  trigger: "mouseenter focus",
});

type AddressWithActionsProps = {
  address: string;
  /** The address as shown: full or shortened */
  children: ReactNode;
  className?: string;
};

/**
 * The wallet address on the home card: copy and "open in Nexus" behave like
 * the TX HASH cell of the transaction history (OperationHash, used as is on
 * the asset sheet), with the card's black icons from Figma.
 */
export function AddressWithActions({
  address,
  children,
  className,
}: AddressWithActionsProps) {
  const copyTooltipRef = useTippy<HTMLButtonElement>(
    useMemo(() => tooltip("Copy address"), [])
  );
  const nexusTooltipRef = useTippy<HTMLAnchorElement>(
    useMemo(() => tooltip("Open on Nexus"), [])
  );

  return (
    <span className={clsx(styles.address, className)}>
      <button
        aria-label="Copy address"
        className={styles.addressCopy}
        onClick={() => void navigator.clipboard?.writeText(address)}
        ref={copyTooltipRef}
        type="button"
      >
        {children}
        <RIcon aria-hidden="true" name="copy" size="small" />
      </button>
      <a
        aria-label="View in Nexus"
        className={styles.addressLink}
        href={getNexusUrl(address)}
        ref={nexusTooltipRef}
        rel="noreferrer"
        target="_blank"
      >
        <RIcon aria-hidden="true" name="arrow-long-up-right" size="small" />
      </a>
    </span>
  );
}

const BADGES: Partial<Record<WalletPanelAssetKind, string>> = {
  eqtz: "EQTZ asset",
  stablecoin: "MRC-30",
};

export function AssetBadge({ kind }: { kind: WalletPanelAssetKind }) {
  const label = BADGES[kind];

  return label ? (
    <span className={styles.badge} data-kind={kind}>
      {label}
    </span>
  ) : null;
}

/** A zero or missing price means no price source, not a worthless asset */
export const hasPrice = (asset: WalletPanelAsset) =>
  Boolean(asset.priceUsd?.gt(0) || asset.valueUsd?.gt(0));

/** What a hidden amount shows instead of the number */
export const HIDDEN_VALUE = "****";

const hiddenValuesKey = (address: string) =>
  `equiteez:wallet-panel:hide-values:${address}`;

const readHiddenValues = (address: string) => {
  try {
    return localStorage.getItem(hiddenValuesKey(address)) === "true";
  } catch {
    return false;
  }
};

/** "Hide values" per wallet address, remembered in localStorage */
export function useHiddenValues(address: string) {
  const [isHidden, setIsHidden] = useState(() => readHiddenValues(address));

  // Another wallet while the panel is mounted: read that wallet's choice
  useEffect(() => setIsHidden(readHiddenValues(address)), [address]);

  const toggle = useCallback(() => {
    setIsHidden((wasHidden) => {
      const nextHidden = !wasHidden;
      try {
        localStorage.setItem(hiddenValuesKey(address), String(nextHidden));
      } catch {
        // Storage blocked: the choice lasts until the panel closes
      }
      return nextHidden;
    });
  }, [address]);

  return [isHidden, toggle] as const;
}
