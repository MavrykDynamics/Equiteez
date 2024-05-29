import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { Navigate, useLoaderData } from '@remix-run/react';
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';
import LikeIcon from 'app/icons/like.svg?react';
import ShareIcon from 'app/icons/share.svg?react';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';
import { usePropertyById } from './hooks/use-property-by-id';
import { LinkWithIcon } from '~/atoms/LinkWithIcon';
import { FC, useMemo } from 'react';
import { Gallery } from './components/Gallery/Gallery';

import { IconsBlock } from './components/IconsBlock';
import { Divider } from '~/atoms/Divider';
import { Spacer } from '~/atoms/Spacer';
import { SimilarProperties } from './components/SimilarProperties/SimilarProperties';
import { FAQSection } from '~/templates/FAQSection';

// styles
import styles from './propertyId.module.css';

// mocked faq data
import { homeFAQ } from '../_index/index.const';
import { PriceSection } from './components/PriceSection/PriceSection';
import PropertyTabs from './components/PropertyTabs/PropertyTabs';
import clsx from 'clsx';

export const meta: MetaFunction = () => {
  return [
    { title: 'Property' },
    { name: 'description', content: 'Property data' },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('tabId');
  return id;
};

export default function PropertyDetails() {
  const { estate: estateData } = usePropertyById();
  const tabId = useLoaderData<typeof loader>() as string | undefined;

  const isSecondaryEstate = useMemo(
    () => estateData?.estateType === 'secondary',
    [estateData?.estateType]
  );

  if (!estateData) return <Navigate to={'/properties'} />;

  return (
    <PageLayout>
      <div className="my-6 flex items-start px-11">
        <LinkWithIcon
          iconPosition="start"
          CustomIcon={ArrowLeftIcon}
          to="/"
          variant="content"
        >
          Back to Properties
        </LinkWithIcon>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-x-3 px-11">
          <h3 className="text-content text-section-headline">
            {estateData.title}
          </h3>

          <HeadLineTabs
            isSecondaryEstate={isSecondaryEstate}
            houseType="Single Family"
          />
          <Options />
        </div>
        <p className="text-body text-content px-11">
          {estateData.details.fullAddress}
        </p>
      </div>
      <Gallery mainImgsrc={estateData.imgSrc} thumbs={estateData.thumbs} />
      <section className={styles.detailsSection}>
        <div className="flex flex-col">
          <IconsBlock />
          <Divider className="my-6" />
          <PropertyTabs tabId={tabId} isSecondaryEstate={isSecondaryEstate} />
        </div>
        <PriceSection isSecondaryEstate={isSecondaryEstate} />
      </section>
      <Spacer />
      <SimilarProperties />
      <Spacer />
      <FAQSection data={homeFAQ} />
      <Spacer className="h-[200px]" />
    </PageLayout>
  );
}

// components
const HeadLineTabs: FC<{ isSecondaryEstate: boolean; houseType: string }> = ({
  isSecondaryEstate,
  houseType,
}) => {
  return (
    <section className="flex items-center gap-x-2 text-body-xs font-medium">
      <div className="py-1 px-2 bg-yellow-opacity rounded">{houseType}</div>
      <div
        className={clsx(
          'py-1 px-2 rounded',
          isSecondaryEstate ? 'bg-blue-opacity' : 'bg-green-opacity'
        )}
      >
        {isSecondaryEstate ? 'Secondary Market' : 'Primary Issuance'}
      </div>
    </section>
  );
};

const Options: FC = () => {
  return (
    <section className="flex items-center gap-x-4 ml-auto">
      <button className="text-content text-body flex items-center gap-x-1 font-semibold">
        <LikeIcon />
        <p>Save</p>
      </button>
      <button className="text-content text-body flex items-center gap-x-1 font-semibold">
        <ShareIcon />
        <p>Share</p>
      </button>
    </section>
  );
};
