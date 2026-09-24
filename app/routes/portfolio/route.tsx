import { Container } from "~/lib/atoms/Container/Container";
import styles from "./styles.module.css";
import { Outlet } from "@remix-run/react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { MobilePortfolio } from "~/routes/portfolio/components/MobilePortfolio/MobilePortfolio";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { useIsMobileViewport } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";

export default function Portfolio() {
  const { isAuthenticated } = useAuthContext();
  const isMobile = useIsMobileViewport();

  if (isMobile)
    return (
      <Container>
        <MobilePortfolio />
      </Container>
    );

  if (!isAuthenticated)
    return (
      <Container>
        <div className={styles.authWrapper}>
          <RText size="body-l" weight="medium">
            Log in to your Account
          </RText>
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
