import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import CloseIcon from "app/icons/close.svg?react";
import { Button } from "~/lib/atoms/Button";
import { SectionSelectList } from "./SectionSelectList";

import styles from "./FiltersSidebar.module.css";
import { useFiltersContext } from "~/routes/marketplace._index/components/Filters/FiltersProvider";

export type FiltersSidebarRefType = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  getState: () => boolean;
};

type PropsType = {
  shouldHideTagFilter?: boolean;
};

const variants = {
  open: {
    y: 0,
    opacity: 1,
  },
  closed: {
    y: "100%",
    opacity: 0,
  },
};

export const FiltersSidebar = forwardRef<FiltersSidebarRefType, PropsType>(
  function UnwrapFilterSidebar({ shouldHideTagFilter = false }, ref) {
    const [isOpen, setOpen] = useState(false);
    const {
      filtersOptions,
      filtersState,
      setFiltersState,
      clearSelectedFilters,
      hasSelectedFilters,
      handleNavigateToSelectedFilters,
    } = useFiltersContext();

    const assetsCount =
      filtersState.tag.length +
      filtersState.type.length +
      filtersState.developer.length;

    useEffect(() => {
      if (isOpen) {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = prev;
        };
      }
    }, [isOpen]);

    const handleClose = () => {
      setOpen(false);
    };

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: handleClose,
      toggle: () => setOpen((prev) => !prev),
      getState: () => isOpen,
    }));

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{
              duration: 0.3,
            }}
            className={styles.screen}
          >
            <div className={styles.header}>
              <span className={styles.title}>Filter</span>
              <button
                aria-label="Close filters sidebar"
                className={styles.closeButton}
                onClick={handleClose}
              >
                <CloseIcon
                  width={24}
                  height={24}
                  color="var(--color-sand-900)"
                />
              </button>
            </div>
            <div className={styles.filters}>
              {filtersOptions.map((filter) => {
                if (filter.id === "tag" && shouldHideTagFilter) return null;

                const selectedValuesSet = new Set(filtersState[filter.id]);

                return (
                  <SectionSelectList
                    key={filter.id}
                    name={filter.label}
                    options={filter.options}
                    selectedValues={selectedValuesSet}
                    onChange={(value) => {
                      setFiltersState((prev) => ({
                        ...prev,
                        [filter.id]: selectedValuesSet.has(value)
                          ? prev[filter.id].filter((item) => item !== value)
                          : [...prev[filter.id], value],
                      }));
                    }}
                  />
                );
              })}
            </div>
            <div className={styles.actions}>
              <Button
                variant="outline"
                className={styles.resetButton}
                onClick={clearSelectedFilters}
                disabled={!hasSelectedFilters}
              >
                Reset All
              </Button>
              <Button
                className={styles.applyButton}
                onClick={() => {
                  handleNavigateToSelectedFilters();
                  setOpen(false);
                }}
              >
                Show {assetsCount > 0 ? `${assetsCount} Assets` : "All"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
