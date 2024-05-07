import type { MetaFunction } from '@remix-run/node';
import PageLayout from '~/layouts/PageLayout/Pagelayout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Properties' },
    { name: 'description', content: 'Properties route!' },
  ];
};

export default function Properties() {
  return (
    <PageLayout>
      <h1 className="text-content text-hero">Properties Page</h1>
    </PageLayout>
  );
}
