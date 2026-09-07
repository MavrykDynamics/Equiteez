import { NavLink, useLocation } from "@remix-run/react";

import { Container } from "~/lib/atoms/Container/Container";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import {
  getRHeaderNavigationItems,
  isRHeaderNavigationItemActive,
} from "./navigationItems";
import styles from "./RMobileHeader.module.css";

export function RMobileHeader() {
  const { assets } = useAssetsContext();
  const { pathname } = useLocation();
  const navigationItems = getRHeaderNavigationItems(assets[0]?.address);

  return (
    <nav aria-label="Mobile navigation" className={styles.navigation}>
      <Container className={styles.inner}>
        {navigationItems.map((navigationItem) => {
          const { mobileLabel, to } = navigationItem;

          return (
            <NavLink
              className={({ isActive }) =>
                `${styles.navItem} ${
                  isRHeaderNavigationItemActive(
                    navigationItem,
                    pathname,
                    isActive
                  )
                    ? styles.navItemActive
                    : ""
                }`
              }
              key={mobileLabel}
              to={to}
            >
              <RText size="body-s" weight="medium">
                {mobileLabel}
              </RText>
            </NavLink>
          );
        })}
      </Container>
    </nav>
  );
}
