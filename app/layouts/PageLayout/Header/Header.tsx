import { useLocation } from "@remix-run/react";
import { Logo } from "../../Logo";
import { ConnectWallet } from "../ConnectWallet";
import { links } from "./header.consts";
import { NavSlideTabs } from "~/lib/organisms/NavSlideTabs/NavSlideTabs";
import React, { useMemo } from "react";

export const Header = React.memo(() => {
  return (
    <section className="flex justify-center border-b border-divider w-full bg-background">
      <div className="px-11 flex items-center justify-between h-[60px] w-container bg-background">
        <Logo />
        <HeaderLinksBlock />
      </div>
    </section>
  );
});

Header.displayName = "Header";

const HeaderLinksBlock = () => {
  const { pathname } = useLocation();

  const activeTabId = useMemo(() => {
    const { id = null } = links.find((link) => link.to === pathname) ?? {};
    return id;
  }, [pathname]);

  return (
    <header className="flex items-center h-full justify-between w-full">
      <NavSlideTabs tabs={links} fixedWidth={124} activeTabId={activeTabId} />

      <ConnectWallet />
    </header>
  );
};
