import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { useMemo } from "react";
import { ROUTES } from "~/consts";
import { useNavigate } from "@remix-run/react";
import styles from "./styles.module.css";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RButton } from "~/lib/atoms/RButton";

export function WelcomeBlock({
  activeTab,
  userName,
}: {
  activeTab: string;
  userName: string;
}) {
  const navigate = useNavigate();

  const tabs = useMemo(
    () => [
      {
        id: ROUTES.portfolio,
        label: "Overview",
      },
      {
        id: ROUTES.portfolioDividends,
        label: "Dividends",
      },
      {
        id: ROUTES.portfolioActivity,
        label: "Activity",
      },
    ],
    []
  );
  return (
    <div className={styles.wrapper}>
      <div className={styles.welcome}>
        <RHeading weight="medium" size="h5">Welcome, {userName}</RHeading>
        <RButton size="small" variant="primary" tone="black">
          Deposit
        </RButton>
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
