import { MavrykToolkit } from "@mavrykdynamics/taquito";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";

import { basenetNetRpcnode } from "~/consts";
import { atomsToTokens } from "~/lib/utils/formaters";
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

export const getDisplayTickSize = (
  rawTickSize: BigNumber.Value,
  quoteTokenDecimals: number
): BigNumber => {
  const displayTickSize = atomsToTokens(rawTickSize, quoteTokenDecimals);

  return displayTickSize.isFinite() && displayTickSize.gt(0)
    ? displayTickSize
    : new BigNumber(0);
};

export const isPriceAlignedToTickSize = ({
  price,
  rawTickSize,
  quoteTokenDecimals,
}: {
  price: BigNumber.Value | undefined;
  rawTickSize: BigNumber.Value;
  quoteTokenDecimals: number;
}): boolean => {
  if (price === undefined) return true;

  const value = new BigNumber(price);
  const tickSize = new BigNumber(rawTickSize);

  if (!value.isFinite() || value.lte(0)) return true;
  if (!tickSize.isFinite() || tickSize.lte(0)) return true;

  const rawPrice = value.times(new BigNumber(10).pow(quoteTokenDecimals));

  return rawPrice.mod(tickSize).isZero();
};
