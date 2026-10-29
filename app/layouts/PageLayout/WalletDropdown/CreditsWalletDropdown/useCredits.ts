import { useContext, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRelayCredits,
  relayConfigQueryOptions,
} from "~/lib/apis/rwa/relay/relay";
import { toTokenSlug } from "~/lib/assets";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { userContext } from "~/providers/UserProvider/user.provider";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import {
  getRelayScopeRevision,
  subscribeRelayScope,
} from "~/lib/relay/relay.scope";
import {
  getCreditsBalanceStatus,
  getCreditsSummary,
  getTopUpProgress,
} from "./credits.utils";

export function useCredits(enabled = true) {
  const payment = useGasPayment();
  const auth = useAuthContext();
  const relay = useRelay();
  const revision = useSyncExternalStore(
    subscribeRelayScope,
    getRelayScopeRevision,
    () => 0
  );
  const authenticated = Boolean(
    enabled &&
      payment.scope &&
      payment.wallet &&
      auth.isAuthenticated &&
      !auth.isAuthLoading &&
      auth.authenticatedWalletAddress === payment.wallet
  );
  const config = useQuery({
    ...relayConfigQueryOptions(payment.scope ?? "unresolved"),
    enabled: authenticated,
    refetchInterval: 60_000,
  });
  const currentConfig = authenticated ? config.data : undefined;
  const canRead =
    authenticated &&
    currentConfig?.state === "ready" &&
    currentConfig.config.enabled &&
    currentConfig.config.fee.enabled;
  const credits = useQuery({
    // Keep the lifecycle's invalidation prefix. Auth transitions and fee-token
    // changes never reuse a prior response, even on an away-and-back switch.
    queryKey: [
      "relay",
      payment.scope,
      "credits",
      revision,
      currentConfig?.config.fee,
    ],
    queryFn: ({ signal }) =>
      fetchRelayCredits(payment.wallet!, currentConfig!.config, signal),
    enabled: Boolean(canRead),
    staleTime: 0,
    refetchInterval: 30_000,
    retry: false,
  });
  const data = canRead ? credits.data : undefined;
  const status = getCreditsBalanceStatus({
    authenticated,
    config: currentConfig,
    credits: data,
    isError: config.isError || (Boolean(canRead) && credits.isError),
  });
  return {
    status,
    config: currentConfig,
    credits: status === "ready" ? data : undefined,
    summary:
      status === "ready"
        ? getCreditsSummary(data, currentConfig?.config.fee)
        : null,
    progress: canRead
      ? getTopUpProgress(relay.records, credits.dataUpdatedAt)
      : null,
    isRefreshing: Boolean(canRead && credits.isFetching),
    canTopUp: Boolean(canRead),
    refresh: () => {
      if (!authenticated) return;
      void config.refetch();
      if (canRead) void credits.refetch();
    },
  };
}

// Wallet balance of the fee token, in whole tokens; null while unknown.
export function useCreditTokenWalletBalance(
  config: ReturnType<typeof useCredits>["config"]
) {
  const user = useContext(userContext);
  if (!user || config?.state !== "ready" || !config.config.fee.enabled)
    return null;
  const { tokenContract, tokenId } = config.config.fee;
  return (
    user.userTokensBalances[toTokenSlug(tokenContract, tokenId)] ??
    user.userTokensBalances[tokenContract] ??
    null
  );
}
