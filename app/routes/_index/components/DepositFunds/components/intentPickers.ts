import type { IntentSourceOption } from "~/lib/intents/intentCatalog";
import {
  INTENT_NETWORKS,
  type IntentNetwork,
} from "~/lib/intents/intentNetworks";

/** A source network in the picker with the assets offered on it now. */
export type IntentNetworkGroup = {
  network: IntentNetwork;
  /** Asset symbols in metadata order, without duplicates. */
  symbols: string[];
  options: IntentSourceOption[];
};

/**
 * Groups the source assets by network. Networks follow the static table
 * order (EVM first); assets keep metadata order. Networks without assets are
 * left out: metadata already drops everything unavailable.
 */
export function groupIntentNetworks(
  options: readonly IntentSourceOption[]
): IntentNetworkGroup[] {
  const groups = new Map<string, IntentNetworkGroup>();
  for (const option of options) {
    const group = groups.get(option.network.key) ?? {
      network: option.network,
      symbols: [],
      options: [],
    };
    group.options.push(option);
    if (!group.symbols.includes(option.asset.symbol))
      group.symbols.push(option.asset.symbol);
    groups.set(option.network.key, group);
  }
  return INTENT_NETWORKS.flatMap((network) => groups.get(network.key) ?? []);
}

/**
 * Symbols are not unique, even on one network: a duplicate shows its
 * contract so the user can tell them apart.
 */
export function getIntentTokenTitle(
  option: IntentSourceOption,
  options: readonly IntentSourceOption[]
) {
  const { symbol, contractAddress } = option.asset;
  const isDuplicate = options.some(
    (item) =>
      item !== option &&
      item.network.key === option.network.key &&
      item.asset.symbol === symbol
  );
  return isDuplicate && contractAddress
    ? `${symbol} (${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)})`
    : symbol;
}

export const getIntentTokenSubtitle = (option: IntentSourceOption) =>
  option.asset.kind === "native"
    ? `${option.network.name} · native`
    : option.network.name;
