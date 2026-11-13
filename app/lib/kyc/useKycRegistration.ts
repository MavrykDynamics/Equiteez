/**
 * Starts the self-service KYC registration and waits until the indexer shows
 * the wallet as a member (isKyced). The registration itself is the server's
 * transaction; this only asks for it and watches for the result.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import {
  KycRegistrationError,
  requestKycRegistration,
  type KycRegistrationErrorCode,
} from "~/lib/apis/kyc/kycApi";
import { useUserContext } from "~/providers/UserProvider/user.provider";

export const KYC_POLL_INTERVAL_MS = 3_000;
// Registration plus indexing normally take well under this
export const KYC_CONFIRM_TIMEOUT_MS = 120_000;

export type KycRegistrationState =
  | { name: "idle" }
  | { name: "submitting" }
  | { name: "confirming" }
  /** Sent, but the indexer did not show it in time: not a failure */
  | { name: "processing" }
  | { name: "failed"; message: string };

const ERROR_MESSAGES: Record<KycRegistrationErrorCode, string> = {
  unauthorized: "Your session has ended. Sign in again and retry.",
  disabled: "Verification isn't available yet.",
  "not-configured": "Verification isn't available yet.",
  "rwa-unavailable":
    "Verification is unavailable right now. Please try again in a minute.",
  "rpc-unavailable":
    "Verification is unavailable right now. Please try again in a minute.",
  unknown: "Something went wrong. Please try again.",
};

export const describeKycError = (error: unknown) =>
  ERROR_MESSAGES[
    error instanceof KycRegistrationError ? error.code : "unknown"
  ];

export function useKycRegistration() {
  const { isKyced, refetchUserAccountStatus, userAddress } = useUserContext();
  const [state, setState] = useState<KycRegistrationState>({ name: "idle" });
  const confirmStartedAtRef = useRef(0);
  // A result for a wallet the user has since switched away from is dropped
  const addressRef = useRef(userAddress);
  addressRef.current = userAddress;

  useEffect(() => {
    setState({ name: "idle" });
  }, [userAddress]);

  const start = useCallback(async () => {
    const address = addressRef.current;

    setState({ name: "submitting" });

    try {
      await requestKycRegistration();
      if (addressRef.current !== address) return;

      confirmStartedAtRef.current = Date.now();
      setState({ name: "confirming" });
      void refetchUserAccountStatus();
    } catch (error) {
      if (addressRef.current !== address) return;
      setState({ name: "failed", message: describeKycError(error) });
    }
  }, [refetchUserAccountStatus]);

  // Poll the indexer until the membership shows up
  useEffect(() => {
    if (state.name !== "confirming" && state.name !== "processing") return;
    if (isKyced) {
      setState({ name: "idle" });
      return;
    }
    if (state.name === "processing") return;

    const timer = setInterval(() => {
      if (Date.now() - confirmStartedAtRef.current >= KYC_CONFIRM_TIMEOUT_MS) {
        setState({ name: "processing" });
        return;
      }
      void refetchUserAccountStatus();
    }, KYC_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isKyced, refetchUserAccountStatus, state.name]);

  return { state, start };
}
