import { useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/index";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
import { getIsKycedForAddress } from "~/providers/UserProvider/helpers/userStatus.helpers";
import { validateOrderPlan } from "~/contracts/orderPlanValidation";
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import type { OrderPlan, OrderPlanRequest } from "~/lib/relay/orderPlan";
import {
  getPermitActionErrorMessage,
  startPermitAction,
} from "~/lib/relay/permitAction";

type Options = {
  request: OrderPlanRequest;
  validationMessage?: string;
  directReason?: string;
  invokeDirect: () => Promise<void>;
  onConfirmed: () => void;
};
/**
 * Mode routing only: direct success stays in useContractAction; relay success
 * requires a confirmed row. Both paths go straight from the caller's confirm
 * click to the wallet prompt, with no plan dialogs.
 */
export function useOrderbookExecution(options: Options) {
  const payment = useGasPayment();
  const relay = useRelay();
  const user = useUserContext();
  const apollo = useApolloClient();
  const { bug } = useToasterContext();
  const [isBusy, setIsBusy] = useState(false);
  const plan = useRef<OrderPlan | null>(null);
  const mounted = useRef(true);
  const current = useRef({ options, relay });
  current.current = { options, relay };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      plan.current?.stop();
    };
  }, []);
  // Relay rows arrive through the provider; the active action settles on them.
  useEffect(() => {
    plan.current?.reconcile();
  }, [relay.records]);
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
    if (isBusy || reason) return;
    if (payment.method === "mvrk") {
      await options.invokeDirect();
      return;
    }
    const runtime = relay.runtime;
    if (!runtime) return;
    const originalKey = JSON.stringify(options.request);
    const assertForm = () => {
      if (JSON.stringify(current.current.options.request) !== originalKey)
        throw new Error(
          "The order or price changed. Review the updated order."
        );
      if (current.current.options.validationMessage)
        throw new Error(current.current.options.validationMessage);
    };
    setIsBusy(true);
    try {
      const { plan: next, done } = startPermitAction(options.request, {
        runtime,
        isLocked: (contract) => current.current.relay.isLocked(contract),
        records: () =>
          current.current.relay.lifecycle?.records ??
          current.current.relay.records,
        submit: (signed, onAttempt) =>
          current.current.relay.submit(signed, onAttempt),
        validate: async (request) => {
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
      await done;
      // Do not erase edits made while the submitted order was being tracked.
      if (
        mounted.current &&
        JSON.stringify(current.current.options.request) === originalKey
      )
        current.current.options.onConfirmed();
    } catch (error) {
      if (mounted.current && !checkWhetherWalletAbortError(error))
        bug(
          getPermitActionErrorMessage(error) ||
            unknownToError(error)?.message ||
            "Unable to complete the action."
        );
    } finally {
      plan.current = null;
      if (mounted.current) setIsBusy(false);
    }
  };
  return { execute, isBusy, reason };
}
