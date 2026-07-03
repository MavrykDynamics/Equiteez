import { stablecoinContract } from "~/consts/contracts";
import { MarketInternalStateType } from "../market.types";

/**
 * create dynamic pickers to get contract addresses based on token addresses for contract calls
 * @param config market config from ctx
 */
export const createMarketPickers = (
  config: MarketInternalStateType["config"]
) => {
  const { orderbook } = config;

  const pickOrderbookContract = Array.from(orderbook.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.rwaTokenAddress] = curr.address;
    return acc;
  }, {});

  const pickOrderbookToken = Array.from(orderbook.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.address] = curr.rwaTokenAddress;
    return acc;
  }, {});

  const pickOrderbookContractQuoteToken = Array.from(orderbook.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.rwaTokenAddress] =
      curr.currencies?.[0]?.token.address ?? stablecoinContract;
    return acc;
  }, {});

  return {
    pickOrderbookContract,
    pickOrderbookContractQuoteToken,
    pickOrderbookToken,
  };
};

/**
 * used to flter tokens from gql, cuz at the moment there are over 10 mocked markets
 * without real contracts (u cant buy or sell tokens at those markets)
 * @param config market config from ctx
 * @returns valid tokens record
 */
export const createValidTokensRecord = (
  config: MarketInternalStateType["config"]["orderbook"]
) => {
  const validTokensObj = Array.from(config.values()).reduce<
    StringRecord<boolean>
  >((acc, curr) => {
    acc[curr.rwaTokenAddress] = true;
    acc[curr.currencies[0]?.token?.address] = true;
    return acc;
  }, {});

  return new Proxy(validTokensObj, {
    get(target, prop: string) {
      // Return false if the property does not exist on the target object
      return prop in target
        ? target[prop as keyof typeof validTokensObj]
        : false;
    },
  });
};
