import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { rwaApiUrl } from "~/lib/apis/rwa/config";
import {
  fetchPaymentPreference,
  savePaymentPreference,
  toPaymentPreferenceError,
} from "~/lib/apis/rwa/paymentPreference/paymentPreference";
import type {
  GasPaymentMethod,
  PaymentPreference,
} from "~/lib/apis/rwa/paymentPreference/paymentPreference.types";

export const paymentPreferenceQueryKey = (wallet: string | null | undefined) =>
  ["payment-preference", rwaApiUrl, wallet] as const;
const loadError = (kind: string) =>
  kind === "unauthorized"
    ? "Sign in with your wallet to load payment settings."
    : "Payment settings could not be loaded. Retry loading.";

function usePaymentPreference() {
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const auth = useAuthContext();
  const queryClient = useQueryClient();
  const toolkit = useMemo(() => dapp?.tezos(), [dapp]);
  const rpc = toolkit?.rpc.getRpcUrl();
  const chain = useQuery({
    queryKey: ["payment-network", rpc],
    queryFn: () => toolkit!.rpc.getChainId(),
    enabled: Boolean(toolkit && userAddress),
    retry: false,
    staleTime: 30_000,
  });
  const scope =
    userAddress && rpc && chain.data && !chain.isError
      ? JSON.stringify([1, "basenet", rpc, chain.data, rwaApiUrl, userAddress])
      : null;
  // The API requires the JWT of the same wallet, so never read another account's choice.
  const isAuthorized = Boolean(
    userAddress &&
      auth.isAuthenticated &&
      !auth.isAuthLoading &&
      auth.authenticatedWalletAddress === userAddress
  );
  const preference = useQuery({
    queryKey: paymentPreferenceQueryKey(userAddress),
    queryFn: ({ signal }) => fetchPaymentPreference(userAddress!, signal),
    enabled: isAuthorized,
    retry: false,
  });
  // The last real server value survives a failed background refetch; no default is fabricated.
  const saved = isAuthorized ? preference.data : undefined;
  const [saveError, setSaveError] = useState<{
    wallet: string | null | undefined;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // A ref, not state: two clicks in one render must not send two PUTs with the same version.
  const saving = useRef(false);
  const isRestored = Boolean(scope && saved);
  const save = async (method: GasPaymentMethod) => {
    if (!isRestored || !saved || !userAddress || saving.current) return false;
    saving.current = true;
    setIsSaving(true);
    const wallet = userAddress;
    const key = paymentPreferenceQueryKey(wallet);
    setSaveError(null);
    try {
      const next = await savePaymentPreference(wallet, {
        method,
        expectedVersion: saved.version,
      });
      queryClient.setQueryData<PaymentPreference>(key, next);
      return true;
    } catch (error) {
      const failure = toPaymentPreferenceError(error);
      const fail = (message: string) => {
        setSaveError({ wallet, message });
        return false;
      };
      if (failure.kind === "conflict") {
        await queryClient.refetchQueries({ queryKey: key, exact: true });
        return fail(
          "Payment method was changed on another device. Review the reloaded choice and Save again."
        );
      }
      if (failure.kind === "unknown") {
        // A timeout may follow a committed write: read it back instead of re-sending.
        await queryClient.refetchQueries({ queryKey: key, exact: true });
        const current = queryClient.getQueryData<PaymentPreference>(key);
        if (
          current?.method === method &&
          (current.version > saved.version || saved.method === method)
        )
          return true;
        return fail(
          "Save could not be confirmed. The current saved choice was reloaded; review it and Save again."
        );
      }
      if (failure.kind === "unauthorized")
        return fail("Sign in with your wallet to save payment settings.");
      if (failure.kind === "unavailable")
        return fail(
          "Payment settings are temporarily unavailable. Retry Save."
        );
      return fail("Payment method could not be saved. Retry Save.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };
  const error = chain.isError
    ? "Network could not be verified. Retry network verification."
    : preference.isError && isAuthorized
      ? loadError(toPaymentPreferenceError(preference.error).kind)
      : saveError && saveError.wallet === userAddress
        ? saveError.message
        : null;
  // Conflict and unconfirmed Saves already reloaded; Save itself is their retry.
  const errorAction = chain.isError
    ? ("retry-network" as const)
    : preference.isError && isAuthorized
      ? ("reload" as const)
      : null;
  return {
    method: isRestored ? saved!.method : ("credits" as GasPaymentMethod),
    isExplicit: isRestored && saved!.source !== "default",
    isRestored,
    isSaving,
    version: isRestored ? saved!.version : null,
    updatedAt: isRestored ? saved!.updatedAt : null,
    error,
    errorAction,
    needsSignIn: Boolean(userAddress && !auth.isAuthLoading && !isAuthorized),
    scope,
    toolkit,
    wallet: userAddress,
    chainId: chain.data,
    save,
    reload: () => void preference.refetch(),
    retryNetwork: () => void chain.refetch(),
  };
}
const GasPaymentContext = createContext<ReturnType<
  typeof usePaymentPreference
> | null>(null);
export function GasPaymentProvider({ children }: React.PropsWithChildren) {
  const value = usePaymentPreference();
  return (
    <GasPaymentContext.Provider value={value}>
      {children}
    </GasPaymentContext.Provider>
  );
}
export function useGasPayment() {
  const context = useContext(GasPaymentContext);
  if (!context) throw new Error("useGasPayment requires GasPaymentProvider");
  return context;
}
