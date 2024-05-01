import type { MetaFunction } from '@remix-run/node';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';

// components
import { BannerSection } from './components/BannerSection/BannerSection';
import { Spacer } from 'app/atoms/Spacer';
import { FinanceSection } from './components/FinanceSection/FinanceSection';

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
    </PageLayout>
  );
}
