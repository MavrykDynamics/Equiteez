import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { MarqueeCarousel } from "~/lib/organisms/MarqueeCarousel/MarqueeCarousel";
import { RSectionHeader } from "~/lib/molecules/RSectionHeader";
import { RFooter } from "~/layouts/RFooter";
import { RHeader } from "~/layouts/RHeader";

import heroCityImage from "app/assets/redesign/landing/hero-city.webp";
import partnerAtlasLogo from "app/assets/redesign/landing/partners/atlas.svg";
import partnerBigBrainLogo from "app/assets/redesign/landing/partners/big-brain.svg";
import partnerBlockchainAlphaLogo from "app/assets/redesign/landing/partners/blockchain-alpha.svg";
import partnerClusterLogo from "app/assets/redesign/landing/partners/cluster.svg";
import partnerCollectiveLogo from "app/assets/redesign/landing/partners/collective.svg";
import partnerDraperGorenLogo from "app/assets/redesign/landing/partners/draper-goren.svg";
import partnerMultibankLogo from "app/assets/redesign/landing/partners/multibank.svg";
import enterpriseIssuanceImage from "app/assets/redesign/landing/enterprise-issuance.webp";
import enterpriseTradingImage from "app/assets/redesign/landing/enterprise-trading.webp";
import enterpriseLendingImage from "app/assets/redesign/landing/enterprise-lending.webp";
import enterpriseSettlementImage from "app/assets/redesign/landing/enterprise-settlement.webp";
import avatarLarryFink from "app/assets/redesign/landing/avatar-larry-fink.png";
import avatarJennyJohnson from "app/assets/redesign/landing/avatar-jenny-johnson.png";
import avatarMichaelSaylor from "app/assets/redesign/landing/avatar-michael-saylor.png";

import styles from "./RLandingPage.module.css";

type PartnerLogo = {
  alt: string;
  src: string;
  variant:
    | "atlas"
    | "bigBrain"
    | "blockchainAlpha"
    | "cluster"
    | "collective"
    | "draperGoren"
    | "multibank";
};

type Metric = {
  label: string;
  value: string;
};

type SolutionCard = {
  category: string;
  description: string;
  title: string;
};

type EnterpriseCard = {
  description: string;
  image: string;
  title: string;
};

type AssetClass = {
  description: string;
  total: string;
  title: string;
};

type ProblemCard = {
  description: string;
  number: string;
  title: string;
};

type Review = {
  avatar: string;
  name: string;
  quote: string;
  title: string;
};

const partnerLogos: PartnerLogo[] = [
  {
    alt: "MultiBank Group",
    src: partnerMultibankLogo,
    variant: "multibank",
  },
  {
    alt: "Collective Ventures",
    src: partnerCollectiveLogo,
    variant: "collective",
  },
  {
    alt: "Atlas Fund Management",
    src: partnerAtlasLogo,
    variant: "atlas",
  },
  {
    alt: "Big Brain Holdings",
    src: partnerBigBrainLogo,
    variant: "bigBrain",
  },
  {
    alt: "Blockchain Alpha",
    src: partnerBlockchainAlphaLogo,
    variant: "blockchainAlpha",
  },
  {
    alt: "Cluster Capital",
    src: partnerClusterLogo,
    variant: "cluster",
  },
  {
    alt: "Draper Goren Holm",
    src: partnerDraperGorenLogo,
    variant: "draperGoren",
  },
];

const metrics: Metric[] = [
  { label: "Real World Assets TAM By 2030, EY", value: "$28.7T+" },
  { label: "Equiteez Contracted Pipeline", value: "$10B+" },
  { label: "Asset Classes Supported To Date", value: "6+" },
  { label: "Market Trading", value: "24/7" },
];

const solutionCards: SolutionCard[] = [
  {
    category: "Tokenization",
    description:
      "Tokenize real-world assets with full regulatory compliance and automated workflows.",
    title: "Primary Issuance",
  },
  {
    category: "Trading",
    description:
      "24/7 order book, AMM, and OTC trading with instant on-chain settlement.",
    title: "Secondary Markets",
  },
  {
    category: "DeFi",
    description:
      "Borrow against tokenized assets with automated loan servicing.",
    title: "Collateralized Lending",
  },
  {
    category: "Yield",
    description:
      "Precision payouts on schedule, investors receive returns on-chain.",
    title: "Automated Dividends",
  },
  {
    category: "Security",
    description: "MPC wallet integration keeps users in full control.",
    title: "Non-Custodial Architecture",
  },
  {
    category: "Settlement",
    description: "Every trade is final, blockchain-settled, and transparent.",
    title: "Guaranteed Settlement",
  },
];

