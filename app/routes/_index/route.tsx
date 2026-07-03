import type { MetaFunction } from "@remix-run/node";

import PageLayout from "app/layouts/PageLayout/Pagelayout";

// components
import { BannerSection } from "./components/BannerSection/BannerSection";
import { Spacer } from "~/lib/atoms/Spacer";
import { PropertiesSlider } from "./components/PropertiesSlider";
import { PortfolioSection } from "./components/PortfolioSection";
import { FAQSection } from "app/templates/FAQSection";

import { homeFAQ } from "./index.const";
import { Container } from "~/lib/atoms/Container/Container";
import { MarketRowTop } from "./components/MarketRowTop/MarketRowTop";
import { MarketRowBottom } from "./components/MarketRowBottom/MarketRowBottom";
import { PropertiesSliderSecondary } from "./components/PropertiesSlider/PropertiesSlider";
import { useMemo, useRef } from "react";
import { useScroll, UseScrollOptions, useTransform } from "framer-motion";
import { useAppContext } from "~/providers/AppProvider/AppProvider";
import { MobileFilters } from "~/routes/marketplace._index/components/MobileFilters";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez" },
    { name: "description", content: "Equiteez Home" },
  ];
};

export default function Index() {
  const { IS_WEB } = useAppContext();
  const offsetParameters: UseScrollOptions["offset"] = useMemo(
    () =>
      IS_WEB
        ? window.innerHeight > 900
          ? ["start 30%", "end 30%"]
          : ["start center", "end center"]
        : ["start center", "end center"],
    [IS_WEB]
  );

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offsetParameters,
  });
  // used for banner section opacity transition
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <PageLayout includeContainer={false}>
      <Container className="block md:hidden mt-[16px]">
        <MobileFilters />
      </Container>
      <Container>
        <div ref={ref}>
          <BannerSection opacity={opacity} />
        </div>
      </Container>
      <MarketRowTop />
      <MarketRowBottom />
      <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />
      <Container>
        <PortfolioSection />
        <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />
      </Container>

      <PropertiesSlider />
      <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />
      <PropertiesSliderSecondary />
      <Spacer className="xl:h-[100px] h-[64px] md:h-[64px]" />

      <Container>
        <FAQSection data={homeFAQ} />
        <Spacer className="h-[100px]" />
      </Container>
    </PageLayout>
  );
}
