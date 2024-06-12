import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/organisms/CustomDropdown/CustomDropdown';

import SearchIcon from 'app/icons/search.svg?react';

import styles from './filters.module.css';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { InputWithIcons } from '~/organisms/InputWithIcons/InputWithIcons';
import { EstateType } from '~/providers/EstatesProvider/estates.types';

// const filtersData = [
//   {
//     label: 'location',
//     value: 'All Markets',
//     filterFn: filterByMarketType,
//     options: [
//       {
//         value: 'all',
//         label: 'All Markets',
//       },
//       {
//         value: 'Primary Issuance',
//         label: 'Primary Issuance',
//       },
//       { value: 'Secondary Market', label: 'Secondary Market' },
//     ],
//   },
//   {
//     label: 'property type',
//     value: 'All Properties',
//     options: [
//       {
//         value: '0',
//         label: 'All Markets',
//       },
//       {
//         value: 'Primary Issuance',
//         label: 'Primary Issuance',
//       },
//       { value: 'Secondary Market', label: 'Secondary Market' },
//     ],
//   },
//   {
//     label: 'projected rentail yield',
//     value: '0%',
//   },
//   {
//     label: 'projected annual return',
//     value: '0%',
//   },
// ];

function filterByMarketType(estates: EstateType[], type: string) {
  return estates.filter((es) => es.assetDetails.type === type);
}

// ----------------------------------------------------------

export const Filters = () => {
  const [opened, setOpened] = useState(false);

  const handleClose = useCallback(() => {
    setOpened(false);
  }, []);

  // no need for usecallback cuz root element is div
  const handleOpen = () => {
    if (!opened) {
      setOpened(true);
    }
  };

  return (
    <section className="py-[10px] px-5 bg-background shadow-card-secondary rounded-[5px]">
      <div className={clsx('text-content relative', styles.filtersGrid)}>
        {/* Location */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1 w-full">
            <CustomDropdown>
              <ClickableDropdownArea>
                <p className="text-body-xs capitalize">Location</p>

                <DropdownFaceContent>
                  <div className="text-buttons w-full">All Markets</div>
                </DropdownFaceContent>
              </ClickableDropdownArea>
              <DropdownBodyContent topMargin={36}>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v1
                </button>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v2
                </button>
              </DropdownBodyContent>
            </CustomDropdown>
          </div>
          <div className="w-[1px] h-[50px] bg-divider mx-5" />
        </div>

        {/* Property type */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1 w-full">
            <CustomDropdown>
              <ClickableDropdownArea>
                <p className="text-body-xs">Property Type</p>

                <DropdownFaceContent>
                  <div className="text-buttons w-full">All Properties</div>
                </DropdownFaceContent>
              </ClickableDropdownArea>
              <DropdownBodyContent topMargin={36}>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v1
                </button>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v2
                </button>
              </DropdownBodyContent>
            </CustomDropdown>
          </div>
          <div className="w-[1px] h-[50px] bg-divider mx-5" />
        </div>

        {/* Rental yield */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1 w-full">
            <CustomDropdown>
              <ClickableDropdownArea>
                <p className="text-body-xs">Projected Rental Yield</p>

                <DropdownFaceContent>
                  <div className="text-buttons w-full">0%</div>
                </DropdownFaceContent>
              </ClickableDropdownArea>
              <DropdownBodyContent topMargin={36}>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v1
                </button>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v2
                </button>
              </DropdownBodyContent>
            </CustomDropdown>
          </div>
          <div className="w-[1px] h-[50px] bg-divider mx-5" />
        </div>

        {/* Annual return */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1 w-full">
            <CustomDropdown>
              <ClickableDropdownArea>
                <p className="text-body-xs">Projected Annual Return</p>

                <DropdownFaceContent>
                  <div className="text-buttons w-full">0%</div>
                </DropdownFaceContent>
              </ClickableDropdownArea>
              <DropdownBodyContent topMargin={36}>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v1
                </button>
                <button className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-green-opacity">
                  v2
                </button>
              </DropdownBodyContent>
            </CustomDropdown>
          </div>
          <div className="w-[1px] h-[50px] bg-divider mx-5" />
        </div>

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
              focused
              showSearchIcon
            />
          </div>
        </div>
      </div>
    </section>
  );
};
