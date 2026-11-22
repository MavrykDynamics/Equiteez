import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { erc20Abi, type Address } from "viem";
import { usePublicClient } from "wagmi";

import type { IntentRouteSource } from "~/lib/intents/intentRoute";

export type IntentSourceBalanceStatus =
  | "disconnected"
  | "unsupported"
  | "loading"
  | "error"
  | "ready";

/**
 * Source balance on the route's chain, read through that chain's public client
 * so the wallet does not need to switch networks just to display it.
 */
export function useIntentSourceBalance(
  source: IntentRouteSource | undefined,
  owner: Address | null,
  isRouteSupported: boolean
) {
  const chainId = source?.chainId;
  const client = usePublicClient({ chainId });
  const token = source?.token;
  const enabled = Boolean(source && owner && isRouteSupported && client);

  const query = useQuery({
    queryKey: ["ethereum", "balance", chainId, token, owner],
    enabled,
    refetchInterval: 15_000,
    retry: 1,
    queryFn: async () => {
      if (!client || !owner || !token)
        throw new Error("Source wallet is unavailable.");
      const raw =
        token === "native"
          ? await client.getBalance({ address: owner })
          : await client.readContract({
              address: token,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [owner],
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
  const decimals = source?.decimals ?? 18;
  const balance = useMemo(
    () =>
      status === "ready" && query.data !== undefined
        ? new BigNumber(query.data).shiftedBy(-decimals)
        : undefined,
    [decimals, query.data, status]
  );

  return { balance, rawBalance: query.data, status, refetch: query.refetch };
}
