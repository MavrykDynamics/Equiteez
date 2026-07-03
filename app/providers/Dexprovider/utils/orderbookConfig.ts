import { MavrykToolkit } from "@mavrykdynamics/taquito";
import BigNumber from "bignumber.js";

import { basenetNetRpcnode } from "~/consts";
import type { OrderbookConfigType } from "~/providers/MarketsProvider/market.types";

export type OrderbookTickSizesByAddress = StringRecord<number>;

type OrderbookConfigView = {
  tickSize: BigNumber.Value;
};

const readOnlyMavrykToolkit = new MavrykToolkit(basenetNetRpcnode);

const readOrderbookTickSize = async (address: string) => {
  const contract = await readOnlyMavrykToolkit.contract.at(address);
  const config = (await contract.contractViews.getConfig().executeView({
    viewCaller: address,
  })) as OrderbookConfigView;
  const tickSize = new BigNumber(config.tickSize);

  if (!tickSize.isFinite() || tickSize.lte(0)) {
    throw new Error(`Invalid orderbook tick size for ${address}`);
  }

  return tickSize.toNumber();
};

export const getOrderbookTickSizes = async (
  storagesMap: Map<string, OrderbookConfigType>
) => {
  const entries = await Promise.all(
    Array.from(storagesMap.values()).map(
      async ({ address }): Promise<[string, number]> => [
        address,
        await readOrderbookTickSize(address),
      ]
    )
  );

  return Object.fromEntries(entries) as OrderbookTickSizesByAddress;
};
