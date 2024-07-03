import { useNavigate } from '@remix-run/react';
import clsx from 'clsx';
import _ from 'lodash';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from '~/lib/atoms/Search';
import { Spinner } from '~/lib/atoms/Spinner';
import { ImageStacked } from '~/lib/molecules/ImageStacked';
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';
import { useEstatesContext } from '~/providers/EstatesProvider/estates.provider';
import {
  EstateType,
  SECONDARY_MARKET,
} from '~/providers/EstatesProvider/estates.types';

// icons
import StarIcon from 'app/icons/star.svg?react';

// filter fns

function filterByName(estates: EstateType[], name: string) {
  return estates.filter((es) =>
    es.name.toLowerCase().includes(name.toLowerCase())
  );
}

type AssetDropdownProps = {
  estate: EstateType;
};

export const AssetDropdown: FC<AssetDropdownProps> = ({
  estate: estateData,
}) => {
  const { estates: allEstates } = useEstatesContext();

  const estates = useMemo(
    () => allEstates.filter((es) => es.assetDetails.type === SECONDARY_MARKET),
    [allEstates]
  );

  // states ----------------------------------------------------------
  //estates to show after filters
  const [filteredEstates, setFilteredEstates] = useState(() => estates);

  // to make interactive search when user types smth
  const [estateName, setEstateName] = useState('');
  // using debounce set new name after 450 ms to filter estates data
  const [estateNameForFilter, setEstateNameForFilter] = useState('');

  // active filters
  const [activeFiltersIds, setActiveFiltersIds] = useState<
    Record<string, boolean>
  >({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const navigate = useNavigate();

  const handleDropdownClick = useCallback(
    (estateId: string) => {
      navigate(`/exchange/${estateId}`);
    },
    [navigate]
  );

  const sendRequest = useCallback((name: string) => {
    setEstateNameForFilter(name);
  }, []);

  // debounced diltering when srching estate by name
  const handleDebouncedSearch = useMemo(() => {
    return _.debounce(sendRequest, 450);
  }, [sendRequest]);

  const handleClose = useCallback(() => {
    setEstateName('');
    sendRequest('');
  }, [sendRequest]);

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

  const handleFilterClick = (id: string) => {
    if (activeFiltersIds[id]) {
      setActiveFiltersIds({ ...activeFiltersIds, [id]: false });
    } else {
      setActiveFiltersIds({ ...activeFiltersIds, [id]: true });
    }
  };

  useEffect(() => {
    return () => {
      handleDebouncedSearch.cancel();
    };
  }, [handleDebouncedSearch]);

  // filters ---------------
  const filtersData = useMemo(
    () => ({
      0: {
        id: 0,
        label: <StarIcon className="text-green-500 stroke-current w-4 h-4" />,
        value: 'starred',
      },
      1: {
        id: 1,
        label: 'Market',
        value: 'market',
      },
      2: {
        id: 2,
        label: 'OTC',
        value: 'otc',
      },
      3: {
        id: 3,
        label: 'Order Book',
        value: 'order_book',
      },
    }),
    []
  );

  // filter controler
  useEffect(() => {
    let filteredEstates = estates;

    filteredEstates = filterByName(filteredEstates, estateNameForFilter);
    setFilteredEstates(filteredEstates);
  }, [estateNameForFilter, estates]);

  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <DropdownFaceContent
          className={clsx(
            'text-body-xs leading-5 font-semibold text-content w-full border border-brand-green-100',
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
              fallback={
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200"></div>
              }
            />
            <span>{estateData.name}/USDT</span>
          </div>
        </DropdownFaceContent>
      </ClickableDropdownArea>

      <DropdownBodyContent topMargin={12} customWidth={420} customHeight={526}>
        <div className="p-4">
          <Search
            showSearchIcon={estateName.length > 0}
            handleClose={handleClose}
            value={estateName}
            placeholder="Search..."
            onChange={onChange}
          />

          <div className="my-4 flex items-center gap-x-1">
            {Object.entries(filtersData).map(([id, filterVal]) => (
              <button
                key={id}
                onClick={() => handleFilterClick(id)}
                className={clsx(
                  'py-2 px-3 bg-gray-100 text-content text-caption cursor-pointer outline-none',
                  'transition ease-in-out duration-300',
                  'flex items-center justify-center rounded-lg border',
                  activeFiltersIds[id] ? 'border-content' : 'border-transparent'
                )}
              >
                {filterVal.label}
              </button>
            ))}
          </div>
          {filteredEstates.map((estate) => (
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
                  fallback={
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200"></div>
                  }
                />
                <span>{estate.name}</span>
              </div>
            </button>
          ))}
        </div>
      </DropdownBodyContent>
    </CustomDropdown>
  );
};
