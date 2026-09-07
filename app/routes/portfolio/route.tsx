import { Container } from "~/lib/atoms/Container/Container";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import styles from "./styles.module.css";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { Outlet, useNavigate } from "@remix-run/react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";
import { ROUTES } from "~/consts";
import { RButton } from "~/lib/atoms/RButton";

export default function Portfolio() {
  const { userAddress } = useUserContext();
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const mobileContent = (
    <main className={styles.content}>
      <div className={styles.message}>
        <RText size="body-l" weight="medium">
          Mobile version of Portfolio is not available yet.
        </RText>
        <RText color="neutral-700" size="body-m">
          Please open Equiteez on a desktop screen to continue.
        </RText>
        <RButton
          onClick={() => navigate(ROUTES.home)}
          variant="secondary"
          tone="black"
        >
          Back to Home page
        </RButton>
      </div>
    </main>
  );

  if (!userAddress || !isAuthenticated)
    return (
      <>
        <div className={styles.authWrapper}>
          <RText size="body-l" weight="medium">
            Log in to your Account
          </RText>
          <ConnectWallet />
        </div>
        {mobileContent}
      </>
    );

  return (
    <>
      <Container className={styles.desktopContent}>
        <PortfolioProvider>
          <Outlet />
        </PortfolioProvider>
      </Container>
      {mobileContent}
    </>
  );
}
