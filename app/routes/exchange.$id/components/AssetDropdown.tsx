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

  // states
  // to make interactive search when user types smth
  const [estateName, setEstateName] = useState('');
  // using debounce set new name after 450 ms to filter estates data
  const [estateNameForFilter, setEstateNameForFilter] = useState('');

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

  useEffect(() => {
    return () => {
      handleDebouncedSearch.cancel();
    };
  }, [handleDebouncedSearch]);

  useEffect(() => {
    let filteredEstates = estates;

    filteredEstates = filterByName(filteredEstates, estateNameForFilter);
    console.log(filteredEstates);
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

      <DropdownBodyContent topMargin={12} maxHeight={510} customWidth={420}>
        <div className="p-4">
          <Search
            showSearchIcon={estateName.length > 0}
            handleClose={handleClose}
            value={estateName}
            placeholder="Search..."
            onChange={onChange}
          />
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
