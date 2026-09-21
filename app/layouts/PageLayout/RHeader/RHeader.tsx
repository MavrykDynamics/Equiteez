import { NavLink } from "@remix-run/react";

import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RHeader.module.css";
import { Container } from "~/lib/atoms/Container/Container";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RButton } from "~/lib/atoms/RButton";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { getRHeaderNavigationItems } from "./navigationItems";
import { RDepositFundsModal } from "~/routes/_index/components/DepositFunds/RDepositFundsModal";
import { useState } from "react";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { RIcon } from "~/lib/atoms/RIcon";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import { NotificationsPanel } from "./NotificationsPanel";

/** Desktop application header from the Equiteez 2.0 design system. */
export function RHeader() {
  const { assets } = useAssetsContext();
  const navigationItems = getRHeaderNavigationItems(assets[0]?.address);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const isMobileViewport = useIsMobileViewport();
  const { unreadNotificationsCount } = useNotificationsContext();

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <RLogo
          className={styles.logo}
          size={isMobileViewport ? "compact" : "medium"}
          tone="black"
        />

        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigationItems.map(({ desktopLabel, to }) => (
            <NavLink
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
              key={desktopLabel}
              to={to}
            >
              <RText size="body-sm" weight="medium">
                {desktopLabel}
              </RText>
            </NavLink>
          ))}
        </nav>

        <div className={styles.wallet}>
          <RButton
            className={styles.depositButton}
            size="medium"
            tone="black"
            onClick={() => setIsDepositModalOpen(true)}
          >
            Deposit
          </RButton>

          <ConnectWallet />

          <div className={styles.notifications}>
            <button
              aria-expanded={isNotificationsOpen}
              aria-haspopup="dialog"
              aria-label={`Notifications${unreadNotificationsCount ? `, ${unreadNotificationsCount} unread` : ""}`}
              className={styles.notificationsButton}
              onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
              type="button"
            >
              <RIcon name="bell" size="medium" />
              {unreadNotificationsCount ? (
                <span className={styles.notificationsBadge} />
              ) : null}
            </button>
            <NotificationsPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>
        </div>

        <RDepositFundsModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      </Container>
    </header>
  );
}
