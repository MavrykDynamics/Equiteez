import { Container } from "~/lib/atoms/Container/Container";
import styles from "./styles.module.css";
import { Outlet, useLocation } from "@remix-run/react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { MobilePortfolio } from "~/routes/portfolio/components/MobilePortfolio/MobilePortfolio";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { ROUTES } from "~/consts";
import { RSkeletonReveal } from "~/lib/atoms/RSkeleton";
import {
  PortfolioPageSkeleton,
  type PortfolioPageSkeletonVariant,
} from "~/routes/portfolio/components/PortfolioPageSkeleton/PortfolioPageSkeleton";

const SKELETON_VARIANTS: Record<string, PortfolioPageSkeletonVariant> = {
  [ROUTES.portfolio]: "overview",
  [ROUTES.portfolioActivity]: "activity",
  [ROUTES.portfolioNotifications]: "notifications",
};

const getSkeletonVariant = (pathname: string) =>
  SKELETON_VARIANTS[pathname.replace(/\/$/, "")] ?? "none";

export default function Portfolio() {
  const { isAuthenticated, isAuthLoading } = useAuthContext();
  const { userAddress } = useUserContext();
  // false on the server and the first client render, so hydration matches the
  // server's page skeleton and then crossfades into MobilePortfolio
  const isMobile = useIsMobileViewport();
  const { pathname } = useLocation();

  // Until the stored session is restored isAuthenticated is false, which used
  // to flash the login prompt with a spinner before the real page. The user
  // context picks the address up one render after auth resolves; without it
  // the tabs flash "Welcome," and their "Connect wallet" empty states.
  const isSessionRestoring = isAuthLoading || (isAuthenticated && !userAddress);

  if (!isMobile && !isSessionRestoring && !isAuthenticated)
    return (
      <Container className={styles.authContainer}>
        <div className={styles.authWrapper}>
          <div className={styles.authCopy}>
            <RText size="body-sm" weight="medium">
              Log Into Your Account
            </RText>
            <RText color="neutral-700" size="body-sm">
              Connect your wallet to view your personalized data and manage your
              account.
            </RText>
          </div>
          <ConnectWallet />
        </div>
      </Container>
    );

  // One RSkeletonReveal for both states, so the page skeleton crossfades into
  // the route (whose blocks then crossfade their own skeletons in)
  return (
    <Container>
      <RSkeletonReveal
        isLoading={!isMobile && isSessionRestoring}
        skeleton={
          <PortfolioPageSkeleton variant={getSkeletonVariant(pathname)} />
        }
      >
        {isMobile ? (
          <MobilePortfolio />
        ) : (
          <PortfolioProvider>
            <Outlet />
          </PortfolioProvider>
        )}
      </RSkeletonReveal>
    </Container>
  );
}
