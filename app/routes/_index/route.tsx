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
import { gql, useQuery } from "@apollo/client/index";
// import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

export const meta: MetaFunction = () => {
  return [
    { title: "Equiteez" },
    { name: "description", content: "Equiteez Home" },
  ];
};

const testQuery = gql(`query TokenQuery {
  token {
    address
  }
}`);

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function Index() {
  // const { info, bug, loading, success, warning } = useToasterContext();
  const { loading: initialConfigLoading } = useQuery(testQuery, {
    onCompleted: (data) => {
      try {
        console.log(data);
      } catch (e) {
        console.log(e, "TEST_QUIERY_ERROR from catch");
      }
    },
    onError: (error) => console.log(error, "TEST_QUIERY_ERROR"),
  });

  return (
    <PageLayout includeContainer={false}>
      <Container>
        {/* <div className="flex flex-col gap-3">
          <button
            onClick={() => info("info", "message")}
            className="bg-green-500 text-white p-2"
          >
            info
          </button>
          <button
            onClick={() => warning("warning", "message")}
            className="bg-green-500 text-white p-2"
          >
            warning
          </button>
          <button
            onClick={() => loading("loading", "message")}
            className="bg-green-500 text-white p-2"
          >
            loading
          </button>
          <button
            onClick={() => success("success", "message")}
            className="bg-green-500 text-white p-2"
          >
            success
          </button>
          <button
            onClick={() => bug("bug", "message")}
            className="bg-green-500 text-white p-2"
          >
            bug
          </button>
          <button
            onClick={() => bug("fatal", "message")}
            className="bg-green-500 text-white p-2"
          >
            fatal
          </button>
        </div> */}
        <BannerSection />
        <Spacer />
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
