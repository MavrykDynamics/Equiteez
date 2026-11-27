import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { useMemo } from "react";
import { ROUTES } from "~/consts";
import { useNavigate } from "@remix-run/react";
import styles from "./styles.module.css";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { DepositFunds } from "~/routes/_index/components/DepositFunds/DepositFunds";
import { WithdrawFunds } from "./WithdrawFunds";
import { useNotificationsContext } from "~/providers/NotificationsProvider/NotificationsProvider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { getTrimmedHash } from "~/lib/utils";
import { useKycStatus } from "~/lib/kyc/useKycStatus";
import { KycBadge } from "./KycBadge";

export function WelcomeBlock({ activeTab }: { activeTab: string }) {
  const navigate = useNavigate();
  const { userAddress } = useUserContext();
  const { unreadNotificationsCount } = useNotificationsContext();
  const kycStatus = useKycStatus();

  const tabs = useMemo(
    () => [
      {
        id: ROUTES.portfolio,
        label: "Overview",
      },
      // {
      //   id: ROUTES.portfolioDividends,
      //   label: "Dividends",
      // },
      {
        id: ROUTES.portfolioActivity,
        label: "Activity",
      },
      {
        id: ROUTES.portfolioNotifications,
        label: "Notifications",
        count: unreadNotificationsCount || undefined,
        type: "notification" as const,
      },
      {
        id: ROUTES.portfolioWallet,
        label: "Wallet",
      },
    ],
    [unreadNotificationsCount]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.welcome}>
        <div className={styles.identity}>
          <RHeading weight="medium" size="h5">
            Welcome, {getTrimmedHash(userAddress ?? "")}
          </RHeading>
          <KycBadge status={kycStatus} />
        </div>
        <div className={styles.actions}>
          <DepositFunds />
          <WithdrawFunds />
        </div>
      </div>
      <RTabSwitcher
        activeTabId={activeTab}
        ariaLabel="Portfolio tabs"
        onChange={(id) => {
          navigate(id);
        }}
        tabs={tabs}
      />
    </div>
  );
}
