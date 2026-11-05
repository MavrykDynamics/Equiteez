import { useEffect, useRef, useState } from "react";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import type { BatchOperationKindType } from "~/contracts/types";
import {
  estimateDirectOrderFee,
  type DirectOrderFee,
} from "~/contracts/directOrderFee";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";

type FeeState =
  | { status: "idle" | "loading" }
  | { status: "error"; reason: string }
  | { status: "ready"; fee: DirectOrderFee };
export function useDirectOrderFee(
  actionKey: string,
  build: (tezos: MavrykToolkit) => Promise<BatchOperationKindType>,
  enabled: boolean
) {
  const payment = useGasPayment();
  const key = JSON.stringify([
    payment.scope,
    payment.method,
    payment.isRestored,
    enabled,
    actionKey,
  ]);
  const currentKey = useRef(key);
  currentKey.current = key;
  useEffect(
    () => () => {
      currentKey.current = "unmounted";
    },
    []
  );
  const buildRef = useRef(build);
  buildRef.current = build;
  const [result, setResult] = useState<{ key: string; state: FeeState }>({
    key: "",
    state: { status: "idle" },
  });
  const [revision, setRevision] = useState(0);
  const canEstimate = Boolean(
    enabled &&
      payment.isRestored &&
      payment.method === "mvrk" &&
      payment.toolkit &&
      payment.wallet
  );
  useEffect(() => {
    if (!canEstimate || !payment.toolkit || !payment.wallet) {
      setResult({ key, state: { status: "idle" } });
      return;
    }
    let cancelled = false;
    const toolkit = payment.toolkit;
    const wallet = payment.wallet;
    setResult({ key, state: { status: "loading" } });
    const timer = window.setTimeout(async () => {
      try {
        const batch = await buildRef.current(toolkit);
        const fee = await estimateDirectOrderFee(toolkit, batch, wallet);
        if (!cancelled) setResult({ key, state: { status: "ready", fee } });
      } catch {
        if (!cancelled)
          setResult({
            key,
            state: {
              status: "error",
              reason:
                "Unable to verify MVRK balance or network fee. Retry the estimate.",
            },
          });
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canEstimate, key, payment.toolkit, payment.wallet, revision]);
  const state: FeeState = !canEstimate
    ? { status: "idle" }
    : result.key === key
      ? result.state
      : { status: "loading" };
  const reason = !payment.isRestored
    ? "Waiting for wallet, network and payment preference."
    : payment.method === "credits"
      ? "Credits trading is not available yet. Choose MVRK in Profile payment settings to trade directly."
      : state.status === "error"
        ? state.reason
        : state.status !== "ready"
          ? "Waiting for a verified MVRK balance and network fee."
          : state.fee.balance.lt(state.fee.totalDebit)
            ? "Insufficient MVRK for network fees and storage costs."
            : undefined;
  const beforeSubmit = async () => {
    if (!payment.toolkit) throw new Error("Wallet is unavailable.");
    const [wallet, chain] = await Promise.all([
      payment.toolkit.wallet.pkh(),
      payment.toolkit.rpc.getChainId(),
    ]);
    if (wallet !== payment.wallet || chain !== payment.chainId)
      throw new Error("Wallet or network changed. Review again.");
    if (currentKey.current !== key)
      throw new Error(
        "Action, wallet or payment method changed. Review again."
      );
    if (reason) throw new Error(reason);
  };
  return {
    state,
    reason,
    // Waiting for an estimate blocks submission but is not an error to show.
    isPending:
      payment.isRestored &&
      payment.method === "mvrk" &&
      (state.status === "idle" || state.status === "loading"),
    beforeSubmit,
    retry: () => setRevision((value) => value + 1),
    method: payment.method,
  };
}
