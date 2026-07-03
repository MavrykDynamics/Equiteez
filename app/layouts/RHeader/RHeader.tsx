import { Link } from "@remix-run/react";
import clsx from "clsx";
import type { AnchorHTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";

import {
  EQUITEEZ_APP_URL,
  EQUITEEZ_CONTACT_PATH,
  EQUITEEZ_DOCS_URL,
  EXTERNAL_LINK_REL,
  IS_EQUITEEZ_APP_LAUNCH_DISABLED,
  NEW_TAB_TARGET,
} from "~/consts/links.const";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RHeader.module.css";

export type RHeaderNavItem = {
  href: string;
  label: string;
  rel?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
};

export type RHeaderProps = {
  docsHref?: string;
  isLaunchAppDisabled?: boolean;
  launchAppTo?: string;
  navItems?: RHeaderNavItem[];
  scrollBoundarySelector?: string;
  variant?: "landing" | "light" | "solutions" | "transparent";
};

const defaultNavItems: RHeaderNavItem[] = [
  { href: "/solutions", label: "Solutions" },
  { href: "/about", label: "About" },
  {
    href: EQUITEEZ_CONTACT_PATH,
    label: "Contact",
    rel: EXTERNAL_LINK_REL,
    target: NEW_TAB_TARGET,
  },
];

const defaultLandingScrollBoundarySelector =
  '[data-r-header-theme-boundary="landing-hero"]';

function getDefaultScrolledState(header: HTMLElement | null) {
  return window.scrollY > (header?.offsetHeight ?? 0);
}

function getLandingScrolledState(
  boundarySelector: string,
  header: HTMLElement | null
) {
  const boundary = document.querySelector<HTMLElement>(boundarySelector);

  if (!boundary) {
    return getDefaultScrolledState(header);
  }

  return boundary.getBoundingClientRect().bottom <= (header?.offsetHeight ?? 0);
}

function isExternalHref(href: string) {
  return /^https?:\/\//u.test(href);
}

function RHeaderNavLink({
  className,
  href,
  label,
  onClick,
  rel,
  target,
}: RHeaderNavItem & {
  className: string;
  onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
}) {
  const isExternalLink = isExternalHref(href);
  const resolvedTarget =
    target ?? (isExternalLink ? NEW_TAB_TARGET : undefined);
  const resolvedRel =
    rel ?? (resolvedTarget === NEW_TAB_TARGET ? EXTERNAL_LINK_REL : undefined);

  if (isExternalLink || resolvedTarget === NEW_TAB_TARGET) {
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        rel={resolvedRel}
        target={resolvedTarget}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      className={className}
      onClick={onClick}
      rel={resolvedRel}
      target={resolvedTarget}
      to={href}
    >
      {label}
    </Link>
  );
}

function RHeaderLaunchButton({
  className,
  disabled,
  launchAppTo,
  size,
  tone,
  variant,
}: {
  className?: string;
  disabled: boolean;
  launchAppTo: string;
  size: "medium" | "small";
  tone: "white" | "black";
  variant: "primary" | "secondary";
}) {
  if (disabled) {
    return (
      <RButton
        className={className}
        disabled
        size={size}
        tone={tone}
        variant={variant}
      >
        Launch App
      </RButton>
    );
  }

  if (isExternalHref(launchAppTo)) {
    return (
      <RButton
        as="a"
        className={className}
        href={launchAppTo}
        rel={EXTERNAL_LINK_REL}
        size={size}
        target={NEW_TAB_TARGET}
        tone={tone}
        variant={variant}
      >
        Launch App
      </RButton>
    );
  }

  return (
    <RButton
      as="link"
      className={className}
      size={size}
      to={launchAppTo}
      tone={tone}
      variant={variant}
    >
      Launch App
    </RButton>
  );
}

function RHeaderLaunchMobileLink({
  disabled,
  launchAppTo,
  onClick,
}: {
  disabled: boolean;
  launchAppTo: string;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={clsx(styles.mobileLink, styles.disabledMobileLink)}
      >
        Launch App
      </span>
    );
  }

  if (isExternalHref(launchAppTo)) {
    return (
      <a
        className={styles.mobileLink}
        href={launchAppTo}
        onClick={onClick}
        rel={EXTERNAL_LINK_REL}
        target={NEW_TAB_TARGET}
      >
        Launch App
      </a>
    );
  }

  return (
    <Link className={styles.mobileLink} onClick={onClick} to={launchAppTo}>
      Launch App
    </Link>
  );
}

