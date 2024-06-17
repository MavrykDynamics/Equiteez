import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

// icons
import SearchIcon from 'app/icons/search.svg?react';

// components
import { InputWithIcons } from '~/lib/organisms/InputWithIcons/InputWithIcons';

// types
import { EstateType } from '~/providers/EstatesProvider/estates.types';

// calc functions
import _ from 'lodash';
import { calculateDynamicRanges } from './utils';

// styles
import styles from './filters.module.css';

// filter functions -----------------------------------------

function filterByMarketType(estates: EstateType[], type: string) {
  if (type === 'all') return estates;
  return estates.filter((es) => es.assetDetails.type === type);
}

function filterByPropertyType(estates: EstateType[], type: string) {
  if (type === 'all') return estates;
  return estates.filter(
    (es) => es.assetDetails.propertyDetails.propertyType === type
  );
}

function filterByRentalYield(estates: EstateType[], value: [number, number]) {
  if (Number(value) === 0) return estates;
  return estates.filter((es) => {
    const { projectedRentalYield } = es.assetDetails.priceDetails;

    return projectedRentalYield >= value[0] && projectedRentalYield <= value[1];
  });
}

function filterByAnnualReturn(estates: EstateType[], value: [number, number]) {
  if (Number(value) === 0) return estates;
  return estates.filter((es) => {
    const { projectedAnnualReturn } = es.assetDetails.priceDetails;

    return (
      projectedAnnualReturn >= value[0] && projectedAnnualReturn <= value[1]
    );
  });
}

// ----------------------------------------------------------

type FiltersProps = {
  estates: EstateType[];
  setEstates: (estates: EstateType[]) => void;
};

