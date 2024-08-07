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

// CONSTS
const columns = ['', 'Name', 'Price USDT', 'Change'];
const STARRED = 'starred';

// styles
import styles from './assetDropdown.module.css';
import {
  getItemFromStorage,
  setItemInStorage,
} from '~/lib/utils/local-storage';

// filter fns
function filterByName(estates: EstateType[], name: string) {
  return estates.filter((es) =>
    es.name.toLowerCase().includes(name.toLowerCase())
  );
}

function filterByStarred(estates: EstateType[]) {
  const starredEstates = getItemFromStorage<string[]>(STARRED);
  if (!starredEstates || starredEstates.length === 0) return estates;

  return estates.filter((es) =>
    starredEstates.includes(es.assetDetails.blockchain[0].identifier)
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

  const [starredIdentifiers, setStarredIdentifiers] = useState<string[]>(
    () => getItemFromStorage(STARRED) || []
  );

  const navigate = useNavigate();

  const handleEstateClick = useCallback(
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

  // handle starred estetas click
  const handleStarClick = (identifier: string) => {
    const starredEstates = getItemFromStorage<string[]>(STARRED);

    if (!starredEstates) {
      setItemInStorage(STARRED, [identifier]);
      setStarredIdentifiers([identifier]);
    } else {
      const shouldRemoveStarredEstate = starredEstates.includes(identifier);
      if (shouldRemoveStarredEstate) {
        const updatedStarred = starredEstates.filter((id) => id !== identifier);
        setItemInStorage(STARRED, updatedStarred);
        setStarredIdentifiers(updatedStarred);
      } else {
        const updatedStarred = [...starredEstates, identifier];
        setItemInStorage(STARRED, updatedStarred);
        setStarredIdentifiers(updatedStarred);
      }
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
        label: (
          <StarIcon className="text-content stroke-current w-4 h-4 fill-none" />
        ),
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

    if (activeFiltersIds[0]) filteredEstates = filterByStarred(filteredEstates);

    filteredEstates = filterByName(filteredEstates, estateNameForFilter);
    setFilteredEstates(filteredEstates);
  }, [activeFiltersIds, estateNameForFilter, estates]);

  const hasNoresults = filteredEstates.length === 0;

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
        <div className="p-4 h-full flex flex-col">
          <Search
            showSearchIcon={estateName.length > 0}
            handleClose={handleClose}
            value={estateName}
            placeholder="Search..."
            onChange={onChange}
          />
          {hasNoresults ? (
            <NoResultsScreen word={estateName} />
          ) : (
            <>
              {' '}
              <div className="my-4 flex items-center gap-x-1">
                {Object.entries(filtersData).map(([id, filterVal]) => (
                  <button
                    key={id}
                    onClick={() => handleFilterClick(id)}
                    className={clsx(
                      'py-2 px-3 bg-gray-100 text-content text-caption cursor-pointer outline-none',
                      'transition ease-in-out duration-300',
                      'flex items-center justify-center rounded-lg border',
                      activeFiltersIds[id]
                        ? 'border-content'
                        : 'border-transparent'
                    )}
                  >
                    {filterVal.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                <table
                  className={clsx(
                    'min-w-full r relative',
                    styles.dropdowntable
                  )}
                >
                  <thead className={clsx(styles.header, 'bg-white relative')}>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className={clsx(
                            'whitespace-nowrap py-2 text-left text-caption-regular relative',
                            'text-left'
                          )}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                    <div className={styles.divider} />
                  </thead>
                  <tbody className="divide-y divide-transparent bg-white">
                    {filteredEstates.map((estate) => {
                      const identifier =
                        estate.assetDetails.blockchain[0].identifier;
                      return (
                        <tr
                          key={estate.token_address}
                          className="cursor-pointer"
                        >
                          <td className="py-[18px] pr-3 min-w-[28px]">
                            <button onClick={() => handleStarClick(identifier)}>
                              <StarIcon
                                className={clsx(
                                  'w-4 h-4 ',
                                  starredIdentifiers.includes(identifier)
                                    ? 'fill-green-500 stroke-green-500'
                                    : 'fill-none stroke-current'
                                )}
                              />
                            </button>
                          </td>
                          <td
                            className={`eq-table-cell text-content`}
                            onClick={() => handleEstateClick(identifier)}
                          >
                            {estate.name}/USDT
                          </td>

                          <td
                            className="eq-table-cell text-left text-content"
                            onClick={() => handleEstateClick(identifier)}
                          >
                            {estate.assetDetails.priceDetails.price}
                          </td>

                          <td
                            className="eq-table-cell text-left first text-green-500"
                            onClick={() => handleEstateClick(identifier)}
                          >
                            +
                            {
                              estate.assetDetails.priceDetails
                                .projectedRentalYield
                            }
                            %
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </DropdownBodyContent>
    </CustomDropdown>
  );
};

const NoResultsScreen: FC<{ word: string }> = ({ word }) => {
  return (
    <section className="w-full h-full flex-1 flex items-center justify-center">
      <div className="flex flex-col gap-y-2 items-center">
        <p className="text-body-xs">
          {word ? <>No results for ”{word}”</> : 'No Results'}
        </p>
        <p className="text-caption-regular max-w-[306px] text-center">
          We couldn&apos;t find anything matching your search. Try again with a
          different term.
        </p>
      </div>
    </section>
  );
};
