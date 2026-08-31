import { generatePath, NavLink } from "@remix-run/react";

import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RHeader.module.css";
import { Container } from "~/lib/atoms/Container/Container";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RIcon } from "~/lib/atoms/RIcon";
import { RButton } from "~/lib/atoms/RButton";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { ROUTES } from "~/consts";

/** Desktop application header from the Equiteez 2.0 design system. */
export function RHeader() {
  const { assets } = useAssetsContext();
  const navigationItems = [
    { label: "Discover", to: ROUTES.home },
    {
      label: "Trade",
      to: generatePath(ROUTES.trade, { address: assets[0]?.address ?? "" }),
    },
    { label: "Portfolio", to: ROUTES.portfolio },
  ];
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <RLogo className={styles.logo} size="medium" tone="black" />

        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigationItems.map(({ label, to }) => (
            <NavLink
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
              key={label}
              to={to}
            >
              <RText size="body-m" weight="medium">
                {label}
              </RText>
            </NavLink>
          ))}
        </nav>

        <div className={styles.wallet}>
          {/*<RButton className={styles.depositButton} variant="secondary">*/}
          {/*  <RText size="body-s" weight="medium">*/}
          {/*    Deposit*/}
          {/*  </RText>*/}
          {/*  <RText size="body-xs">*/}
          {/*    <RIcon name="arrow-long-up-right" size="small" />*/}
          {/*  </RText>*/}
          {/*</RButton>*/}
          <ConnectWallet />
        </div>
      </Container>
    </header>
  );
}