const enterpriseCards: EnterpriseCard[] = [
  {
    description:
      "Tokenize real-world assets with full regulatory compliance and automated workflows.",
    image: enterpriseIssuanceImage,
    title: "Issuance",
  },
  {
    description:
      "24/7 order book, AMM, and OTC trading with instant on-chain settlement.",
    image: enterpriseTradingImage,
    title: "Trading",
  },
  {
    description:
      "Borrow against tokenized assets with automated loan servicing and interest distribution.",
    image: enterpriseLendingImage,
    title: "Lending",
  },
  {
    description:
      "Every trade is final, blockchain-settled, and transparent. No counterparty risk.",
    image: enterpriseSettlementImage,
    title: "Settlement",
  },
];

const assetClasses: AssetClass[] = [
  {
    description: "Commercial, residential, hotels",
    title: "Real Estate",
    total: "$50M+",
  },
  {
    description: "Gold, precious metals, physical assets",
    title: "Commodities",
    total: "$11.5B",
  },
  {
    description: "Debt portfolios, loan instruments",
    title: "Private Credit",
    total: "$50M+",
  },
  {
    description: "U.S. Treasury bonds",
    title: "Treasuries",
    total: "-",
  },
  {
    description: "Insurance-linked securities",
    title: "Insurance",
    total: "-",
  },
  {
    description: "Bitcoin miners, digital infrastructure",
    title: "Digital Assets",
    total: "-",
  },
];

const problemCards: ProblemCard[] = [
  {
    description:
      "Trillions in TradFi, real estate, commodities, and private credit remain locked. No pathway to fractional access or digital liquidity.",
    number: "01",
    title: "Illiquid & Liquid",
  },
  {
    description:
      "Separate platforms for issuance, trading, custody, and compliance create silos with no unified institutional stack.",
    number: "02",
    title: "Fragmented Infrastructure",
  },
  {
    description:
      "Capital allocators need compliant, scalable rails to deploy into tokenized assets. Current solutions don't meet institutional standards.",
    number: "03",
    title: "Institutional Gap",
  },
];

const reviews: Review[] = [
  {
    avatar: avatarLarryFink,
    name: "Larry Fink",
    quote:
      "We believe the next step going forward will be the tokenization of financial assets. This is a technological transformation for financial assets.",
    title: "CEO, BlackRock",
  },
  {
    avatar: avatarJennyJohnson,
    name: "Jenny Johnson",
    quote:
      "Tokenization could be the next generation for markets. It will revolutionize ownership, by enabling fractional ownership and broader investor access.",
    title: "CEO, Franklin Templeton",
  },
  {
    avatar: avatarMichaelSaylor,
    name: "Michael Saylor",
    quote:
      "The tokenization of real-world assets is one of the most significant trends in blockchain technology, opening institutional-grade markets to global investors.",
    title: "Chairman, MicroStrategy",
  },
];

function RPartnerLogo({ logo }: { logo: PartnerLogo }) {
  return (
    <img
      alt={logo.alt}
      className={styles[logo.variant]}
      src={logo.src}
    />
  );
}

function RLandingHero() {
  return (
    <section className={styles.hero}>
      <img
        alt=""
        aria-hidden
        className={styles.heroImage}
        draggable={false}
        src={heroCityImage}
      />
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <span />
          Powering The Next Era Of Capital Markets
        </div>
        <h1 className={styles.heroTitle}>
          <span>Institutional Infrastructure</span>
          <span>For Tokenized Assets</span>
        </h1>
        <p className={styles.heroDescription}>
          Equiteez delivers end-to-end real-world asset tokenization, from
          issuance and secondary trading to DeFi lending, on the Mavryk Network.
        </p>
        <div className={styles.heroActions}>
          <RButton
            as="a"
            href="#contact"
            iconRight={<RIcon aria-hidden name="arrow-long-right" />}
            tone="white"
          >
            Start Tokenizing
          </RButton>
          <RButton as="link" to="/marketplace" tone="white" variant="secondary">
            Explore App
          </RButton>
        </div>
      </div>
    </section>
  );
}

