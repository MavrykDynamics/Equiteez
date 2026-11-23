import {
  intentRouteAvailabilityCopy,
  type IntentRouteOption,
} from "~/lib/intents/intentRoute";

/** A source network in the picker: every route that starts on its chain. */
export type IntentNetwork = {
  chainId: string;
  name: string;
  /** Source token symbols of the available routes, in catalog order. */
  symbols: string[];
  options: IntentRouteOption[];
  isAvailable: boolean;
  /** Why no route on this network can be used. */
  unavailableReason?: string;
};

const reasonOf = (option: IntentRouteOption) =>
  option.availability === "available"
    ? undefined
    : intentRouteAvailabilityCopy[option.availability];

export const getIntentNetworkName = (option: IntentRouteOption) =>
  option.source?.chainName ?? `Chain ${option.route.sourceChainId}`;

/** Groups the flat route catalog by source chain, keeping catalog order. */
export function groupIntentNetworks(
  options: readonly IntentRouteOption[]
): IntentNetwork[] {
  const networks = new Map<string, IntentNetwork>();
  for (const option of options) {
    const chainId = option.route.sourceChainId;
    const network = networks.get(chainId) ?? {
      chainId,
      name: getIntentNetworkName(option),
      symbols: [],
      options: [],
      isAvailable: false,
    };
    // A route without metadata has no chain name; a later one may supply it.
    if (option.source && !network.options.some((item) => item.source))
      network.name = option.source.chainName;
    network.options.push(option);
    const symbol = option.source?.symbol;
    if (
      option.availability === "available" &&
      symbol &&
      !network.symbols.includes(symbol)
    )
      network.symbols.push(symbol);
    network.isAvailable ||= option.availability === "available";
    networks.set(chainId, network);
  }
  return [...networks.values()].map((network) =>
    network.isAvailable
      ? network
      : { ...network, unavailableReason: reasonOf(network.options[0]) }
  );
}

/** First usable route of a network, used when the user picks the network. */
export const getNetworkDefaultOption = (network: IntentNetwork) =>
  network.options.find((option) => option.availability === "available") ??
  network.options[0];

export const getIntentTokenTitle = (option: IntentRouteOption) =>
  option.source?.symbol ?? `Route ${option.route.id}`;

export const getIntentTokenReason = reasonOf;
