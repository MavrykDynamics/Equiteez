/** Small pieces shared by the wallet panel's home and asset views. */
import { useCallback, useEffect, useState } from "react";

import { CopyButton } from "~/lib/atoms/CopyButton";
import { RIcon } from "~/lib/atoms/RIcon";
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

/** Copy and "open in Nexus" for an address or contract */
export function AddressActions({ address }: { address: string }) {
  return (
    <span className={styles.addressActions}>
      <CopyButton
        aria-label="Copy address"
        className={styles.addressAction}
        text={address}
        type="link"
      >
        <RIcon aria-hidden="true" name="copy" size="small" />
      </CopyButton>
      <a
        aria-label="View in Nexus"
        className={styles.addressAction}
        href={getNexusUrl(address)}
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