function RPartnersSection() {
  return (
    <section className={styles.partnersSection}>
      <div className={styles.sectionInner}>
        <div className={styles.partnersIntro}>
          <p className={styles.eyebrow}>
            Backed By Leading Institutional Partners
          </p>
          <MarqueeCarousel
            autoFill
            className={styles.partnerMarquee}
            pauseOnHover
            speed={24}
          >
            {partnerLogos.map((logo) => (
              <span className={styles.partnerLogoItem} key={logo.alt}>
                <RPartnerLogo logo={logo} />
              </span>
            ))}
          </MarqueeCarousel>
        </div>

        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <div className={styles.metric} key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RPlatformSection() {
  return (
    <section className={styles.platformSection} id="solutions">
      <div className={styles.sectionInner}>
        <RSectionHeader
          align="center"
          eyebrow="The Solution"
          heading={["End-To-End RWA Infrastructure,", "One Platform"]}
        />
        <div className={styles.solutionGrid}>
          {solutionCards.map((card) => (
            <article className={styles.solutionCard} key={card.title}>
              <span className={styles.pill}>{card.category}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <RIcon
                aria-hidden
                className={styles.solutionIcon}
                name="arrow-long-up-right"
                size="small"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function REnterpriseSection() {
  return (
    <section className={styles.enterpriseSection} id="about">
      <div className={styles.enterpriseInner}>
        <div className={styles.enterpriseGrid}>
          {enterpriseCards.map((card) => (
            <article className={styles.enterpriseCard} key={card.title}>
              <img alt="" aria-hidden src={card.image} />
              <div className={styles.enterpriseCardOverlay} />
              <div className={styles.enterpriseCardContent}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a className={styles.learnMoreLink} href="#contact">
                  Learn More
                  <RIcon aria-hidden name="arrow-long-right" size="small" />
                </a>
              </div>
            </article>
          ))}
        </div>
        <RSectionHeader
          className={styles.enterpriseHeader}
          description="We offer everything needed to launch, manage, and invest in onchain securities with the trust and transparency of a regulated platform."
          eyebrow="Infrastructure"
          heading={["Built For", "Enterprise"]}
        />
      </div>
    </section>
  );
}

function RAssetsSection() {
  return (
    <section className={styles.assetsSection}>
      <div className={styles.splitSectionInner}>
        <RSectionHeader
          className={styles.assetsHeader}
          description="Our platform supports tokenization across diverse verticals, enabling access to historically illiquid markets."
          eyebrow="Multi-Asset"
          heading={["Every Asset Class,", "One Infrastructure"]}
        />
        <div className={styles.assetList}>
          {assetClasses.map((asset) => (
            <div className={styles.assetRow} key={asset.title}>
              <div>
                <h3>{asset.title}</h3>
                <p>{asset.description}</p>
              </div>
              <strong>{asset.total}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RQuoteSection() {
  return (
    <section className={styles.quoteSection}>
      <div className={styles.quoteInner}>
        <h2>Every asset. Every market. Always open.</h2>
        <blockquote>
          <p>
            {`"We don't just unlock liquidity from assets that never had it, we make every market accessible, onchain, around the clock."`}
          </p>
          <cite>~ Alex Davis, Founder & CEO, Mavryk</cite>
        </blockquote>
      </div>
    </section>
  );
}

function RAnalogSystemsSection() {
  return (
    <section className={styles.analogSection}>
      <div className={styles.splitSectionInner}>
        <RSectionHeader
          className={styles.problemHeader}
          description="Institutional capital is rushing toward tokenized real-world assets, but the infrastructure to make it scalable, compliant, and interoperable simply doesn't exist yet."
          eyebrow="The Problem"
          heading={["$280T+ In Real World", "Assets Trapped In", "Analog Systems"]}
        />
        <div className={styles.problemList}>
          {problemCards.map((problem) => (
            <article className={styles.problemCard} key={problem.number}>
              <strong>{problem.number}</strong>
              <div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RReviewsSection() {
  return (
    <section className={styles.reviewsSection}>
      <div className={styles.reviewsInner}>
        <p className={styles.reviewsEyebrow}>Industry Perspectives</p>
        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <article className={styles.reviewCard} key={review.name}>
              <p>{`"${review.quote}"`}</p>
              <div className={styles.reviewAuthor}>
                <img alt="" aria-hidden src={review.avatar} />
                <div>
                  <h3>{review.name}</h3>
                  <span>{review.title}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RGetInTouchSection() {
  return (
    <section className={styles.contactSection} id="contact">
      <div className={styles.contactInner}>
        <RSectionHeader
          align="center"
          description="Join leading institutional asset owners leveraging Equiteez infrastructure to access global capital markets."
          heading={["Ready To Bring Your", "Assets Onchain?"]}
        />
        <div className={styles.contactActions}>
          <RButton
            as="a"
            href="mailto:hello@equiteez.com"
            iconRight={<RIcon aria-hidden name="arrow-long-right" />}
            tone="black"
          >
            Get In Touch
          </RButton>
          <RButton as="link" to="/marketplace" tone="black" variant="secondary">
            Launch App
          </RButton>
        </div>
      </div>
    </section>
  );
}

export function RLandingPage() {
  return (
    <div className={styles.page}>
      <RHeader />
      <main>
        <RLandingHero />
        <RPartnersSection />
        <RPlatformSection />
        <REnterpriseSection />
        <RAssetsSection />
        <RQuoteSection />
        <RAnalogSystemsSection />
        <RReviewsSection />
        <RGetInTouchSection />
      </main>
      <RFooter />
    </div>
  );
}
