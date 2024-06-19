import type { MetaFunction } from '@remix-run/node';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';

// components
import { BannerSection } from './components/BannerSection/BannerSection';
import { Spacer } from '~/lib/atoms/Spacer';
import { FinanceSection } from './components/FinanceSection/FinanceSection';
import { PropertiesSlider } from './components/PropertiesSlider';
import { PortfolioSection } from './components/PortfolioSection';
import { RealEstateSection } from './components/RealEstateSection';
import { IntegrationSection } from './components/IntegrationSection';
import { FAQSection } from 'app/templates/FAQSection';

import { homeFAQ } from './index.const';
import { Container } from '~/lib/atoms/Container';

export const meta: MetaFunction = () => {
  return [
    { title: 'Equiteez' },
    { name: 'description', content: 'Equiteez Home' },
  ];
};

export default function Index() {
  return (
    <PageLayout bg="bg-background-tertiary" includeContainer={false}>
      <Container>
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
