import { generatePath } from "@remix-run/react";

import { ROUTES } from "~/consts";

export type RHeaderNavigationItem = {
  desktopLabel: string;
  mobileLabel: string;
  to: string;
};

export function getRHeaderNavigationItems(
  tradeAddress?: string
): RHeaderNavigationItem[] {
  return [
    {
      desktopLabel: "Discover",
      mobileLabel: "Home",
      to: ROUTES.home,
    },
    {
      desktopLabel: "Trade",
      mobileLabel: "Trade",
      to: generatePath(ROUTES.trade, { address: tradeAddress ?? "" }),
    },
    {
      desktopLabel: "Portfolio",
      mobileLabel: "Profile",
      to: ROUTES.portfolio,
    },
  ];
}
