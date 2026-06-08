import estatesMocked from "app/mocks/rwas.json";
import { toTokenSlug } from "~/lib/assets";
import { EstateType } from "../market.types";

export const getRestMockedAddresses = () => {
  const fakeAddresses = estatesMocked.slice(2).map((es) => es.token_address);
  return fakeAddresses;
};

export const getRestMockedEstates = () => {
  const fakeMarkets = estatesMocked
    .slice(2)
    .reduce<StringRecord<EstateType>>((acc, es) => {
      const slug = toTokenSlug(es.token_address);
      acc[slug] = {
        ...es,
        slug,
      };
      return acc;
    }, {});

  return fakeMarkets;
};
