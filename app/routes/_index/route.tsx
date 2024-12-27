import type { LinksFunction, MetaFunction } from "@remix-run/node";

import PageLayout from "app/layouts/PageLayout/Pagelayout";

import styles from "./components/RealEstateSection/index.css?url";

// components
import { BannerSection } from "./components/BannerSection/BannerSection";
import { Spacer } from "~/lib/atoms/Spacer";
import { FinanceSection } from "./components/FinanceSection/FinanceSection";
import { PropertiesSlider } from "./components/PropertiesSlider";
import { PortfolioSection } from "./components/PortfolioSection";
import { RealEstateSection } from "./components/RealEstateSection";
import { IntegrationSection } from "./components/IntegrationSection";
import { FAQSection } from "app/templates/FAQSection";

import { homeFAQ } from "./index.const";
import { Container } from "~/lib/atoms/Container";
import { MarketRowTop } from "./components/MarketRowTop/MarketRowTop";
import { MarketRowBottom } from "./components/MarketRowBottom/MarketRowBottom";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez" },
    { name: "description", content: "Equiteez Home" },
  ];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function Index() {
  return (
    <PageLayout includeContainer={false}>
      <Container px={44}>
        <BannerSection />
        <Spacer height={124} />
        <MarketRowTop />
        <Spacer height={64} />
      </Container>

      <MarketRowBottom />
      <Container px={44}>
        <Spacer />
        <PortfolioSection />
        <Spacer />
        <FAQSection data={homeFAQ} />
        <Spacer height={200} />
      </Container>
    </PageLayout>
  );
}
