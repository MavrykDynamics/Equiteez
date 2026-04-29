import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  AssetFlagsConst,
  AssetTypesConst,
  DevelopersConst,
} from "../consts/filters";

const filtersOptions = [
  {
    id: "type",
    label: "Type",
    emptyText: "Select Type",
    options: AssetTypesConst.map((item) => ({
      value: item.value,
      prevImage: "",
      label: item.name,
      image: "",
      prevIcon: item.icon,
      icon: "",
    })),
  },
  {
    id: "developer",
    label: "Developer",
    emptyText: "Select Developer",
    options: DevelopersConst.map((item) => ({
      value: item.name,
      prevImage: "",
      label: item.name,
      image: "",
      prevIcon: "",
      icon: item.icon,
    })),
  },
  {
    id: "tag",
    label: "Tag",
    emptyText: "Select Tag",
    options: AssetFlagsConst.map((item) => ({
      value: item.value,
      prevImage: item.prevImage,
      image: item.image,
      label: item.name,
      prevIcon: item.icon,
      icon: "",
    })),
  },
] as const;

export type FiltersOptionsType = typeof filtersOptions;
export type FiltersOptionsRecordType = Record<
  FiltersOptionsType[number]["id"],
  FiltersOptionsType[number]
>;

type FiltersStateType = {
  searchValue: string;
  type: string[];
  developer: string[];
  tag: string[];
};

type FiltersContextType = {
  filtersState: FiltersStateType;
  appliedFiltersState: FiltersStateType;
  filtersOptions: FiltersOptionsType;
  filtersOptionsRecord: FiltersOptionsRecordType;
  setFiltersState: React.Dispatch<React.SetStateAction<FiltersStateType>>;
  applyFiltersState: (
    filtersState: React.SetStateAction<FiltersStateType>
  ) => void;
  clearSelectedFilters: () => void;
  hasSelectedFilters: boolean;
  handleNavigateToSelectedFilters: () => void;
};

type ProviderPropsType = {
  children: React.ReactNode;
};

export const FiltersContext = createContext<FiltersContextType>(undefined!);

export const initialFiltersState: FiltersStateType = {
  searchValue: "",
  type: [],
  developer: [],
  tag: [],
};

const cloneFiltersState = (filters: FiltersStateType): FiltersStateType => ({
  searchValue: filters.searchValue.trim(),
  type: [...filters.type],
  developer: [...filters.developer],
  tag: [...filters.tag],
});

const resolveFiltersState = (
  currentFilters: FiltersStateType,
  nextFilters:
    | FiltersStateType
    | ((prevState: FiltersStateType) => FiltersStateType)
) =>
  typeof nextFilters === "function"
    ? nextFilters(currentFilters)
    : nextFilters;

const clearSelectableFilters = (
  filters: FiltersStateType
): FiltersStateType => ({
  ...filters,
  type: [],
  developer: [],
  tag: [],
});

const hasSelectableFilters = (filters: FiltersStateType) =>
  Boolean(filters.type.length || filters.developer.length || filters.tag.length);

export const FiltersProvider: FC<ProviderPropsType> = ({ children }) => {
  const [filters, setFilters] = useState<FiltersStateType>(initialFiltersState);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersStateType>(initialFiltersState);

  const applyFiltersState = useCallback(
    (nextFilters: React.SetStateAction<FiltersStateType>) => {
      setFilters((prevFilters) => {
        const resolvedFilters = cloneFiltersState(
          resolveFiltersState(prevFilters, nextFilters)
        );

        setAppliedFilters(resolvedFilters);

        return resolvedFilters;
      });
    },
    []
  );

  const handleNavigateToSelectedFilters = useCallback(() => {
    applyFiltersState((prevFilters) => prevFilters);
  }, [applyFiltersState]);

  const clearSelectedFilters = useCallback(() => {
    applyFiltersState((prevFilters) => clearSelectableFilters(prevFilters));
  }, [applyFiltersState]);

  const hasSelectedFilters = useMemo(
    () => hasSelectableFilters(filters),
    [filters]
  );

  const contextValue = useMemo<FiltersContextType>(
    () => ({
      filtersState: filters,
      appliedFiltersState: appliedFilters,
      filtersOptions,
      filtersOptionsRecord: {
        type: filtersOptions[0],
        developer: filtersOptions[1],
        tag: filtersOptions[2],
      },
      setFiltersState: setFilters,
      applyFiltersState,
      clearSelectedFilters,
      hasSelectedFilters,
      handleNavigateToSelectedFilters,
    }),
    [
      appliedFilters,
      applyFiltersState,
      clearSelectedFilters,
      filters,
      hasSelectedFilters,
      handleNavigateToSelectedFilters,
    ]
  );

  return (
    <FiltersContext.Provider value={contextValue}>
      {children}
    </FiltersContext.Provider>
  );
};
FiltersProvider.displayName = "FiltersProvider";

export const useFiltersContext = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFiltersContext must be used within a FiltersProvider");
  }
  return context;
};
