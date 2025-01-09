import { FC } from "react";

import styles from "./marketRowTop.module.css";
import clsx from "clsx";
import { CustomLink } from "~/lib/atoms/CustomLink/CustomLink";

import card1Img from "app/assets/home/topCards/integration.webp";
import card2Img from "app/assets/home/topCards/testnet.webp";
import card3Img from "app/assets/home/topCards/assets.webp";
import card4Img from "app/assets/home/topCards/demo.webp";

const cards = [
  {
    header: "DeFi Intergration",
    description: "Loans on Maven Coming Soon",
    link: "https://mavenfinance.io/",
    imgSrc: card1Img,
  },
  {
    header: "Testnet",
    description: "Explore RWA tokenization",
    link: "https://mavryk.org/testnet",
    imgSrc: card2Img,
  },
  {
    header: "All Assets",
    description: "Time to Invest",
    link: "/marketplace",
    imgSrc: card3Img,
  },
  {
    header: "Demo",
    description: "How to Use Equiteez",
    link: "https://www.youtube.com/watch?v=ZgxRdHMxFA8",
    imgSrc: card4Img,
  },
];

export const MarketRowTop = () => {
  return (
    <section className={styles.topRowGrid}>
      {cards.map(({ header, description, link, imgSrc }) => {
        return (
          <div key={link} className={clsx("cursor-pointer")}>
            <MarketTopRowCard
              imgSrc={imgSrc}
              header={header}
              description={description}
              to={link}
              height={180}
            />
          </div>
        );
      })}
    </section>
  );
};

type MarketTopRowCardProps = {
  imgSrc: string;
  header: string;
  description: string;
  height: number;
  to: string;
};

const MarketTopRowCard: FC<MarketTopRowCardProps> = ({
  imgSrc,
  header,
  description,
  to,
  height = 180,
}) => {
  return (
    <CustomLink
      to={to}
      style={{ height }}
      className={clsx(
        "relative flex flex-col justify-end rounded-3xl overflow-hidden",
        styles.rowTopWrapper
      )}
    >
      <div className="relative text-white p-6 text-start z-[1]">
        <h3 className="text-card-headline font-bold capitalize leading-7">
          {header}
        </h3>
        <p className="text-body">{description}</p>
      </div>
      <img
        src={imgSrc}
        alt="top row card"
        draggable={false}
        className={styles.bg}
      />
    </CustomLink>
  );
};
