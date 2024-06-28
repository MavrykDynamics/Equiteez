import type { MetaFunction } from '@remix-run/node';
import ArrowDown from 'app/icons/arrow-down.svg?react';
import ArrowUp from 'app/icons/arrow-up.svg?react';

import PageLayout from 'app/layouts/PageLayout/Pagelayout';

import { Divider } from '~/lib/atoms/Divider';
import { Spacer } from '~/lib/atoms/Spacer';

import { ExchangeTabs } from './components/ExchangeTabs/ExchangeTabs';
import { OrderTabs } from './components/OrderTabs/OrderTabs';
import { BuySellTabs } from './components/BuySellTabs/BuySellTabs';

import { OrderBookTabs } from './components/OrderBookTabs/OrderBookTabs';

import { Container } from '~/lib/atoms/Container';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import { FullScreenSpinner, Spinner } from '~/lib/atoms/Spinner/Spinner';
import { usePropertyByAddress } from '../properties.$id/hooks/use-property-by-id';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import clsx from 'clsx';
import { ImageStacked } from '~/lib/molecules/ImageStacked';
import { useCallback, useMemo } from 'react';
import { useNavigate } from '@remix-run/react';

// icons
import ArrowLinkIcon from 'app/icons/arrow-link.svg?react';
import { SECONDARY_MARKET } from '~/providers/EstatesProvider/estates.types';

export const meta: MetaFunction = () => {
  return [
    { title: 'Exchange' },
    { name: 'description', content: 'Exchange data' },
  ];
};
export default function ExchangeDetails() {
  const { estates: allEstates } = useEstatesContext();
  const estateData = usePropertyByAddress();
  const estates = useMemo(
    () => allEstates.filter((es) => es.assetDetails.type === SECONDARY_MARKET),
    [allEstates]
  );
  const navigate = useNavigate();

  const handleDropdownClick = useCallback(
    (estateId: string) => {
      navigate(`/exchange/${estateId}`);
    },
    [navigate]
  );

  if (!estateData) return <FullScreenSpinner />;

  return (
    <PageLayout includeContainer={false} includeFooter={false}>
      <Container>
        <div className="flex w-full py-3 px-6">
          {/* Top Bar */}
          <div className="flex flex-grow justify-between">
            {/* Market Searcher/Chooser */}
            <div className="flex items-center relative gap-x-3">
              <CustomDropdown>
                <ClickableDropdownArea>
                  <DropdownFaceContent
                    className={clsx(
                      'text-caption text-content w-full border border-brand-green-100',
                      'px-[10px] py-[9px]',
                      'rounded-xl'
                    )}
                  >
                    <div className="flex items-center gap-x-2">
                      <ImageStacked
                        sources={[estateData.assetDetails.previewImage]!}
                        className="w-6 h-6 rounded-full"
                        loader={
                          <div className="flex items-center justify-center w-6 h-6">
                            <Spinner size={12} />
                          </div>
                        }
                      />
                      <span>{estateData.name}</span>
                    </div>
                  </DropdownFaceContent>
                  <DropdownBodyContent topMargin={12} maxHeight={350}>
                    {estates.map((estate) => (
                      <button
                        key={estate.token_address}
                        onClick={() =>
                          handleDropdownClick(
                            estate.assetDetails.blockchain[0].identifier
                          )
                        }
                        className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity"
                      >
                        <div className="flex items-center gap-x-2">
                          <ImageStacked
                            sources={[estate.assetDetails.previewImage]!}
                            className="w-6 h-6 rounded-full"
                            loader={
                              <div className="flex items-center justify-center w-6 h-6">
                                <Spinner size={12} />
                              </div>
                            }
                          />
                          <span>{estate.name}</span>
                        </div>
                      </button>
                    ))}
                  </DropdownBodyContent>
                </ClickableDropdownArea>
              </CustomDropdown>

              <button className="text-content">
                <ArrowLinkIcon className="stroke-current w-6 h-6" />
              </button>
            </div>

            {/* Highlights */}
            <div className="flex gap-x-11 items-center">
              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Asset Type</span>
                <span className="text-body-xs leading-5 font-semibold">
                  {estateData.symbol}
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Price</span>
                <span className="text-body-xs leading-5 font-semibold">
                  $8.00
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">24h Change</span>
                <span className="text-body-xs leading-5 font-semibold">
                  +5.04%
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small flex items-center gap-1">
                  <ArrowUp className="size-3" />
                  24h High
                </span>
                <span className="text-body-xs leading-5 font-semibold">
                  $8.20
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small flex items-center gap-1">
                  <ArrowDown className="size-3" />
                  24h Low
                </span>
                <span className="text-body-xs leading-5 font-semibold">
                  $7.89
                </span>
              </span>

              <span className="min-w-[84px] flex flex-col">
                <span className="text-caption-small">Yield</span>
                <span className="text-body-xs leading-5 font-semibold">
                  4.83%
                </span>
              </span>
            </div>

            <div className="w-[222px]"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <Divider className="" />
        </div>

        <div className="flex w-full">
          {/* Left Panel ---------------------------- */}
          <div className="flex flex-col w-[324px] px-6 py-4">
            {/* Order Book View */}
            <div className="flex flex-col w-full">
              <OrderBookTabs />
            </div>
          </div>

          <div className={'h-100 w-[1px] bg-divider'} />

          {/* Mid Panel ---------------------------- */}
          <div className="flex flex-grow p-4">
            <ExchangeTabs />
          </div>

          <div className={'h-100 w-[1px] bg-divider'} />

          {/* Right Panel ---------------------------- */}
          <div className="flex flex-col w-[324px]">
            <div className="flex flex-col w-full px-6 py-4">
              <BuySellTabs symbol={estateData.symbol} />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <Divider className="" />
        </div>

        {/* Order/History/Transactions */}
        <div className="flex flex-col w-full py-6 pe-6">
          <OrderTabs />
        </div>
      </Container>
      <Spacer height={18} />
    </PageLayout>
  );
}
