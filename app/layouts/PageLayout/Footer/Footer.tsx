import { SOCIALS } from "~/consts/icons";
import styles from "./Footer.module.css";
import MavrykLogoIcon from "app/icons/mavrykLogo.svg?react";
import LogoIcon from "app/icons/logoSecondary.svg?react";
import { Container } from "~/lib/atoms/Container/Container";
import { Text } from "~/lib/atoms/Typography/Text";
import { FOOTER_LINKS } from "~/layouts/PageLayout/pagelayout.consts";
import { Link } from "@remix-run/react";

const SocialBlock = () => {
  return (
    <div className="flex gap-[21px] items-center">
      {SOCIALS.map((item) => (
        <a
          key={item.id}
          href={item.url}
          referrerPolicy="no-referrer"
          target="_blank"
          rel="noopener noreferrer"
        >
          <item.Icon className={`fill-white`} />
        </a>
      ))}
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.logoBlock}>
            <LogoIcon />
            <Text
              size="smallBody"
              customColor="--color-sand-50"
              className="max-w-[510px]"
            >
              The future of real estate ownership is digital. Start with just
              $50 to invest in fractionalized, fully compliant, income producing
              assets worldwide.
            </Text>
          </div>
          <div className={styles.linksWrapper}>
            <div className={styles.linksBlock}>
              {FOOTER_LINKS.map((item) => (
                <Link to={item.url} key={item.id}>
                  <Text color="white" size="smallBody" weight="semibold">
                    {item.title}
                  </Text>
                </Link>
              ))}
            </div>
            <div className={styles.socialWrapper}>
              <SocialBlock />
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.subContent}>
          <Text size="tinyBody" customColor="--color-sand-400" c>
            © 2025 Mavryk Dynamics. All Rights Reserved
          </Text>
          <div className="flex gap-[8px] items-center justify-center">
            <Text color="white">Built on</Text>
            <MavrykLogoIcon />
          </div>
          <div className={styles.socialWrapper}>
            <SocialBlock />
          </div>
        </div>
      </Container>
    </footer>
  );
};
