import type { MetaFunction } from '@remix-run/node';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';

// components
import { BannerSection } from './components/BannerSection/BannerSection';
import { Spacer } from 'app/atoms/Spacer';
import { FinanceSection } from './components/FinanceSection/FinanceSection';
import { PropertiesSlider } from './components/PropertiesSlider';
import { PortfolioSection } from './components/PortfolioSection';
import { RealEstateSection } from './components/RealEstateSection';
import { IntegrationSection } from './components/IntegrationSection';
import { FAQSection } from 'app/templates/FAQSection';

import { homeFAQ } from './index.const';

export const meta: MetaFunction = () => {
  return [
    { title: 'Equiteez' },
    { name: 'description', content: 'Equiteez Home' },
  ];
};

export default function Index() {
  return (
    <PageLayout>
      <BannerSection />
      <Spacer />
      <FinanceSection />
      <Spacer />
      <PropertiesSlider />
      <Spacer />
      <PortfolioSection />
      <Spacer />
      <RealEstateSection />
      <Spacer />
      <IntegrationSection />
      <Spacer />
      <FAQSection data={homeFAQ} />
      <Spacer />
    </PageLayout>
  );
}
