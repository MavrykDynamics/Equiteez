import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi, type Address } from "viem";
import { usePublicClient } from "wagmi";
import { BigNumber } from "bignumber.js";

import { ETHEREUM_CHAIN, ETHEREUM_DEPOSIT_TOKEN } from "../ethereum.config";
import type { EthereumBalanceStatus } from "../ethereum.provider.types";

export function useEthereumDepositAsset(
  userAddress: Address | undefined,
  isConnected: boolean,
  isWrongNetwork: boolean
) {
  const client = usePublicClient({ chainId: ETHEREUM_CHAIN.id });
  const isEnabled = Boolean(userAddress && isConnected && !isWrongNetwork);

  const metadataQuery = useQuery({
    queryKey: [
      "ethereum",
      "tokenMetadata",
      ETHEREUM_CHAIN.id,
      ETHEREUM_DEPOSIT_TOKEN.address,
    ],
    enabled: isEnabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      if (!client) throw new Error("Ethereum client is unavailable.");

      const contract = {
        address: ETHEREUM_DEPOSIT_TOKEN.address,
        abi: erc20Abi,
      };
      const [name, symbol, decimals] = await Promise.all([
        client.readContract({ ...contract, functionName: "name" }),
        client.readContract({ ...contract, functionName: "symbol" }),
        client.readContract({ ...contract, functionName: "decimals" }),
      ]);

      return {
        address: ETHEREUM_DEPOSIT_TOKEN.address,
        name,
        symbol,
        decimals,
      };
    },
  });

  const balanceQuery = useQuery({
    queryKey: [
      "ethereum",
      "balance",
      ETHEREUM_CHAIN.id,
      ETHEREUM_DEPOSIT_TOKEN.address,
      userAddress,
    ],
    enabled: isEnabled,
    refetchInterval: 15_000,
    retry: 1,
    queryFn: async () => {
      if (!client || !userAddress)
        throw new Error("Ethereum wallet is unavailable.");

      const balance = await client.readContract({
        address: ETHEREUM_DEPOSIT_TOKEN.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userAddress],
      });

      // Keep raw units as a string: JS numbers cannot preserve ERC20 precision.
      return balance.toString();
    },
  });

  const balanceStatus: EthereumBalanceStatus = !isConnected
    ? "disconnected"
    : isWrongNetwork
      ? "wrongNetwork"
      : metadataQuery.isError || balanceQuery.isError
        ? "error"
        : metadataQuery.isPending || balanceQuery.isPending
          ? "loading"
          : "ready";

  const tokenMetadata = metadataQuery.data ?? ETHEREUM_DEPOSIT_TOKEN;
  const tokenBalance = useMemo(
    () =>
      balanceStatus === "ready" && balanceQuery.data !== undefined
        ? new BigNumber(balanceQuery.data).shiftedBy(-tokenMetadata.decimals)
        : undefined,
    [balanceQuery.data, balanceStatus, tokenMetadata.decimals]
  );

  const { refetch: refetchMetadata } = metadataQuery;
  const { refetch: refetchBalance } = balanceQuery;
  const refreshBalance = useCallback(async () => {
    if (!isEnabled) return;
    // React Query owns error state; failed refreshes make the balance unavailable.
    await Promise.all([refetchMetadata(), refetchBalance()]);
  }, [isEnabled, refetchBalance, refetchMetadata]);

  return useMemo(
    () => ({ tokenMetadata, tokenBalance, balanceStatus, refreshBalance }),
    [tokenMetadata, tokenBalance, balanceStatus, refreshBalance]
  );
}
