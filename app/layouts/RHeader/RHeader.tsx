import { Link } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RHeader.module.css";

export type RHeaderNavItem = {
  href: string;
  label: string;
};

export type RHeaderProps = {
  docsHref?: string;
  launchAppTo?: string;
  navItems?: RHeaderNavItem[];
  variant?: "transparent" | "light";
};

const defaultNavItems: RHeaderNavItem[] = [
  { href: "#solutions", label: "Solutions" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function RHeader({
  docsHref = "https://docs.equiteez.com/",
  launchAppTo = "/marketplace",
  navItems = defaultNavItems,
  variant = "transparent",
}: RHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(variant === "light");
  const [isHidden, setIsHidden] = useState(false);
  const previousScrollYRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const hasDarkSurface = variant === "transparent" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const scrollDelta = currentScrollY - previousScrollYRef.current;

        setIsScrolled(variant === "light" || currentScrollY > 16);

        if (isMenuOpen || currentScrollY <= 16 || scrollDelta < -4) {
          setIsHidden(false);
        } else if (scrollDelta > 4 && currentScrollY > 96) {
          setIsHidden(true);
        }

        previousScrollYRef.current = currentScrollY;
        frameRef.current = null;
      });
    };

    previousScrollYRef.current = Math.max(window.scrollY, 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isMenuOpen, variant]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={clsx(
        styles.header,
        hasDarkSurface ? styles.dark : styles.light,
        isScrolled && styles.scrolled,
        isMenuOpen && styles.menuOpen,
        isHidden && styles.hidden
      )}
    >
      <div className={styles.inner}>
        <RLogo tone={hasDarkSurface ? "white" : "black"} />

        <nav aria-label="Primary navigation" className={styles.nav}>
          {navItems.map((item) => (
            <a className={styles.navLink} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            className={styles.docsLink}
            href={docsHref}
            rel="noreferrer"
            target="_blank"
          >
            Docs
          </a>
          <RButton
            as="link"
            size="medium"
            to={launchAppTo}
            tone={hasDarkSurface ? "white" : "black"}
            variant="secondary"
          >
            Launch App
          </RButton>
        </div>

        <button
          aria-controls="r-header-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          <RIcon aria-hidden name="burger-menu" size="medium" />
        </button>
      </div>

      <div
        className={styles.mobileMenu}
        hidden={!isMenuOpen}
        id="r-header-mobile-menu"
      >
        {navItems.map((item) => (
          <a
            className={styles.mobileLink}
            href={item.href}
            key={item.href}
            onClick={closeMenu}
          >
            {item.label}
          </a>
        ))}
        <a
          className={styles.mobileLink}
          href={docsHref}
          onClick={closeMenu}
          rel="noreferrer"
          target="_blank"
        >
          Docs
        </a>
        <Link className={styles.mobileLink} onClick={closeMenu} to={launchAppTo}>
          Launch App
        </Link>
      </div>
    </header>
  );
}
