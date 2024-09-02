import { Link } from '@remix-run/react';
import { FC, useMemo, useState } from 'react';
import { TableHeader } from '~/lib/atoms/Table/TableHeader';
import { TableItemSmall } from '~/lib/atoms/Table/TableItem';
import { ImageStacked } from '~/lib/molecules/ImageStacked';
import { InfoTooltip } from '~/lib/organisms/InfoTooltip';
import { SecondaryEstate } from '~/providers/EstatesProvider/estates.types';
import { IconsBlock } from '~/templates/IconsBlock';

// styles
import styles from './exchangeTabs.module.css';
import clsx from 'clsx';

const DESCRIPTION_LIMIT = 398;

export const AssetDetailsTab: FC<{ estate: SecondaryEstate }> = ({
  estate,
}) => {
  const { propertyDetails, previewImage } = estate.assetDetails;
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(() => !isOpen);

  const hasLargeDesription =
    propertyDetails.description.length > DESCRIPTION_LIMIT;

  const slicedDescription = useMemo(
    () =>
      isOpen
        ? propertyDetails.description
        : propertyDetails.description.slice(0, DESCRIPTION_LIMIT),
    [isOpen, propertyDetails.description]
  );

  return (
    <section>
      <div className={clsx('mb-6', styles.assetDetailsGrid)}>
        <div className="h-[226px] rounded-xl overflow-hidden bg-gray-100">
          <ImageStacked
            sources={[previewImage]}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-start">
          <IconsBlock small />
          <div className="py-4 text-content text-caption-regular flex-1">
            {hasLargeDesription
              ? slicedDescription
              : propertyDetails.description}
            {hasLargeDesription && (
              <button
                className="font-semibold underline cursor-pointer outline-none focues:outline-none"
                onClick={toggle}
              >
                &nbsp;{isOpen ? 'Less' : 'More'}
              </button>
            )}
          </div>
          <Link
            to={`/properties/${estate.assetDetails.blockchain[0].identifier}`}
            className="text-body-xs leading-5 font-semibold text-dark-green-500 underline"
          >
            View Property
          </Link>
        </div>
      </div>
      <div>
        <TableHeader mb={1}>
          <p className="text-body-xs font-semibold leading-5">Details</p>
        </TableHeader>

        <TableItemSmall>
          <p>Property Type</p>
          <p>{propertyDetails.propertyType}</p>
        </TableItemSmall>
        <TableItemSmall>
          <p>Full Address</p>
          <p>{propertyDetails.fullAddress}</p>
        </TableItemSmall>
        <TableItemSmall>
          <p>Country</p>
          <p>{propertyDetails.country}</p>
        </TableItemSmall>
        <TableItemSmall>
          <p>Neighborhood</p>
          <p>Hubbell - Lyndon</p>
        </TableItemSmall>
        <TableItemSmall>
          <p>Rental Type</p>
          <p>{propertyDetails.rentalType}</p>
        </TableItemSmall>
        <TableItemSmall>
          <div className="flex items-center gap-x-1">
            Rented? <InfoTooltip content={'Rented'} />
          </div>
          <p>{propertyDetails.rented}</p>
        </TableItemSmall>
        <TableItemSmall isLast>
          <div className="flex items-center gap-x-1">
            Rent Subsidy?
            <InfoTooltip content={'Rent Subsidy?'} />
          </div>
          <p>{propertyDetails.rentSubsidy}</p>
        </TableItemSmall>
      </div>
    </section>
  );
};
