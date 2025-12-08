import React, { FC, Suspense, lazy, useEffect, useRef, useState } from "react";
import { FiltersProps } from "./utils";

import FiltersIcon from "app/icons/filters.svg?react";
import SearchIcon from "app/icons/search.svg?react";

import styles from "./MobileFilters.module.css";
import { FiltersSidebarRefType } from "./MobileFilters/FiltersSidebar";
import { useNavigate } from "@remix-run/react";
import { useFiltersContext } from "~/routes/marketplace._index/components/Filters/FiltersProvider";
import { Button } from "~/lib/atoms/Button";
import { InputWithIcons } from "~/lib/organisms/InputWithIcons/InputWithIcons";

const FiltersSidebar = lazy(() =>
  import("./MobileFilters/FiltersSidebar").then((module) => ({
    default: module.FiltersSidebar,
  }))
);

export const MobileFilters: FC<FiltersProps> = ({ isHideTagFilter }) => {
  const sidebarRef = useRef<FiltersSidebarRefType>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setFocused] = useState(false);

  const {
    filtersState: { searchValue },
    setFiltersState,
    handleNavigateToSelectedFilters,
  } = useFiltersContext();
  const navigate = useNavigate();

  const handleOpenFilters = () => {
    sidebarRef.current?.open();
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFiltersState((prev) => ({
      ...prev,
      searchValue: prev.searchValue.trim(),
    }));
    setFocused(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFiltersState((prev) => ({
      ...prev,
      searchValue: event.target.value,
    }));
  };

  const handleClearSearch = () => {
    setFiltersState((prev) => ({
      ...prev,
      searchValue: "",
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        sidebarRef.current?.close();
      }

      if (isFocused && event.key === "Enter") {
        inputRef.current?.blur();
        handleNavigateToSelectedFilters();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, handleNavigateToSelectedFilters, navigate]);

  return (
    <section className={styles.container}>
      <div className={styles.input}>
        <SearchIcon
          className={styles.searchIcon}
          width={24}
          height={24}
          color="var(--color-light-blue-100)"
        />
        <div className={styles.inputWrapper}>
          <InputWithIcons
            ref={inputRef}
            hasIcon
            showSearchIcon
            name="search"
            placeholder="Search"
            type="search"
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <Button
        type="button"
        className={styles.button}
        onClick={handleOpenFilters}
      >
        <FiltersIcon width={24} height={24} />
      </Button>
      <Suspense>
        <FiltersSidebar
          ref={sidebarRef}
          shouldHideTagFilter={isHideTagFilter}
        />
      </Suspense>
    </section>
  );
};
