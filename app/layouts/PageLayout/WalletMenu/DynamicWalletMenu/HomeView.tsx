import { useState } from "react";
import { Link } from "@remix-run/react";

import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RSkeleton } from "~/lib/atoms/RSkeleton";
import { RTooltip } from "~/lib/atoms/RTooltip";
import { RText } from "~/lib/atoms/RTypography/RText";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { AssetIcon } from "~/templates/AssetIcon";

import type { WalletPanelView } from "./DynamicWalletPanel";
import { AddressActions, AssetBadge, hasPrice, NETWORK_LABEL } from "./parts";
import {
  useWalletPanelAssets,
  type WalletPanelAsset,
} from "./useWalletPanelAssets";
import styles from "./DynamicWalletPanel.module.css";

/** The wallet settings page, added later */
const WALLET_SETTINGS_PATH = "/portfolio/wallet";
const SKELETON_ROWS = 3;

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

type HomeViewProps = {
  address: string;
  onClose: () => void;
  onNavigate: (view: WalletPanelView) => void;
  onSignOut: () => void;
};

export function HomeView({
  address,
  onClose,
  onNavigate,
  onSignOut,
}: HomeViewProps) {
  const { portfolio, wallet, isPortfolioLoading, portfolioUpdatedAt } =
    usePortfolioContext();
  const { assets, isLoading } = useWalletPanelAssets();
  const [isValueHidden, setIsValueHidden] = useState(false);
  const totalValue = portfolio?.total_value ?? wallet?.account_value ?? 0;
  const home: WalletPanelView = { name: "home" };

  return (
    <div className={styles.view}>
      <div className={styles.statusRow}>
        <span className={styles.status}>
          <span aria-hidden="true" className={styles.statusDot} />
          <RText size="body-s">Signing key active</RText>
          <RTooltip
            content="This wallet is registered as your signing key. Anything you confirm on Equiteez is signed with it."
            maxWidth={248}
          >
            <span className={styles.statusInfo}>
              <RIcon
                aria-label="About the signing key"
                name="info-circle"
                size="small"
              />
            </span>
          </RTooltip>
        </span>
        <RText color="neutral-700" size="body-s">
          {NETWORK_LABEL}
        </RText>
      </div>

      <div className={styles.portfolioCard}>
        <div>
          <RText color="neutral-700" size="body-s">
            Portfolio value
          </RText>
          <div className={styles.portfolioValueRow}>
            {isPortfolioLoading ? (
              <RSkeleton className={styles.portfolioValueSkeleton} />
            ) : (
              <span className={styles.portfolioValue}>
                {isValueHidden ? (
                  "$••••••"
                ) : (
                  <>
                    $
                    <Money fiat tooltip={false}>
                      {totalValue}
                    </Money>
                  </>
                )}
              </span>
            )}
            <button
              aria-label={
                isValueHidden ? "Show portfolio value" : "Hide portfolio value"
              }
              aria-pressed={isValueHidden}
              className={styles.iconButton}
              onClick={() => setIsValueHidden((isHidden) => !isHidden)}
              type="button"
            >
              <RIcon
                className={styles.mutedIcon}
                name={isValueHidden ? "eye-off" : "eye"}
                size="medium"
              />
            </button>
          </div>
        </div>
        <div className={styles.addressRow}>
          <RText className={styles.fullAddress} size="body-s">
            {address}
          </RText>
          <AddressActions address={address} />
        </div>
      </div>

      <div className={styles.actions}>
        <RButton
          className={styles.actionButton}
          iconLeft={<RIcon aria-hidden="true" name="arrow-long-down" />}
          onClick={() => onNavigate({ name: "deposit", back: home })}
          size="medium"
          tone="black"
        >
          Deposit
        </RButton>
        <RButton
          className={styles.actionButton}
          iconLeft={<RIcon aria-hidden="true" name="arrow-long-up" />}
          onClick={() => onNavigate({ name: "withdraw", back: home })}
          size="medium"
          tone="black"
          variant="secondary"
        >
          Withdraw
        </RButton>
      </div>

      <section aria-label="Assets" className={styles.assets}>
        <div className={styles.assetsHeader}>
          <RText size="body-m" weight="medium">
            Assets
          </RText>
          {portfolioUpdatedAt ? (
            <RText color="neutral-700" size="body-s">
              Updated {formatTime(portfolioUpdatedAt)}
            </RText>
          ) : null}
        </div>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <div className={styles.assetRow} key={index}>
              <RSkeleton className={styles.assetIcon} radius="pill" />
              <RSkeleton className={styles.assetRowSkeleton} />
            </div>
          ))
        ) : assets.length ? (
          <ul className={styles.assetList}>
            {assets.map((asset) => (
              <li key={asset.tokenSlug}>
                <AssetRow
                  asset={asset}
                  onOpen={() =>
                    onNavigate({ name: "asset", tokenSlug: asset.tokenSlug })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <RText className={styles.empty} color="neutral-700" size="body-sm">
            No assets yet. Deposit to get started.
          </RText>
        )}
      </section>

      <div className={styles.footer}>
        <Link
          className={styles.footerLink}
          onClick={onClose}
          to={WALLET_SETTINGS_PATH}
        >
          <RIcon aria-hidden="true" name="settings" size="small" />
          Wallet settings
        </Link>
        <button className={styles.footerLink} onClick={onSignOut} type="button">
          <RIcon aria-hidden="true" name="sign-out" size="small" />
          Sign out of wallet
        </button>
      </div>
    </div>
  );
}

function AssetRow({
  asset,
  onOpen,
}: {
  asset: WalletPanelAsset;
  onOpen: () => void;
}) {
  const { metadata } = asset;

  return (
    <button className={styles.assetRow} onClick={onOpen} type="button">
      <AssetIcon
        assetSlug={asset.iconSlug}
        className={styles.assetIcon}
        size={32}
      />
      <span className={styles.assetMain}>
        <span className={styles.assetTitle}>
          <RText size="body-sm" weight="medium">
            {metadata.symbol}
          </RText>
          <AssetBadge kind={asset.kind} />
        </span>
        <RText color="neutral-700" size="body-s">
          {metadata.name}
        </RText>
      </span>
      <span className={styles.assetAmounts}>
        <RText size="body-sm" weight="medium">
          <Money tooltip={false}>{asset.balance}</Money>
        </RText>
        <RText color="neutral-700" size="body-s">
          {hasPrice(asset) && asset.valueUsd ? (
            <>
              $
              <Money fiat tooltip={false}>
                {asset.valueUsd}
              </Money>
            </>
          ) : (
            "No price"
          )}
        </RText>
      </span>
    </button>
  );
}
