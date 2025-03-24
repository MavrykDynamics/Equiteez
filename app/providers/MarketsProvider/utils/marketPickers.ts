import { MarketInternalStateType } from "../market.types";

/**
 * create dynamic pickers to get contract addresses based on token addresses for contract calls
 * @param config market config from ctx
 */
export const createMarketPickers = (
  config: MarketInternalStateType["config"]
) => {
  const { dodoMav, orderbook } = config;

  const pickOrderbookContract = Array.from(orderbook.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.rwaTokenAddress] = curr.address;
    return acc;
  }, {});

  const pickDodoContractBasedOnToken = Array.from(dodoMav.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.baseTokenAddress] = curr.address;
    return acc;
  }, {});

  const pickDodoContractQuoteToken = Array.from(dodoMav.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.baseTokenAddress] = curr.quoteTokenAddress;
    return acc;
  }, {});

  const pickMockBaseToken = Array.from(dodoMav.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.baseTokenAddress] = curr.baseLpTokenAddress;
    return acc;
  }, {});

  const pickMockQuoteToken = Array.from(dodoMav.values()).reduce<
    StringRecord<string>
  >((acc, curr) => {
    acc[curr.baseTokenAddress] = curr.quoteLpTokenAddress;
    return acc;
  }, {});

  return {
    pickOrderbookContract,
    pickDodoContractBasedOnToken,
    pickMockBaseToken,
    pickMockQuoteToken,
    pickDodoContractQuoteToken,
  };
};

/**
 * used to flter tokens from gql, cuz at the moment there are over 10 mocked markets
 * without real contracts (u cant buy or sell tokens at those markets)
 * @param config market config from ctx
 * @returns valid tokens record
 */
export const createValidTokensRecord = (
  config: MarketInternalStateType["config"]["dodoMav"]
) => {
  const validTokensObj = Array.from(config.values()).reduce<
    StringRecord<boolean>
  >((acc, curr) => {
    acc[curr.baseTokenAddress] = true;
    acc[curr.quoteTokenAddress] = true;
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
