import type { ReactNode } from "react";

import { HashShortView } from "~/lib/atoms/HashShortView";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { AssetIcon } from "~/templates/AssetIcon";

import { PanelHeader, type WalletPanelView } from "./DynamicWalletPanel";
import { AddressActions, AssetBadge, hasPrice, NETWORK_LABEL } from "./parts";
import { useWalletPanelAssets } from "./useWalletPanelAssets";
import styles from "./DynamicWalletPanel.module.css";

type AssetViewProps = {
  address: string;
  tokenSlug: string;
  onBack: () => void;
  onClose: () => void;
  onNavigate: (view: WalletPanelView) => void;
};

export function AssetView({
  address,
  tokenSlug,
  onBack,
  onClose,
  onNavigate,
}: AssetViewProps) {
  const { assets } = useWalletPanelAssets();
  const asset = assets.find((item) => item.tokenSlug === tokenSlug);
  const back: WalletPanelView = { name: "asset", tokenSlug };

  if (!asset) {
    // The portfolio refetched without it (sent away, say): back to the list
    return (
      <div className={styles.view}>
        <PanelHeader onBack={onBack} onClose={onClose} title="Asset" />
        <RText className={styles.empty} color="neutral-700" size="body-sm">
          This asset is no longer in your wallet.
        </RText>
      </div>
    );
  }

  const { metadata } = asset;
  const isNative = asset.kind === "native";

  return (
    <div className={styles.view}>
      <PanelHeader onBack={onBack} onClose={onClose} title="Asset" />

      <div className={styles.assetHero}>
        <AssetIcon
          assetSlug={asset.iconSlug}
          className={styles.assetHeroIcon}
          size={48}
        />
        <div>
          <span className={styles.assetTitle}>
            <RText size="body-l" weight="medium">
              {metadata.symbol}
            </RText>
            <AssetBadge kind={asset.kind} />
          </span>
          <RText color="neutral-700" size="body-s">
            {metadata.name}
          </RText>
        </div>
      </div>

      <div className={styles.balance}>
        <RText color="neutral-700" size="body-s">
          Balance
        </RText>
        <span className={styles.balanceValue}>
          <Money tooltip={false}>{asset.balance}</Money> {metadata.symbol}
        </span>
        <RText color="neutral-700" size="body-s">
          {hasPrice(asset) && asset.priceUsd ? (
            <>
              $
              <Money fiat tooltip={false}>
                {asset.priceUsd}
              </Money>{" "}
              per token
            </>
          ) : (
            "No price source yet"
          )}
        </RText>
      </div>

      {isNative ? (
        <div className={styles.infoMessage}>
          <RIcon aria-hidden="true" name="info-circle" size="small" />
          <RText size="body-sm">
            Every transaction pays its network fee in MVRK. Keep some here so
            you can trade and send.
          </RText>
        </div>
      ) : null}

      <dl className={styles.details}>
        {isNative ? (
          <>
            <Detail label="Type">Native, no contract</Detail>
            <Detail label="Decimals">
              {metadata.decimals} (smallest unit: mumav)
            </Detail>
            <Detail label="Network">{NETWORK_LABEL}</Detail>
            <Detail label="Held At">
              <HashShortView hash={address} />
              <AddressActions address={address} />
            </Detail>
          </>
        ) : (
          <>
            <Detail label="Asset Contract">
              <HashShortView hash={metadata.address} />
              <AddressActions address={metadata.address} />
            </Detail>
            <Detail label="Standard">
              {metadata.standard?.toUpperCase() ?? "—"}
            </Detail>
            <Detail label="Token ID">{metadata.id}</Detail>
            <Detail label="Decimals">{metadata.decimals}</Detail>
            <Detail label="Network">{NETWORK_LABEL}</Detail>
          </>
        )}
      </dl>

      <div className={styles.sheetActions}>
        <RButton
          className={styles.actionButton}
          iconLeft={<RIcon aria-hidden="true" name="arrow-long-down" />}
          onClick={() => onNavigate({ name: "deposit", back })}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Receive
        </RButton>
        <RButton
          className={styles.actionButton}
          iconLeft={<RIcon aria-hidden="true" name="arrow-long-up" />}
          onClick={() => onNavigate({ name: "withdraw", back, tokenSlug })}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Send
        </RButton>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.detail}>
      <dt>
        <RText color="neutral-700" size="body-sm">
          {label}
        </RText>
      </dt>
      <dd>
        <RText className={styles.detailValue} size="body-sm">
          {children}
        </RText>
      </dd>
    </div>
  );
}
