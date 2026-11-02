import { Container } from "~/lib/atoms/Container/Container";
import styles from "./styles.module.css";
import { Outlet, useLocation } from "@remix-run/react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { MobilePortfolio } from "~/routes/portfolio/components/MobilePortfolio/MobilePortfolio";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { ROUTES } from "~/consts";
import {
  PortfolioPageSkeleton,
  type PortfolioPageSkeletonVariant,
} from "~/routes/portfolio/components/PortfolioPageSkeleton/PortfolioPageSkeleton";

const SKELETON_VARIANTS: Record<string, PortfolioPageSkeletonVariant> = {
  [ROUTES.portfolio]: "overview",
  [ROUTES.portfolioActivity]: "activity",
  [ROUTES.portfolioNotifications]: "notifications",
  [ROUTES.portfolioProfile]: "profile",
};

const getSkeletonVariant = (pathname: string) =>
  SKELETON_VARIANTS[pathname.replace(/\/$/, "")] ?? "none";

export default function Portfolio() {
  const { isAuthenticated, isAuthLoading } = useAuthContext();
  const isMobile = useIsMobileViewport();
  const { pathname } = useLocation();

  if (isMobile)
    return (
      <Container>
        <MobilePortfolio />
      </Container>
    );

  // Until the stored session is restored isAuthenticated is false, which used
  // to flash the login prompt with a spinner before the real page
  if (isAuthLoading)
    return (
      <Container>
        <PortfolioPageSkeleton variant={getSkeletonVariant(pathname)} />
      </Container>
    );

  if (!isAuthenticated)
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

  return (
    <Container>
      <PortfolioProvider>
        <Outlet />
      </PortfolioProvider>
    </Container>
  );
}
