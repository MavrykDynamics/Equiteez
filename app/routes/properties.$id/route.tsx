import type { MetaFunction } from '@remix-run/node';
import { Navigate } from '@remix-run/react';
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';
import LikeIcon from 'app/icons/like.svg?react';
import ShareIcon from 'app/icons/share.svg?react';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';
import { usePropertyById } from './hooks/use-property-by-id';
import { LinkWithIcon } from '~/atoms/LinkWithIcon';
import { FC } from 'react';
import { Gallery } from './components/Gallery/Gallery';

import { IconsBlock } from './components/IconsBlock';
import { Divider } from '~/atoms/Divider';
import { PropertyTabs } from './components/PropertyTabs/PropertyTabs';
import { Spacer } from '~/atoms/Spacer';
import { SimilarProperties } from './components/SimilarProperties/SimilarProperties';
import { FAQSection } from '~/templates/FAQSection';

// styles
import styles from './propertyId.module.css';

// mocked faq data
import { homeFAQ } from '../_index/index.const';
import { PriceSection } from './components/PriceSection/PriceSection';

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
      <div className="my-6 flex items-start px-11">
        <LinkWithIcon
          iconPosition="start"
          CustomIcon={ArrowLeftIcon}
          to="/properties"
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

          <HeadLineTabs issuance="Primary Issuance" houseType="Single Family" />
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
          <PropertyTabs />
        </div>
        <PriceSection />
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
const HeadLineTabs: FC<{ issuance: string; houseType: string }> = ({
  issuance,
  houseType,
}) => {
  return (
    <section className="flex items-center gap-x-2 text-body-xs">
      <div className="py-1 px-2 bg-green-opacity rounded">{issuance}</div>
      <div className="py-1 px-2 bg-yellow-opacity rounded">{houseType}</div>
    </section>
  );
};

const Options: FC = () => {
  return (
    <section className="flex items-center gap-x-4 ml-auto">
      <button className="text-content text-body flex items-center gap-x-1">
        <LikeIcon />
        <p>Save</p>
      </button>
      <button className="text-content text-body flex items-center gap-x-1">
        <ShareIcon />
        <p>Share</p>
      </button>
    </section>
  );
};
