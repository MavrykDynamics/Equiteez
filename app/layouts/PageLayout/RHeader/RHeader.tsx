import { NavLink } from "@remix-run/react";

import { ConnectWallet } from "~/layouts/PageLayout/ConnectWallet";
import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RHeader.module.css";
import { Container } from "~/lib/atoms/Container/Container";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RIcon } from "~/lib/atoms/RIcon";
import { RButton } from "~/lib/atoms/RButton";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { getRHeaderNavigationItems } from "./navigationItems";

/** Desktop application header from the Equiteez 2.0 design system. */
export function RHeader() {
  const { assets } = useAssetsContext();
  const navigationItems = getRHeaderNavigationItems(assets[0]?.address);
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
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
              <RText size="body-m" weight="medium">
                {desktopLabel}
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