export function RHeader({
  docsHref = EQUITEEZ_DOCS_URL,
  isLaunchAppDisabled = IS_EQUITEEZ_APP_LAUNCH_DISABLED,
  launchAppTo = EQUITEEZ_APP_URL,
  navItems = defaultNavItems,
  scrollBoundarySelector = defaultLandingScrollBoundarySelector,
  variant = "landing",
}: RHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolledPastSurface, setIsScrolledPastSurface] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const resolvedVariant =
    variant === "transparent"
      ? "landing"
      : variant === "light"
        ? "solutions"
        : variant;
  const hasLandingSurface = resolvedVariant === "landing";
  const hasSolutionsSurface = resolvedVariant === "solutions";
  const hasDarkSurface = hasLandingSurface;
  const hasScrolledSurface = isScrolledPastSurface;
  const hasMenuSurface = hasLandingSurface && isMenuOpen;
  const launchButtonTone = hasLandingSurface ? "white" : "black";
  const launchButtonVariant = hasSolutionsSurface ? "primary" : "secondary";
  const logoTone =
    hasDarkSurface && !hasScrolledSurface && !hasMenuSurface
      ? "white"
      : "black";

  useEffect(() => {
    const syncScrolledState = () => {
      const nextIsScrolledPastSurface = hasLandingSurface
        ? getLandingScrolledState(scrollBoundarySelector, headerRef.current)
        : getDefaultScrolledState(headerRef.current);

      setIsScrolledPastSurface((currentIsScrolledPastSurface) =>
        currentIsScrolledPastSurface === nextIsScrolledPastSurface
          ? currentIsScrolledPastSurface
          : nextIsScrolledPastSurface
      );
    };

    const scrollListenerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    window.addEventListener("scroll", syncScrolledState, scrollListenerOptions);
    window.addEventListener("resize", syncScrolledState);
    document.addEventListener(
      "scroll",
      syncScrolledState,
      scrollListenerOptions
    );
    syncScrolledState();

    return () => {
      window.removeEventListener(
        "scroll",
        syncScrolledState,
        scrollListenerOptions
      );
      window.removeEventListener("resize", syncScrolledState);
      document.removeEventListener(
        "scroll",
        syncScrolledState,
        scrollListenerOptions
      );
    };
  }, [hasLandingSurface, scrollBoundarySelector]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={clsx(
        styles.header,
        styles[resolvedVariant],
        hasScrolledSurface && styles.scrolled,
        hasScrolledSurface && "r-header--scrolled",
        hasMenuSurface && styles.menuOpen
      )}
      data-scrolled={hasScrolledSurface ? "true" : "false"}
      data-variant={resolvedVariant}
      ref={headerRef}
    >
      <div className={styles.inner}>
        <RLogo className={styles.logo} tone={logoTone} />

        <nav aria-label="Primary navigation" className={styles.nav}>
          {navItems.map((item) => (
            <RHeaderNavLink
              {...item}
              className={styles.navLink}
              key={item.href}
            />
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            className={styles.docsLink}
            href={docsHref}
            rel={EXTERNAL_LINK_REL}
            target={NEW_TAB_TARGET}
          >
            Docs
          </a>
          <RHeaderLaunchButton
            className={styles.launchButton}
            disabled={isLaunchAppDisabled}
            launchAppTo={launchAppTo}
            size="medium"
            tone={launchButtonTone}
            variant={launchButtonVariant}
          />
        </div>

        <div className={styles.mobileActions}>
          <RHeaderLaunchButton
            className={styles.launchButton}
            disabled={isLaunchAppDisabled}
            launchAppTo={launchAppTo}
            size="small"
            tone={launchButtonTone}
            variant={launchButtonVariant}
          />
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
      </div>

      <div
        className={styles.mobileMenu}
        hidden={!isMenuOpen}
        id="r-header-mobile-menu"
      >
        {navItems.map((item) => (
          <RHeaderNavLink
            {...item}
            className={styles.mobileLink}
            key={item.href}
            onClick={closeMenu}
          />
        ))}
        <a
          className={styles.mobileLink}
          href={docsHref}
          onClick={closeMenu}
          rel={EXTERNAL_LINK_REL}
          target={NEW_TAB_TARGET}
        >
          Docs
        </a>
        <RHeaderLaunchMobileLink
          disabled={isLaunchAppDisabled}
          launchAppTo={launchAppTo}
          onClick={closeMenu}
        />
      </div>
    </header>
  );
}
