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

export const FiltersProvider: FC<ProviderPropsType> = ({ children }) => {
  const [filters, setFilters] = useState<FiltersStateType>(initialFiltersState);
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersStateType>(initialFiltersState);

  const handleNavigateToSelectedFilters = useCallback(() => {
    setAppliedFilters(cloneFiltersState(filters));
  }, [filters]);

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
      handleNavigateToSelectedFilters,
    }),
    [appliedFilters, filters, handleNavigateToSelectedFilters]
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
