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
import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez" },
    { name: "description", content: "Equiteez Home" },
  ];
};

export default function Index() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  // used for banner section opacity transition
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <PageLayout includeContainer={false}>
      <Container px={44}>
        <div ref={ref}>
          <BannerSection opacity={opacity} />
          <Spacer height={124} />
          <MarketRowTop />
          <Spacer height={64} />
        </div>
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
