import React, { FC, useMemo } from "react";

import styles from "./walletSidebar.module.css";
import clsx from "clsx";
import HouseIcon from "app/icons/wallet/house.svg?react";
import OverviewIcon from "app/icons/wallet/overview.svg?react";
import UploadIcon from "app/icons/wallet/upload.svg?react";
import AccountIcon from "app/icons/account.svg?react";
import TransactionIcon from "app/icons/wallet/transactions.svg?react";

import { ROUTES } from "~/consts/routes";
import { Text } from "~/lib/atoms/Typography/Text";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Link, NavLink, useLocation } from "@remix-run/react";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";

const items = [
  {
    id: 1,
    subHeader: "Overview",
    body: "Account Overview and Insights",
    link: ROUTES.wallet,
    Icon: OverviewIcon,
  },
  {
    id: 2,
    subHeader: "All Assets",
    body: "View and Manage Your Assets",
    link: ROUTES.walletAssets,
    Icon: HouseIcon,
  },
  {
    id: 3,
    subHeader: "All Transactions",
    body: "View Transaction History Log",
    link: ROUTES.walletTransactions,
    Icon: TransactionIcon,
  },
  {
    subHeader: "Open Orders",
    body: "Manage Your Open Orders",
    link: ROUTES.walletOrders,
    Icon: UploadIcon,
  },
  {
    subHeader: "Profile & Wallet Info",
    body: "Profile Settings & Wallet Details",
    link: ROUTES.walletInfo,
    Icon: AccountIcon,
  },
];

export const WalletSidebar = ({ mbgBalance }: { mbgBalance: number }) => {
  return (
    <div className={styles.walletSidebar}>
      <div className="flex w-full justify-between">
        <Heading level="5">Wallet</Heading>
      </div>

      <div className={styles.walletSidebarList}>
        {items.map((item) => (
          <WalletSidebarItem
            key={item.id}
            link={item.link}
            subHeader={item.subHeader}
            body={item.body}
            Icon={item.Icon}
          />
        ))}
      </div>
      <div className={styles.walletSidebarListMobile}>
        <WalletMobileMenu />
      </div>
    </div>
  );
};

type WalletSidebarItemProps = {
  subHeader: string;
  body: string;
  link: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

const WalletSidebarItem: FC<WalletSidebarItemProps> = ({
  subHeader,
  body,
  link,
  Icon,
}) => {
  return (
    <NavLink
      to={link}
      end
      className={({ isActive }) =>
        clsx(
          "p-[12px] rounded-lg bg-transparent",
          isActive && styles.walletSidebarItemActive,
          styles.walletSidebarItem
        )
      }
    >
      <div className={styles.iconWrapper}>
        <Icon className="size-6" />
      </div>
      <div className={styles.sidebarItemContent}>
        <Text size="smallBody" weight="semibold">
          {subHeader}
        </Text>
        <Text size="extraTinyBody" className={styles.sidebarItemContentSubtext}>
          {body}
        </Text>
      </div>
    </NavLink>
  );
};

function WalletMobileMenu() {
  const location = useLocation();

  const selectedOption = useMemo(() => {
    const found = items.find(
      (item) => location.pathname.toLowerCase() === item.link.toLowerCase()
    );
    return found || items[0];
  }, [location.pathname]);

  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <DropdownFaceContent
          gap={12}
          openedClassName={styles.selectWrapperActive}
          className={styles.selectWrapper}
          iconClassName={styles.selectIcon}
        >
          <div className="flex items-center gap-[8px]">
            <Text>
              <selectedOption.Icon />
            </Text>
            <Text size="smallBody" weight="bold">
              {selectedOption.subHeader}
            </Text>
          </div>
        </DropdownFaceContent>

        <DropdownBodyContent position="right" topMargin={10}>
          <div className="flex flex-col">
            {items.map((item) => (
              <Link
                onClick={(e) => {}}
                className={styles.selectItem}
                key={item.link}
                to={item.link}
              >
                <Text>
                  <item.Icon />
                </Text>
                <Text size="smallBody" weight="bold">
                  {item.subHeader}
                </Text>
              </Link>
            ))}
          </div>
        </DropdownBodyContent>
      </ClickableDropdownArea>
    </CustomDropdown>
  );
}
