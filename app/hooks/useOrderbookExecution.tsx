import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { RButton } from "~/lib/atoms/RButton";
import { useEffect, useReducer, useRef } from "react";
import { useApolloClient } from "@apollo/client";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
import { getIsKycedForAddress } from "~/providers/UserProvider/helpers/userStatus.helpers";
import { validateOrderPlan } from "~/contracts/orderPlanValidation";
import { OrderPlan, type OrderPlanRequest } from "~/lib/relay/orderPlan";
import { ROrderPlan } from "~/lib/organisms/ROrderPlan/ROrderPlan";

type Options = {
  showSignIn?: boolean;
  request: OrderPlanRequest;
  validationMessage?: string;
  directReason?: string;
  invokeDirect: () => Promise<void>;
  onConfirmed: () => void;
};
/** Mode routing only: direct success stays in useContractAction; relay success requires a confirmed row. */
export function useOrderbookExecution(options: Options) {
  const auth = useAuthContext();
  const payment = useGasPayment();
  const relay = useRelay();
  const user = useUserContext();
  const apollo = useApolloClient();
  const [, render] = useReducer((n) => n + 1, 0);
  const plan = useRef<OrderPlan | null>(null);
  const mounted = useRef(true);
  const current = useRef({ options, relay, payment });
  current.current = { options, relay, payment };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      plan.current?.stop();
    };
  }, []);
  useEffect(() => {
    plan.current?.reconcile();
  }, [relay.records]);
  const active = plan.current;
  const isBusy = Boolean(
    active && !["failed", "confirmed", "idle"].includes(active.state)
  );
  const reason =
    options.validationMessage ??
    (!payment.isRestored
      ? "Waiting for wallet and saved payment settings."
      : payment.method === "mvrk"
        ? options.directReason
        : !user.isKyced
          ? "Verify with Mavryk Pro before trading."
          : !relay.isReady
            ? (relay.error ??
              "Connect and sign in; waiting for relay recovery.")
            : undefined);
  const execute = async () => {
    if (isBusy) return;
    if (reason) return;
    if (payment.method === "mvrk") {
      try {
        // A failed relay is not a direct retry: refresh the underlying action first.
        if (active?.state === "failed") {
          if (!relay.runtime)
            throw new Error("Reconnect before reviewing this action.");
          const scope = JSON.stringify(relay.runtime.getScope());
          const action = JSON.stringify(options.request);
          await user.refetchUserAccountStatus();
          await user.refetchUserBalances?.();
          await validateOrderPlan(relay.runtime, options.request);
          if (
            JSON.stringify(relay.runtime.getScope()) !== scope ||
            JSON.stringify(current.current.options.request) !== action ||
            current.current.payment.method !== "mvrk"
          )
            throw new Error(
              "Action, wallet or payment method changed. Review again."
            );
        }
        await options.invokeDirect();
      } catch (error) {
        startError.current =
          error instanceof Error
            ? error.message
            : "Unable to refresh the action.";
        render();
      }
      return;
    }
    const runtime = relay.runtime;
    if (!runtime) return;
    try {
      plan.current?.stop();
      const originalKey = JSON.stringify(options.request);
      const next = new OrderPlan(options.request, {
        runtime,
        isLocked: (contract) => current.current.relay.isLocked(contract),
        records: () =>
          current.current.relay.lifecycle?.records ??
          current.current.relay.records,
        submit: (signed, onAttempt) =>
          current.current.relay.submit(signed, onAttempt),
        changed: () => {
          if (mounted.current) render();
        },
        confirmed: () => {
          // Do not erase edits made while the submitted order was being tracked.
          if (JSON.stringify(current.current.options.request) === originalKey)
            current.current.options.onConfirmed();
        },
        validate: async (request) => {
          const assertForm = () => {
            if (JSON.stringify(current.current.options.request) !== originalKey)
              throw new Error(
                "The order or price changed. Close this plan and review the updated order."
              );
            if (current.current.options.validationMessage)
              throw new Error(current.current.options.validationMessage);
          };
          assertForm();
          const scope = JSON.stringify(runtime.getScope());
          const wallet = runtime.getScope().wallet;
          const { data } = await apollo.query({
            query: USER_ACCOUNT_STATUS_QUERY,
            variables: { address: wallet },
            fetchPolicy: "network-only",
          });
          if (JSON.stringify(runtime.getScope()) !== scope)
            throw new Error("Wallet changed. Review again.");
          if (!getIsKycedForAddress(data, wallet))
            throw new Error("Verify with Mavryk Pro before trading.");
          await validateOrderPlan(runtime, request);
          assertForm();
        },
      });
      plan.current = next;
      await next.review();
    } catch (error) {
      // Scope may disappear before the plan is constructed.
      startError.current =
        error instanceof Error ? error.message : "Unable to start review.";
      render();
    }
  };
  const startError = useRef<string | null>(null);
  return {
    execute,
    isBusy,
    reason: reason ?? startError.current ?? undefined,
    controls: active ? (
      <ROrderPlan
        plan={active}
        runtime={relay.runtime}
        onClose={() => {
          active.stop();
          plan.current = null;
          startError.current = null;
          render();
        }}
      />
    ) : options.showSignIn !== false &&
      payment.method === "credits" &&
      !auth.isAuthenticated ? (
      <RButton
        onClick={() => {
          void auth.login().catch(() => {
            startError.current = "Sign-in failed. Try again.";
            render();
          });
        }}
      >
        Sign in to use Credits
      </RButton>
    ) : startError.current ? (
      <RButton
        onClick={() => {
          startError.current = null;
          render();
        }}
      >
        Retry review
      </RButton>
    ) : null,
  };
}
