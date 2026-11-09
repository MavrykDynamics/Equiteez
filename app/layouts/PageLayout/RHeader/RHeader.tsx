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
import { useEffect, useState } from "react";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import BellIcon from "app/icons/notification-bell.svg?react";
import BellIconEmpty from "app/icons/notification-bell-empty.svg?react";
import { NotificationsPanel } from "./NotificationsPanel";
import { RSkeletonReveal } from "~/lib/atoms/RSkeleton";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RHeaderWalletSkeleton } from "./RHeaderWalletSkeleton";

/** Desktop application header from the Equiteez 2.0 design system. */
export function RHeader() {
  const { assets } = useAssetsContext();
  const navigationItems = getRHeaderNavigationItems(assets[0]?.address);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isAuthenticated, isAuthLoading } = useAuthContext();
  const { isLoading: isUserLoading, userAddress } = useUserContext();
  const { isNotificationsEnabled, unreadNotificationsCount } =
    useNotificationsContext();
  const shouldShowNotifications = isAuthenticated && isNotificationsEnabled;
  const hasUnreadNotifications = unreadNotificationsCount > 0;

  // Skeleton only while the stored session first restores (on the server too,
  // so the "Connect Wallet" button never flashes). Later refetches of the user
  // data keep the loaded widget instead of dropping back to the skeleton.
  const isSessionRestoring =
    isAuthLoading || isUserLoading || (isAuthenticated && !userAddress);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  useEffect(() => {
    if (!isSessionRestoring) setHasRestoredSession(true);
  }, [isSessionRestoring]);
  const isWalletLoading = isSessionRestoring && !hasRestoredSession;

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        {/* Compact on phones via CSS (see .logo), so the server HTML and the
            first client render match and the header doesn't resize */}
        <RLogo className={styles.logo} size="medium" tone="black" />

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

        <RSkeletonReveal
          className={styles.wallet}
          isLoading={isWalletLoading}
          skeleton={<RHeaderWalletSkeleton />}
        >
          {isAuthenticated && (
            <RButton
              className={styles.depositButton}
              size="medium"
              tone="black"
              onClick={() => setIsDepositModalOpen(true)}
            >
              Deposit
            </RButton>
          )}

          <ConnectWallet />

          {shouldShowNotifications ? (
            <div className={styles.notifications}>
              <button
                aria-expanded={isNotificationsOpen}
                aria-haspopup="dialog"
                aria-label="Notifications"
                className={styles.notificationsButton}
                onClick={() => setIsNotificationsOpen((isOpen) => !isOpen)}
                type="button"
              >
                {hasUnreadNotifications ? <BellIcon /> : <BellIconEmpty />}
              </button>
              <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>
          ) : null}
        </RSkeletonReveal>

        <RDepositFundsModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      </Container>
    </header>
  );
}
