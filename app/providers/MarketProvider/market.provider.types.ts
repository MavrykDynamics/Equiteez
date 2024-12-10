import { EstateType } from "../EstatesProvider/estates.types";

export type MarketProviderCtxType = {
  isLoading: boolean;
  markets: EstateType[];
};
