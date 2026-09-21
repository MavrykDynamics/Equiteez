import { NavLink, useLocation } from "@remix-run/react";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import {
  getRHeaderNavigationItems,
  isRHeaderNavigationItemActive,
} from "./navigationItems";
import styles from "./RBottomNavigation.module.css";

export function RBottomNavigation() {
  const { assets } = useAssetsContext();
  const { pathname } = useLocation();
  const navigationItems = getRHeaderNavigationItems(assets[0]?.address).sort(
    (firstItem, secondItem) => {
      const mobileNavigationOrder = ["Trade", "Discover", "Portfolio"];

      return (
        mobileNavigationOrder.indexOf(firstItem.mobileLabel) -
        mobileNavigationOrder.indexOf(secondItem.mobileLabel)
      );
    }
  );

  return (
    <nav aria-label="Mobile navigation" className={styles.navigation}>
      <div className={styles.inner}>
        {navigationItems.map((navigationItem) => {
          const { mobileIcon, mobileLabel, to } = navigationItem;

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
              {({ isActive }) => {
                const itemIsActive = isRHeaderNavigationItemActive(
                  navigationItem,
                  pathname,
                  isActive
                );

                return (
                  <>
                    <RIcon aria-hidden="true" name={mobileIcon} size="medium" />
                    <RText
                      color={itemIsActive ? "neutral-black" : "neutral-500"}
                      size="body-xs"
                    >
                      {mobileLabel}
                    </RText>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
