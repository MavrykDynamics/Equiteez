import { useCallback } from "react";
import { BigNumber } from "bignumber.js";
import { preparePermit, signPreparedPermit } from "~/contracts/permit";
import { checkWhetherWalletAbortError } from "~/errors/error";
import { RelayApiError } from "~/lib/relay/relay.errors";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";

const TOP_UP_ERRORS: Record<string, string> = {
  PERMIT_EXPIRED:
    "The signature expired before it was processed. Add Gas Credits again to sign a new request.",
  PAYMENT_METHOD_MISMATCH:
    "Your saved payment method is MVRK. Switch to Credits in Payment settings to add Gas Credits.",
  PERMIT_IN_FLIGHT:
    "Another Gas Station action on this token is still processing. Try again once it finishes.",
  AMOUNT_OUT_OF_BOUNDS: "This amount is outside the allowed top-up range.",
  FEE_DISABLED: "Service fees are off, so Gas Credits are not needed.",
};

export function getTopUpErrorMessage(error: unknown) {
  if (checkWhetherWalletAbortError(error))
    return "Signature request was rejected. No payment was made.";
  if (error instanceof RelayApiError) {
    if (TOP_UP_ERRORS[error.code]) return TOP_UP_ERRORS[error.code];
    // No answer, or a server failure: the top-up may still have been received.
    if (!error.status || error.status >= 500)
      return "We couldn't confirm that the top-up was received. We're checking its status, so don't add Gas Credits again until it finishes.";
    return error.serverMessage ?? `Top-up failed (${error.code}).`;
  }
  return error instanceof Error ? error.message : "Top-up failed.";
}

/** Signs and submits one fee-token top-up for the exact reviewed amount. */
export function useAddCredits() {
  const relay = useRelay();
  const payment = useGasPayment();
  const { runtime, isReady, isLocked, submitTopUp } = relay;
  const { reload } = payment;

  return useCallback(
    async (amount: BigNumber) => {
      try {
        if (!runtime)
          throw new Error("Connect and sign in to add Gas Credits.");
        if (!isReady)
          throw new Error(
            "Gas Station activity is still syncing. Try again in a moment."
          );
        const config = await runtime.refreshConfig();
        if (!config.enabled || !config.fee.enabled)
          throw new Error("Gas Credits top-up is unavailable right now.");
        if (isLocked(config.fee.tokenContract))
          throw new Error(
            "A previous top-up or token permission is still processing. Wait for it to finish before adding more."
          );
        const amountUnits = new BigNumber(amount).shiftedBy(
          config.fee.decimals
        );
        if (!amountUnits.isInteger() || amountUnits.lte(0))
          throw new Error("Enter a valid top-up amount.");

        const prepared = await preparePermit(runtime, {
          kind: "fee_top_up",
          amountUnits: amountUnits.toFixed(),
        });
        const signed = await signPreparedPermit(runtime, prepared);
        await submitTopUp(signed);
      } catch (error) {
        if (
          error instanceof RelayApiError &&
          error.code === "PAYMENT_METHOD_MISMATCH"
        )
          reload();
        throw new Error(getTopUpErrorMessage(error));
      }
    },
    [isLocked, isReady, reload, runtime, submitTopUp]
  );
}
