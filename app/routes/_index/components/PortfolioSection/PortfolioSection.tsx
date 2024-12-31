import MarketPlaceIcon from "app/assets/home/icons/marketplace.svg?react";
import StakeIcon from "app/assets/home/icons/stake.svg?react";
import BorrowIcon from "app/assets/home/icons/borrow.svg?react";

import AdvancedTradeIcon from "app/assets/home/icons/advanced-trade.svg?react";
import AccountIcon from "app/assets/home/icons/account.svg?react";
import LearnIcon from "app/assets/home/icons/learn.svg?react";
import { CardWithShadow } from "~/lib/atoms/CardWithShadow";
import clsx from "clsx";
import { Button } from "~/lib/atoms/Button";

import styles from "./portfolioSection.module.css";
import { Link } from "@remix-run/react";

const CARDS = [
  {
    id: 1,
    Icon: MarketPlaceIcon,
    title: "Marketplace",
    btnText: "Start Investing",
    to: "/properties",
    disabled: false,
    description:
      "Discover a diverse range of opportunities and grow your portfolio with ease. Invest fractionally in RWAs, making high-value investments accessible to everyone.",
  },
  {
    id: 2,
    Icon: StakeIcon,
    title: "Stake",
    to: "",
    btnText: "Start Staking",
    disabled: true,
    description:
      "Staking offers a flexible way to earn both rental income and staking rewards without long-term commitments. By providing liquidity to the Pro-Active Market Maker DEX, you help facilitate trading while earning returns on your investment.",
  },
  {
    id: 3,
    Icon: BorrowIcon,
    title: "Borrow",
    to: "",
    btnText: "Start Borrowing",
    disabled: true,
    description:
      "Unlock capital by leveraging your tokenized assets as collateral. Borrow against a single asset or a basket of assets, securing them in your own personal vault. Your assets remain under your control, with only the vault being secured.",
  },
];

const CARDS_BOTTOM_ROW = [
  {
    Icon: AdvancedTradeIcon,
    title: "Advanced Trade",
    link: "/exchange",
    disabled: false,
  },
  {
    Icon: AccountIcon,
    title: "Account",
    link: "#",
    disabled: true,
  },
  {
    Icon: LearnIcon,
    title: "Learn",
    link: "#",
    disabled: true,
  },
];
export const PortfolioSection = () => {
  return (
    <section className="flex flex-col justify-between items-center">
      <h2 className="text-content text-section-headline mb-11">
        Ownership, Reimagined
      </h2>

      <div
        className={clsx("grid grid-cols-3 gap-6", styles["cards-container"])}
      >
        {CARDS.map(
          ({ Icon, id, title, description, btnText, disabled, to }) => (
            <div key={id}>
              <CardWithShadow
                className={clsx(
                  "h-[447px] flex flex-col justify-between",
                  styles.card,
                  disabled && styles.disabled
                )}
              >
                <div className="flex flex-col items-start">
                  <Icon className="mb-4" />
                  <h3 className="text-section-headline text-content mb-4">
                    {title}
                  </h3>
                  <p className="text-content text-body">{description}</p>
                </div>
                <Link to={to}>
                  <Button
                    className={clsx(
                      "self-start",
                      disabled && "pointer-events-none cursor-not-allowed"
                    )}
                  >
                    {disabled ? "Coming Soon" : btnText}
                  </Button>
                </Link>
              </CardWithShadow>
            </div>
          )
        )}
      </div>

      <div className={styles.bottomCardsGrid}>
        {CARDS_BOTTOM_ROW.map(({ Icon, title, disabled, link }) => (
          <Link key={title} to={link}>
            <div
              className={clsx(
                " flex items-center p-9 gap-4",
                styles.bottomCard,
                disabled && "opacity-50"
              )}
            >
              <Icon />
              <h3 className="text-section-headline text-content">{title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
