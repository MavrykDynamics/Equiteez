export enum SortingDirection {
  DESC = "desc",
  ASC = "asc",
}

export type ActiveSort = {
  value: string;
  sort: SortingDirection;
};
