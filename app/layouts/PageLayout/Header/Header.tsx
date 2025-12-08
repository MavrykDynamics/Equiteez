import { useLocation } from "@remix-run/react";
import { Logo } from "../../Logo";
import { ConnectWallet } from "../ConnectWallet";
import { links } from "./header.consts";
import { NavSlideTabs } from "~/lib/organisms/NavSlideTabs/NavSlideTabs";
import React, { useMemo, useState } from "react";
import styles from "./styles.module.css";
import MenuIcon from "../../../icons/menu.svg?react";
import MobileNavbar from "~/layouts/PageLayout/Header/MobileNavbar";
import classNames from "clsx";
import { Container } from "~/lib/atoms/Container/Container";

export const Header = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <section className="flex justify-center border-b border-divider w-full bg-background">
        <Container className="flex items-center justify-between h-[60px] bg-background">
          <div className="flex items-center">
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Menu"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              onClick={toggleMenu}
            >
              <MenuIcon width={24} height={24} />
            </button>
            <Logo />
          </div>

          <HeaderLinksBlock />
        </Container>
      </section>
      <MobileNavbar isOpen={isOpen} toggleMenu={toggleMenu} />
    </>
  );
});

Header.displayName = "Header";

const HeaderLinksBlock = () => {
  const { pathname } = useLocation();

  const activeTabId = useMemo(() => {
    const { id = null } =
      links.find((link) => pathname.includes(link.to)) ?? {};
    return id;
  }, [pathname]);

  return (
    <header
      className={classNames(
        styles.headerWrapper,
        "flex items-center h-full justify-between w-full"
      )}
    >
      <NavSlideTabs tabs={links} fixedWidth={124} activeTabId={activeTabId} />

      <div
        className={classNames(
          "w-[234px] flex justify-end",
          styles.connectWalletWrapper
        )}
      >
        <ConnectWallet />
      </div>
    </header>
  );
};