export const Filters: FC<FiltersProps> = ({ estates, setEstates }) => {
  const [opened, setOpened] = useState(false);
  const [estateName, setEstateName] = useState('');

  // no need for usecallback cuz root element is div
  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
    }
  };

  const sendRequest = useCallback(
    (name: string) => {
      setEstates(
        estates.filter((es) =>
          es.name.toLowerCase().includes(name.toLowerCase())
        )
      );
    },
    [estates, setEstates]
  );

  const handleClose = useCallback(() => {
    setOpened(false);
    setEstateName('');
    sendRequest('');
  }, [sendRequest]);

  // debounced diltering when srching estate by name
  const handleDebouncedSearch = useMemo(() => {
    return _.debounce(sendRequest, 450);
  }, [sendRequest]);

  useEffect(() => {
    return () => {
      handleDebouncedSearch.cancel();
    };
  }, [handleDebouncedSearch]);

  const { projectedRentalYieldArr, projectedAnnualReturnArr } = useMemo(
    () =>
      estates.reduce<{
        projectedRentalYieldArr: number[];
        projectedAnnualReturnArr: number[];
      }>(
        (acc, es) => {
          const { projectedAnnualReturn, projectedRentalYield } =
            es.assetDetails.priceDetails;

          acc.projectedAnnualReturnArr.push(projectedAnnualReturn);

          acc.projectedRentalYieldArr.push(projectedRentalYield);
          return acc;
        },
        { projectedRentalYieldArr: [], projectedAnnualReturnArr: [] }
      ),
    [estates]
  );

  const projectedRentalYieldOptions = useMemo(
    () => calculateDynamicRanges(projectedRentalYieldArr),
    [projectedRentalYieldArr]
  );
  const projectedAnnualReturnOptions = useMemo(
    () => calculateDynamicRanges(projectedAnnualReturnArr),
    [projectedAnnualReturnArr]
  );

  const filtersData = useMemo(
    () => [
      {
        id: 0,
        label: 'location',
        value: 'All Markets',
        filterFn: filterByMarketType,
        options: [
          {
            value: 'all',
            label: 'All Markets',
          },
          {
            value: 'Primary Issuance',
            label: 'Primary Issuance',
          },
          { value: 'Secondary Market', label: 'Secondary Market' },
        ],
      },
      {
        id: 1,
        label: 'property type',
        value: 'All Properties',
        filterFn: filterByPropertyType,
        options: [
          {
            value: 'all',
            label: 'All Markets',
          },
          ...[
            ...new Set(
              estates.map((es) => es.assetDetails.propertyDetails.propertyType)
            ),
          ].map((item) => ({ label: item, value: item })),
        ],
      },
      {
        id: 2,
        label: 'projected rental yield',
        value: '0%',
        filterFn: filterByRentalYield,
        options: [{ value: [0, 100], label: '0% - 100%' }].concat(
          Object.keys(projectedRentalYieldOptions).map((item) => ({
            value: [
              projectedRentalYieldOptions[item].min,
              projectedRentalYieldOptions[item].max,
            ],
            label: item,
          }))
        ),
      },
      {
        id: 3,
        label: 'projected annual return',
        value: '0%',
        filterFn: filterByAnnualReturn,
        options: [{ value: [0, 100], label: '0% - 100%' }].concat(
          Object.keys(projectedAnnualReturnOptions).map((item) => ({
            value: [
              projectedAnnualReturnOptions[item].min,
              projectedAnnualReturnOptions[item].max,
            ],
            label: item,
          }))
        ),
      },
    ],
    [estates, projectedAnnualReturnOptions, projectedRentalYieldOptions]
  );

  const [activeLabels, setActiveLabels] = useState(() =>
    filtersData.reduce<Record<string, (typeof filtersData)[0]['options'][0]>>(
      (acc, filter) => {
        acc[filter.id] = filter.options[0];
        return acc;
      },
      {}
    )
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // state is updated on every value change, so input will work
      setEstateName(value);

      // call debounced request here
      handleDebouncedSearch(value);
    },
    [handleDebouncedSearch]
  );

  return (
    <section className="py-[10px] px-5 bg-background shadow-card-secondary rounded-[5px]">
      <div className={clsx('text-content relative', styles.filtersGrid)}>
        {filtersData.map((filter) => (
          <div key={filter.label} className="flex items-center justify-between">
            <div className="flex flex-col gap-y-1 w-full">
              <CustomDropdown>
                <ClickableDropdownArea>
                  <p className="text-body-xs capitalize">{filter.label}</p>

                  <DropdownFaceContent>
                    <div className="text-buttons w-full">
                      {activeLabels[filter.id].label}
                    </div>
                  </DropdownFaceContent>
                  <DropdownBodyContent topMargin={36}>
                    {filter.options.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          // @ts-expect-error // value is dynamic and filter fns will handle it
                          setEstates(filter.filterFn(estates, option.value));
                          setActiveLabels({
                            ...activeLabels,
                            [filter.id]: option,
                          });
                        }}
                        className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity"
                      >
                        {option.label}
                      </button>
                    ))}
                  </DropdownBodyContent>
                </ClickableDropdownArea>
              </CustomDropdown>
            </div>
            <div className="w-[1px] h-[50px] bg-divider mx-5" />
          </div>
        ))}

        <div
          role="presentation"
          className={clsx(
            'h-11 rounded-lg',
            'transition duration-300 ease-in-out',
            !opened
              ? 'w-11 bg-green-main flex items-center justify-center cursor-pointer'
              : 'w-full absolute right-0 bg-background grid grid-cols-1 items-center'
          )}
          onClick={handleOpen}
        >
          {!opened && (
            <SearchIcon className="w-[18px] h[18px] text-content stroke-current" />
          )}
          <div className={clsx(!opened ? 'w-[0px] overflow-hidden' : 'w-full')}>
            <InputWithIcons
              placeholder="Search..."
              handleClose={handleClose}
              value={estateName}
              focused
              onChange={onChange}
              showSearchIcon
            />
          </div>
        </div>
      </div>
    </section>
  );
};
