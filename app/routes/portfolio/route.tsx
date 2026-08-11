import { useQuery } from "@tanstack/react-query";
import { Container } from "~/lib/atoms/Container/Container";
import { fetchWallet } from "~/lib/apis/rwa";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import styles from "./styles.module.css";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { Outlet } from "@remix-run/react";

export default function Portfolio() {
  const { userAddress } = useUserContext();
  const { isAuthenticated } = useAuthContext();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["rwa-wallet", userAddress],
    queryFn: () =>
      fetchWallet({
        walletAddress: userAddress || "",
      }),
    enabled: isAuthenticated && Boolean(userAddress),
  });

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
      <Outlet />
    </Container>
  );
}
