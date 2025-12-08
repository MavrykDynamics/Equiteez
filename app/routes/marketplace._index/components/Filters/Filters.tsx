import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownBodyContentItem,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { ChangeEvent, FC, useCallback, useRef, useState } from "react";
import clsx from "clsx";
import SearchIcon from "app/icons/search.svg?react";
import styles from "./filters.module.css";
import { FiltersProps } from "~/routes/marketplace._index/components/utils";
import { Checkbox } from "~/lib/atoms/CheckBox";
import { useFiltersContext } from "./FiltersProvider";
import { Icon } from "~/lib/atoms/Icon";

export const Filters: FC<FiltersProps> = ({ isHideTagFilter }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    filtersOptions,
    setFiltersState,
    filtersState,
    filtersOptionsRecord,
    handleNavigateToSelectedFilters,
  } = useFiltersContext();

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleChangeSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFiltersState((prevState) => ({
        ...prevState,
        searchValue: event.target.value,
      }));
    },
    [setFiltersState]
  );

  const handleClearSearch = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setFiltersState((prevState) => ({
        ...prevState,
        searchValue: "",
      }));
    },
    [setFiltersState]
  );

  const handleClearAdditionalFilter = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      filterKey: "developer" | "type" | "tag"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setFiltersState((prevState) => ({
        ...prevState,
        [filterKey]: [prevState[filterKey][0]],
      }));
    },
    [setFiltersState]
  );

  const checkIsOptionSelected = useCallback(
    (filterKey: "developer" | "type" | "tag", optionValue: string) =>
      Boolean(filtersState[filterKey].includes(optionValue)),
    [filtersState]
  );

  const handleSelectFilter = useCallback(
    (filterKey: "developer" | "type" | "tag", optionValue: string) =>
      setFiltersState((prevState) => {
        const isFilterExist = prevState[filterKey].includes(optionValue);
        const newFilterValues = isFilterExist
          ? prevState[filterKey].filter((value) => value !== optionValue)
          : [...prevState[filterKey], optionValue];

        return {
          ...prevState,
          [filterKey]: newFilterValues,
        };
      }),
    [setFiltersState]
  );

  const handleBlur = () => {
    setIsSearchFocused(false);
    setFiltersState((prev) => ({
      ...prev,
      searchValue: prev.searchValue.trim(),
    }));
  };

  return (
    <section
      className={clsx(styles.filterWrapper, isHideTagFilter && styles.hideTag)}
    >
      <div className={clsx("text-content relative", styles.filtersGrid)}>
        <div className="flex h-full items-center justify-between">
          <button
            className={clsx(
              "flex flex-col gap-y-1 w-full h-full px-[16px] py-[10px]",
              styles.searchWrapper,
              isSearchFocused && styles.searchWrapperFocused
            )}
            onClick={() => {
              setIsSearchFocused(true);
              inputRef.current?.focus();
            }}
          >
            <div className="relative z-[1]">
              <p className=" text-xs capitalize block mb-[4px] text-start">
                Search Properties
              </p>
              <div className="flex items-center gap-[6px]">
                <input
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={handleBlur}
                  ref={inputRef}
                  placeholder="Search..."
                  value={filtersState.searchValue}
                  onChange={handleChangeSearch}
                  className={clsx(
                    styles.searchInput,
                    !isSearchFocused &&
                      filtersState.searchValue &&
                      styles.hideSearch
                  )}
                />
                {!isSearchFocused && filtersState.searchValue && (
                  <span className={styles.searchInput}>
                    {filtersState.searchValue}
                  </span>
                )}
                {filtersState.searchValue.length && !isSearchFocused ? (
                  <button
                    onClick={handleClearSearch}
                    className={styles.clearSearch}
                    aria-label="Clear search"
                  >
                    <Icon icon="cross" />
                  </button>
                ) : null}
              </div>
            </div>
          </button>
        </div>
        {filtersOptions
          .filter((item) => (isHideTagFilter ? item.id !== "tag" : true))
          .map((filter) => (
            <div
              key={filter.label}
              className="flex items-center justify-between"
            >
              <div className={styles.filterDivider} />
              <div className="flex flex-col gap-y-1 w-full">
                <CustomDropdown>
                  <ClickableDropdownArea>
                    <DropdownFaceContent
                      className={clsx(
                        "px-[16px] z-[10] box-border py-[10px]",
                        styles.filter
                      )}
                      openedClassName={styles.openedFilter}
                      iconClassName={styles.filterIcon}
                    >
                      <div className="w-full relative z-[1]">
                        <p className="text-xs capitalize block mb-[4px] ">
                          {filter.label}
                        </p>
                        <div className="w-full min-h-[27px]">
                          {filtersState[filter.id].length ? (
                            <div className="flex items-center gap-[8px]">
                              <div className={styles.selectedFilter}>
                                <p className="text-sm flex items-center gap-[8px] justify-center">
                                  <span className={styles.filterText}>
                                    {
                                      filtersOptionsRecord[
                                        filter.id
                                      ].options.find(
                                        (option) =>
                                          option.value ===
                                          filtersState[filter.id][0]
                                      )?.label
                                    }
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSelectFilter(
                                        filter.id,
                                        filtersOptionsRecord[
                                          filter.id
                                        ].options.find(
                                          (option) =>
                                            option.value ===
                                            filtersState[filter.id][0]
                                        )?.value ?? ""
                                      );
                                    }}
                                    className="flex py-[4px] items-center justify-center"
                                  >
                                    <Icon
                                      icon="cross"
                                      className="w-[10px] h-[10px]"
                                    />
                                  </button>
                                </p>
                              </div>
                              {filtersState[filter.id]?.length > 1 && (
                                <div className={styles.selectedFilter}>
                                  <p className=" text-sm flex items-center gap-[8px] justify-center">
                                    +{filtersState[filter.id]?.length - 1}
                                    <button
                                      onClick={(event) =>
                                        handleClearAdditionalFilter(
                                          event,
                                          filter.id
                                        )
                                      }
                                      className="flex py-[4px] items-center justify-center"
                                    >
                                      <Icon
                                        icon="cross"
                                        className="w-[10px] h-[10px]"
                                      />
                                    </button>
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="capitalize text-sand-500">
                              {filter.emptyText}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownFaceContent>
                  </ClickableDropdownArea>
                  <DropdownBodyContent topMargin={4}>
                    {filter.options.map((option) => {
                      const isChecked = checkIsOptionSelected(
                        filter.id,
                        option.value
                      );
                      return (
                        <DropdownBodyContentItem
                          className={styles.filterItem}
                          key={option.label}
                          onClick={() =>
                            handleSelectFilter(filter.id, option.value)
                          }
                        >
                          <span className="flex items-center w-full">
                            <span className={styles.checkboxWrapper}>
                              <Checkbox checked={isChecked} />
                            </span>
                            {option.prevIcon && (
                              <span className={styles.prevIconWrapper}>
                                <Icon icon={option.prevIcon} />
                              </span>
                            )}
                            {option.prevImage && (
                              <img
                                alt={option.label}
                                className={styles.prevImg}
                                src={option.prevImage}
                              />
                            )}
                            {option.label} {option.image}
                            {option.icon && (
                              <Icon className="ml-auto" icon={option.icon} />
                            )}
                          </span>
                        </DropdownBodyContentItem>
                      );
                    })}
                  </DropdownBodyContent>
                </CustomDropdown>
              </div>
            </div>
          ))}

        <div className="flex items-center pl-[12px]">
          <div className={styles.filterDivider} />
          <div
            role="presentation"
            className={clsx(styles.searchBtn)}
            onClick={handleNavigateToSelectedFilters}
          >
            <SearchIcon className={"text-white stroke-current w-5 h-5"} />
          </div>
        </div>
      </div>
    </section>
  );
};
