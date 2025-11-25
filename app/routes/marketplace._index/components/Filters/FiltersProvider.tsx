import { useNavigate, useSearchParams } from "@remix-run/react";
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

function parseFiltersFromParams(
  searchParams: URLSearchParams
): FiltersStateType {
  const searchValue = searchParams.get("search") || "";
  const type = searchParams.get("type")
    ? searchParams.get("type")!.split(",").filter(Boolean)
    : [];
  const developer = searchParams.get("developer")
    ? searchParams.get("developer")!.split(",").filter(Boolean)
    : [];
  const tag = searchParams.get("tag")
    ? searchParams.get("tag")!.split(",").filter(Boolean)
    : [];

  return {
    searchValue,
    type,
    developer,
    tag,
  };
}

export const FiltersProvider: FC<ProviderPropsType> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersStateType>(
    parseFiltersFromParams(searchParams)
  );

  const handleNavigateToSelectedFilters = useCallback(() => {
    const searchParams = {};

    if (filters.searchValue) {
      Object.assign(searchParams, { search: filters.searchValue });
    }
    if (filters.type.length) {
      Object.assign(searchParams, { type: Array.from(filters.type).join(",") });
    }
    if (filters.developer.length) {
      Object.assign(searchParams, {
        developer: Array.from(filters.developer).join(","),
      });
    }
    if (filters.tag.length) {
      Object.assign(searchParams, { tag: Array.from(filters.tag).join(",") });
    }

    navigate({
      search: new URLSearchParams(searchParams).toString(),
      pathname: "/marketplace",
    });
  }, [
    navigate,
    filters.searchValue,
    filters.type,
    filters.developer,
    filters.tag,
  ]);

  const contextValue = useMemo<FiltersContextType>(
    () => ({
      filtersState: filters,
      filtersOptions,
      filtersOptionsRecord: {
        type: filtersOptions[0],
        developer: filtersOptions[1],
        tag: filtersOptions[2],
      },
      setFiltersState: setFilters,
      handleNavigateToSelectedFilters,
    }),
    [filters, handleNavigateToSelectedFilters]
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
