import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import PageLayout from '~/layouts/PageLayout/Pagelayout';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import {
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from '~/providers/EstatesProvider/estates.types';
import { ThumbCardSecondary } from '~/templates/ThumbCard/ThumbCard';

export const meta: MetaFunction = () => {
  return [
    { title: 'Properties' },
    { name: 'description', content: 'Properties route!' },
  ];
};

export default function Properties() {
  const { estates } = useEstatesContext();

  return (
    <PageLayout>
      <div className="px-11">
        <div className="mt-11 grid grid-cols-3 gap-x-6 gap-y-8">
          {estates.map((es) => {
            const isSecondaryMarket = es.assetDetails.type === SECONDARY_MARKET;

            const restProps = isSecondaryMarket
              ? {
                  pricePerToken: (es as SecondaryEstate).assetDetails
                    .priceSecondary.price,
                }
              : {
                  // For the time being for fake data
                  progressBarPercentage: +(
                    (((es as PrimaryEstate).assetDetails.pricePrimary
                      .tokensUsed || 1) /
                      (es as PrimaryEstate).assetDetails.pricePrimary
                        .tokensAvailable) *
                    100
                  ).toFixed(2),
                };

            return (
              <Link
                to={`/properties/${es.token_address}`}
                key={es.token_address}
              >
                <ThumbCardSecondary
                  imgSrc={es.assetDetails.previewImage}
                  title={es.name}
                  description={es.assetDetails.propertyDetails.propertyType}
                  isSecondaryMarket={isSecondaryMarket}
                  APY={es.assetDetails.APY}
                  {...restProps}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
