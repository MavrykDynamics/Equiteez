import { EstateType } from "~/providers/MarketsProvider/market.types";

export type FiltersProps = {
  isHideTagFilter?: boolean;
};

export type FilterItem = {
  id: string;
  label: string;
  emptyText: string;
  options: FilterOption[];
};

export type FilterOption = {
  value: string;
  label: string;
  icon: string;
  prevImage: string;
  image: string;
  prevIcon: string;
};

export type FiltersState = {
  search: string;
  tag: FilterOption[];
  type: FilterOption[];
  developer: FilterOption[];
};

export const EmptyState = {
  search: "",
  tag: [],
  type: [],
  developer: [],
};

export function getFiltersValues(filtersState: FiltersState) {
  return {
    tag: filtersState.tag.map((item) => item.value).filter((item) => item),
    type: filtersState.type.map((item) => item.value).filter((item) => item),
    developer: filtersState.developer
      .map((item) => item.value)
      .filter((item) => item),
  };
}

export function filterByType(estates: EstateType[], values: string[]) {
  if (!values.length) return estates;
  return estates.filter((es) =>
    values.includes(es.assetDetails?.propertyDetails?.propertyType)
  );
}

export function filterByTag(estates: EstateType[], values: string[]) {
  if (!values.length) return estates;
  return estates.filter((es) =>
    values.includes(es.assetDetails?.propertyDetails?.flag)
  );
}
export function filterByDeveloper(estates: EstateType[], values: string[]) {
  if (!values.length) return estates;
  return estates.filter((es) =>
    values.includes(es.assetDetails?.propertyDetails?.developer)
  );
}

export function filterByName(estates: EstateType[], name: string) {
  return estates.filter((es) =>
    es.name.toLowerCase().includes(name.toLowerCase())
  );
}

export const parseFiltersFromParams = (
  params: URLSearchParams,
  filtersData: FilterItem[]
): FiltersState => {
  const state: FiltersState = { ...EmptyState };

  filtersData.forEach((filter) => {
    const value = params.get(filter.id);
    if (value) {
      const valueList = value.split(",").filter(Boolean);

      state[filter.id as keyof FiltersState] = filter.options.filter((opt) =>
        valueList.includes(opt.value)
      );
    }
  });

  const search = params.get("search");
  if (search) state.search = search;

  return state;
};

export const buildQueryFromFilters = (
  filters: FiltersState
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  ["type", "developer", "tag"].forEach((key) => {
    const filterKey = key as keyof FiltersState;
    const values = filters[filterKey]
      ?.map((item) => item.value)
      .filter(Boolean);
    if (values?.length) {
      params.set(key, values.join(","));
    }
  });

  return params;
};
