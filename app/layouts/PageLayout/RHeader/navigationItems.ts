import { generatePath } from "@remix-run/react";

import { ROUTES } from "~/consts";
import type { RIconName } from "~/lib/atoms/RIcon";

const TRADE_PATH_PREFIX = ROUTES.trade.split("/:")[0];

export type RHeaderNavigationItem = {
  desktopLabel: string;
  mobileLabel: string;
  mobileIcon: RIconName;
  to: string;
  activePathPrefix?: string;
};

export function getRHeaderNavigationItems(
  tradeAddress?: string
): RHeaderNavigationItem[] {
  return [
    {
      desktopLabel: "Discover",
      mobileLabel: "Discover",
      mobileIcon: "nav-discovery",
      to: ROUTES.home,
    },
    {
      desktopLabel: "Trade",
      mobileLabel: "Trade",
      mobileIcon: "nav-trade",
      to: generatePath(ROUTES.trade, { address: tradeAddress ?? "" }),
      activePathPrefix: TRADE_PATH_PREFIX,
    },
    {
      desktopLabel: "Portfolio",
      mobileLabel: "Portfolio",
      mobileIcon: "nav-portfolio",
      to: ROUTES.portfolio,
    },
  ];
}

export function isRHeaderNavigationItemActive(
  item: RHeaderNavigationItem,
  pathname: string,
  isActive: boolean
): boolean {
  if (isActive) {
    return true;
  }

  if (!item.activePathPrefix) {
    return false;
  }

  return (
    pathname === item.activePathPrefix ||
    pathname.startsWith(`${item.activePathPrefix}/`)
  );
}
