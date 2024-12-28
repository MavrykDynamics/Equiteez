import type { MetaFunction } from "@remix-run/node";

import PageLayout from "app/layouts/PageLayout/Pagelayout";

// components
import { BannerSection } from "./components/BannerSection/BannerSection";
import { Spacer } from "~/lib/atoms/Spacer";
import { PropertiesSlider } from "./components/PropertiesSlider";
import { PortfolioSection } from "./components/PortfolioSection";
import { FAQSection } from "app/templates/FAQSection";

import { homeFAQ } from "./index.const";
import { Container } from "~/lib/atoms/Container";
import { MarketRowTop } from "./components/MarketRowTop/MarketRowTop";
import { MarketRowBottom } from "./components/MarketRowBottom/MarketRowBottom";
import { PropertiesSliderSecondary } from "./components/PropertiesSlider/PropertiesSlider";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez" },
    { name: "description", content: "Equiteez Home" },
  ];
};

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
        <PropertiesSlider />
        <Spacer />
        <PropertiesSliderSecondary />
        <Spacer height={200} />
        <FAQSection data={homeFAQ} />
        <Spacer height={220} />
      </Container>
    </PageLayout>
  );
}
