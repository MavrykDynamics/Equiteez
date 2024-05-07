import type { MetaFunction } from '@remix-run/node';
import { Navigate } from '@remix-run/react';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';
import { usePropertyById } from './hooks/use-property-by-id';

export const meta: MetaFunction = () => {
  return [
    { title: 'Property' },
    { name: 'description', content: 'Property data' },
  ];
};

export default function PropertyDetails() {
  const estateData = usePropertyById();

  if (!estateData) return <Navigate to={'/properties'} />;

  return (
    <PageLayout>
      <h1 className="text-content text-hero">{estateData.id}</h1>
    </PageLayout>
  );
}
