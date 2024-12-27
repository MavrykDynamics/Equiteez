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
      <Container>
        <BannerSection />
        <Spacer height={124} />
        <FinanceSection />
        <Spacer />
        <PropertiesSlider />
        <Spacer />
        <PortfolioSection />
        <Spacer />
      </Container>
      <RealEstateSection />
      <Container>
        <Spacer />
        <IntegrationSection />
        <Spacer />
        <FAQSection data={homeFAQ} />
        <Spacer className="h-[108px]" />
      </Container>
    </PageLayout>
  );
}
