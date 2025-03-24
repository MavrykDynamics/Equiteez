import { MarketConfig } from "../market.types";
import {
  GQL_DodoMavConfigType,
  GQL_OrderbookConfigType,
} from "../market.schemas";

export function getUpdatedDodoMavMarketsConfig(
  dodoMavConfig: MarketConfig["dodoMav"],
  gqlData: GQL_DodoMavConfigType[]
) {
  if (gqlData.length === 0) {
    return dodoMavConfig;
  }

  const updatedDodoMavConfig = new Map(dodoMavConfig);

  gqlData.forEach((dodoMavItem) => {
    updatedDodoMavConfig.set(dodoMavItem.address, {
      address: dodoMavItem.address,
      baseTokenAddress: dodoMavItem.base_token.address,
      quoteTokenAddress: dodoMavItem.quote_token.address,
      quoteLpTokenAddress: dodoMavItem.quote_lp_token.address,
      baseLpTokenAddress: dodoMavItem.base_lp_token.address,
    });
  });

  return updatedDodoMavConfig;
}

export function getUpdatedOrderbookMarketsConfig(
  orderbookConfig: MarketConfig["orderbook"],
  gqlData: GQL_OrderbookConfigType[]
) {
  const updatedOrderbookConfig = new Map(orderbookConfig);
  gqlData.forEach((orderbookItem) => {
    updatedOrderbookConfig.set(orderbookItem.address, {
      address: orderbookItem.address,
      rwaTokenAddress: orderbookItem.rwa_token.address,
    });
  });

  return updatedOrderbookConfig;
}
