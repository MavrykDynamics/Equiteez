import { Link } from "@remix-run/react";

import { RLogo } from "~/lib/atoms/RLogo";

import styles from "./RFooter.module.css";

export type RFooterLink = {
  href: string;
  label: string;
};

export type RFooterGroup = {
  links: RFooterLink[];
  title: string;
};

export type RFooterProps = {
  groups?: RFooterGroup[];
};

const defaultFooterGroups: RFooterGroup[] = [
  {
    title: "Platform",
    links: [
      { href: "#contact", label: "For Companies" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/marketplace", label: "Launch App" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#about", label: "About" },
      { href: "#contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "https://docs.equiteez.com/", label: "Terms & Conditions" },
      { href: "https://docs.equiteez.com/", label: "Privacy Policy" },
    ],
  },
  {
    title: "Socials",
    links: [
      { href: "https://www.linkedin.com/company/equiteez/", label: "LinkedIn" },
      { href: "https://x.com/equiteezdotcom", label: "X" },
    ],
  },
];

function isInternalRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function RFooterLinkItem({ href, label }: RFooterLink) {
  if (isInternalRoute(href)) {
    return (
      <Link className={styles.link} to={href}>
        {label}
      </Link>
    );
  }

  return (
    <a
      className={styles.link}
      href={href}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      target={href.startsWith("http") ? "_blank" : undefined}
    >
      {label}
    </a>
  );
}

export function RFooter({ groups = defaultFooterGroups }: RFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <RLogo size="small" tone="black" />
            <p className={styles.description}>
              Institutional-grade real-world asset tokenization infrastructure,
              powered by Mavryk Network.
            </p>
          </div>

          <nav aria-label="Footer navigation" className={styles.groups}>
            {groups.map((group) => (
              <div className={styles.group} key={group.title}>
                <p className={styles.groupTitle}>{group.title}</p>
                <div className={styles.groupLinks}>
                  {group.links.map((link) => (
                    <RFooterLinkItem
                      href={link.href}
                      key={`${group.title}-${link.label}`}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 Equiteez. All rights reserved.
          </p>
          <a
            className={styles.builtOn}
            href="https://mavryk.org"
            rel="noreferrer"
            target="_blank"
          >
            <span>Built on</span>
            <span className={styles.mavrykBadge}>m</span>
            <span className={styles.mavrykText}>MAVRYK</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
