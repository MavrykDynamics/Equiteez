import { MavrykToolkit } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";
import { basenetNetRpcnode } from "~/consts";
import type { OrderbookContractConfig } from "~/lib/orderbook/orderbookConfig.types";
import { normalizeNat, normalizeTick } from "~/lib/orderbook/orderbookConfig";

const readOnlyToolkit = new MavrykToolkit(basenetNetRpcnode);

export async function readOrderbookConfig(
  address: string
): Promise<OrderbookContractConfig> {
  const contract = await readOnlyToolkit.contract.at(address);
  const config: unknown = await contract.contractViews
    .getConfig()
    .executeView({ viewCaller: address });
  if (!config || typeof config !== "object")
    throw new Error("Contract returned invalid orderbook configuration.");
  const readNat = (field: keyof OrderbookContractConfig) => {
    const raw =
      field in config ? (config as Record<string, unknown>)[field] : undefined;
    const value = BigNumber.isBigNumber(raw) ? raw.toFixed() : raw;
    const normalized =
      field === "tickSize" ? normalizeTick(value) : normalizeNat(value);
    if (normalized === null)
      throw new Error(`Contract returned invalid ${field}.`);
    return normalized;
  };
  return {
    tickSize: readNat("tickSize"),
    minBuyOrderAmount: readNat("minBuyOrderAmount"),
    minBuyOrderValue: readNat("minBuyOrderValue"),
    minSellOrderAmount: readNat("minSellOrderAmount"),
    minSellOrderValue: readNat("minSellOrderValue"),
  };
}
