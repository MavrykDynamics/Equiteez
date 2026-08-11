import { Container } from "~/lib/atoms/Container/Container";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import styles from "./styles.module.css";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { Outlet } from "@remix-run/react";
import { PortfolioProvider } from "~/providers/PortfolioProvider/portfolio.provider";

export default function Portfolio() {
  const { userAddress } = useUserContext();
  const { isAuthenticated } = useAuthContext();

  if (!userAddress || !isAuthenticated)
    return (
      <div className={styles.authWrapper}>
        <RText size="body-l" weight="medium">
          Log in to your Account
        </RText>
        <ConnectWallet />
      </div>
    );

  return (
    <Container>
      <PortfolioProvider>
        <Outlet />
      </PortfolioProvider>
    </Container>
  );
}
