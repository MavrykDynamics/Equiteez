import { useCallback, useMemo, useState } from "react";
import type { BigNumber } from "bignumber.js";
import { useSwitchChain } from "wagmi";

import { useIntentsRoutes } from "~/hooks/useIntentsRoutes";
import {
  getIntentAmountError,
  intentRouteAvailabilityCopy,
} from "~/lib/intents/intentRoute";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { useIntentSourceBalance } from "~/providers/EthereumProvider/hooks/useIntentSourceBalance";

type Params = {
  /** Active Equiteez Mavryk account: the only recipient this flow supports. */
  recipient: string | null;
  ethereumWallet: EthereumContext;
};

/** Orchestrates the 1Click deposit inside Deposit Funds. */
export function useIntentsDeposit({ recipient, ethereumWallet }: Params) {
  const catalog = useIntentsRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const selected = useMemo(
    () =>
      catalog.options.find((option) => option.route.id === selectedRouteId) ??
      catalog.options.find((option) => option.availability === "available") ??
      catalog.options[0],
    [catalog.options, selectedRouteId]
  );
  const route = selected?.route;
  const isRouteAvailable = selected?.availability === "available";
  const sourceAddress = ethereumWallet.userAddress;
  const sourceBalance = useIntentSourceBalance(
    route,
    sourceAddress,
    isRouteAvailable
  );
  const isWrongNetwork = Boolean(
    route &&
      ethereumWallet.isConnected &&
      ethereumWallet.chainId !== route.source.chainId
  );
  const routeError =
    selected && selected.availability !== "available"
      ? intentRouteAvailabilityCopy[selected.availability]
      : null;
  const amountError = route
    ? getIntentAmountError(route, amount, sourceBalance.balance)
    : null;
  const canReview = Boolean(
    route &&
      isRouteAvailable &&
      recipient &&
      sourceAddress &&
      !amountError &&
      sourceBalance.status === "ready"
  );

  const selectRoute = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
    setAmount(undefined);
    setNetworkError(null);
  }, []);

  const switchToSource = useCallback(async () => {
    if (!route) return;
    setNetworkError(null);
    try {
      await switchChainAsync({ chainId: route.source.chainId });
    } catch {
      setNetworkError(
        `Unable to switch networks. Select ${route.source.chainName} in your wallet and try again.`
      );
    }
  }, [route, switchChainAsync]);

  const resetForm = useCallback(() => {
    setAmount(undefined);
    setNetworkError(null);
  }, []);

  return {
    catalog,
    selected,
    route,
    routeError,
    recipient,
    sourceAddress,
    sourceBalance,
    amount,
    setAmount,
    amountError,
    canReview,
    isWrongNetwork,
    isSwitching,
    networkError,
    selectRoute,
    switchToSource,
    resetForm,
  };
}

export type IntentsDepositController = ReturnType<typeof useIntentsDeposit>;
