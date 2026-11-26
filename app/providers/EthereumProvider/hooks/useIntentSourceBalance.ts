import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { erc20Abi, type Address } from "viem";
import { usePublicClient } from "wagmi";

import {
  getIntentWalletAsset,
  type IntentSourceOption,
} from "~/lib/intents/intentCatalog";
import { useIntentWalletsContext } from "~/providers/IntentWalletsProvider/IntentWalletsProvider";

export type IntentSourceBalanceStatus =
  | "disconnected"
  | "unsupported"
  | "loading"
  | "error"
  | "ready";

/**
 * Balance of a source asset in the wallet that sends it. EVM assets are read
 * through that chain's public client (no network switch needed); Solana,
 * NEAR, Aptos and Bitcoin assets through their wallet adapter's network
 * reads. `owner` is the sending wallet's address on the asset's network.
 */
export function useIntentSourceBalance(
  option: IntentSourceOption | undefined,
  owner: string | null
) {
  const family = option?.network.family;
  const isEvm = family === "evm";
  const chainId = isEvm ? (option?.network.evmChainId ?? undefined) : undefined;
  const client = usePublicClient({ chainId });
  const wallets = useIntentWalletsContext();
  const token = option?.evmToken;
  const isRouteSupported = option
    ? isEvm
      ? Boolean(token && chainId)
      : wallets.isSupported(option.network.family)
    : false;
  const enabled = Boolean(
    option && owner && isRouteSupported && (!isEvm || client)
  );

  const query = useQuery({
    queryKey: ["intents", "balance", option?.assetId, owner],
    enabled,
    refetchInterval: 15_000,
    retry: 1,
    queryFn: async () => {
      if (!option || !owner) throw new Error("Source wallet is unavailable.");
      if (!isEvm) {
        if (!wallets.isSupported(option.network.family))
          throw new Error("Wallets for this network are not supported.");
        const adapter = await wallets.getAdapter(option.network.family);
        const balance = await adapter.getBalance(
          getIntentWalletAsset(option),
          owner
        );
        return balance.toString();
      }
      if (!client || !token) throw new Error("Source wallet is unavailable.");
      const raw =
        token === "native"
          ? await client.getBalance({ address: owner as Address })
          : await client.readContract({
              address: token,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [owner as Address],
            });
      return raw.toString();
    },
  });

  const status: IntentSourceBalanceStatus = !owner
    ? "disconnected"
    : !isRouteSupported
      ? "unsupported"
      : query.isError
        ? "error"
        : query.isPending
          ? "loading"
          : "ready";
  const decimals = option?.asset.decimals ?? 18;
  const balance = useMemo(
    () =>
      status === "ready" && query.data !== undefined
        ? new BigNumber(query.data).shiftedBy(-decimals)
        : undefined,
    [decimals, query.data, status]
  );

  return { balance, rawBalance: query.data, status, refetch: query.refetch };
}
