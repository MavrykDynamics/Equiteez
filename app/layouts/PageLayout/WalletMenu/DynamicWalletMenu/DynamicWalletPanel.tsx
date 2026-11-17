/**
 * The email wallet panel under the header wallet button (Figma "Header +
 * wallet panel"): the wallet home, an asset sheet, Deposit (the address and
 * QR of the deposit modal's Receive tab) and Withdraw (the shared
 * WithdrawFlow), navigated inside the panel.
 */
import { useState } from "react";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { ReceiveView } from "~/routes/_index/components/DepositFunds/components/ReceiveView";
import { WithdrawFlow } from "~/routes/portfolio/components/WelcomeBlock/WithdrawFunds/WithdrawFlow";

import { AssetView } from "./AssetView";
import { HomeView } from "./HomeView";
import { useHiddenValues } from "./parts";
import styles from "./DynamicWalletPanel.module.css";

export type WalletPanelView =
  | { name: "home" }
  | { name: "asset"; tokenSlug: string }
  | { name: "deposit"; back: WalletPanelView }
  | { name: "withdraw"; back: WalletPanelView; tokenSlug?: string };

const HOME: WalletPanelView = { name: "home" };

type DynamicWalletPanelProps = {
  address: string;
  onClose: () => void;
  onSignOut: () => void;
};

export function DynamicWalletPanel({
  address,
  onClose,
  onSignOut,
}: DynamicWalletPanelProps) {
  const [view, setView] = useState<WalletPanelView>(HOME);
  const [isValueHidden, toggleValueHidden] = useHiddenValues(address);

  return (
    <div aria-label="Wallet" className={styles.panel} role="dialog">
      {/* Mounted only while the panel is open: no portfolio fetches on
          every page for a closed panel */}
      <PortfolioProvider>
        {view.name === "home" ? (
          <HomeView
            address={address}
            isValueHidden={isValueHidden}
            onNavigate={setView}
            onClose={onClose}
            onSignOut={onSignOut}
            onToggleValueHidden={toggleValueHidden}
          />
        ) : view.name === "asset" ? (
          <AssetView
            address={address}
            isValueHidden={isValueHidden}
            onBack={() => setView(HOME)}
            onClose={onClose}
            onNavigate={setView}
            tokenSlug={view.tokenSlug}
          />
        ) : view.name === "deposit" ? (
          <div className={styles.view}>
            <PanelHeader
              onBack={() => setView(view.back)}
              onClose={onClose}
              title="Deposit"
            />
            <div className={styles.depositBody}>
              <ReceiveView
                description="Send USDT from another Mavryk Wallet straight to this address. This is for assets already on Mavryk."
                isTabPanel={false}
                mavrykAddress={address}
              />
            </div>
          </div>
        ) : (
          <div className={styles.view}>
            <PanelHeader
              onBack={() => setView(view.back)}
              onClose={onClose}
              title="Withdraw"
            />
            <WithdrawFlow
              header={
                <RText color="neutral-700" size="body-sm">
                  Transfer funds from one Mavryk Wallet to another
                </RText>
              }
              initialAssetSlug={view.tokenSlug}
              layout="panel"
              onClose={onClose}
            />
          </div>
        )}
      </PortfolioProvider>
    </div>
  );
}

export function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.viewHeader}>
      <button
        aria-label="Back to wallet"
        className={styles.iconButton}
        onClick={onBack}
        type="button"
      >
        <RIcon name="arrow-long-left" size="medium" />
      </button>
      <RText size="body-m" weight="medium">
        {title}
      </RText>
      <button
        aria-label="Close wallet"
        className={styles.iconButton}
        onClick={onClose}
        type="button"
      >
        <RIcon name="close" size="medium" />
      </button>
    </div>
  );
}
