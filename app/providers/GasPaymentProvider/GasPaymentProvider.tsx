import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { rwaApiUrl } from "~/lib/apis/rwa/config";
import {
  preferenceKey,
  readPreference,
  writePreference,
  type GasPaymentMethod,
} from "./paymentPreference";

function usePaymentPreference() {
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
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
  const [saved, setSaved] = useState<{
    scope: string | null;
    method: GasPaymentMethod;
    explicit: boolean;
    error: string | null;
  }>({ scope: null, method: "credits", explicit: false, error: null });
  useEffect(() => {
    if (!scope) return;
    const restore = () => {
      try {
        const record = readPreference(window.localStorage, scope);
        setSaved({
          scope,
          method: record?.method ?? "credits",
          explicit: Boolean(record),
          error: null,
        });
      } catch {
        setSaved({
          scope,
          method: "credits",
          explicit: false,
          error:
            "Payment preference could not be restored. Choose a method and Save to retry.",
        });
      }
    };
    restore();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === preferenceKey(scope) || event.key === null) restore();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [scope]);
  const isRestored = Boolean(scope && saved.scope === scope);
  const save = (method: GasPaymentMethod) => {
    if (!scope || !isRestored) return false;
    try {
      writePreference(window.localStorage, scope, method);
      setSaved({ scope, method, explicit: true, error: null });
      return true;
    } catch {
      setSaved((previous) => ({
        ...previous,
        error:
          "Payment preference could not be saved. Allow browser storage and retry Save.",
      }));
      return false;
    }
  };
  return {
    method: isRestored ? saved.method : ("credits" as GasPaymentMethod),
    isExplicit: isRestored && saved.explicit,
    isRestored,
    error: chain.isError
      ? "Network could not be verified. Retry network verification."
      : isRestored
        ? saved.error
        : null,
    scope,
    toolkit,
    wallet: userAddress,
    chainId: chain.data,
    save,
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
