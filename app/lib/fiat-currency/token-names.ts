import {
  MARS1_TOKEN_ADDRESS,
  OCEAN_TOKEN_ADDRESS,
  stablecoinContract,
} from "~/consts/contracts";

/**
 *
 * @param tokenGqlSymbol symbol of token in GQL or feed name to use tokens symbol for interaction on frontend, cuz addresses can have identical metadata, that is not ok
 * @returns null if token is not used, or {name, symbol} obj for token, if it's used
 *
 * need to do this mapper cuz back-end can't send valid names and it can have token duplicates
 */

// TODO use tokens data instead of hardcoded values
export const getTokenSlugByFeed = (tokenGqlSymbol: string) => {
  switch (tokenGqlSymbol.toLowerCase()) {
    case "usdt/usd":
    case "usdt":
      return stablecoinContract.concat("_0");

    case "mvrk/usd":
    case "mvrk":
      return "mav";

    case "ocean/usd":
    case "ocean":
      return OCEAN_TOKEN_ADDRESS.concat("_0");

    case "mars1/usd":
    case "mars1":
      return MARS1_TOKEN_ADDRESS.concat("_0");

    default:
      return null;
  }
};
