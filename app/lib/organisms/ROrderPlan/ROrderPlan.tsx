import { PopupWithIcon } from "~/templates/PopupWIthIcon/PopupWithIcon";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { ROUTES } from "~/consts";
import type { PermitRuntime } from "~/contracts/permit";
import { OrderPlan, TOP_UP_BLOCKER } from "~/lib/relay/orderPlan";
import { RelayApiError } from "~/lib/relay/relay.errors";
import { getContractErrorMessage } from "~/errors/helpers/walletError.helper";
import { RPermitReview } from "~/lib/organisms/RPermitReview/RPermitReview";
import { RButton } from "~/lib/atoms/RButton";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { AddCreditsModal } from "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/AddCreditsModal";
import { fetchRelayCredits } from "~/lib/apis/rwa/relay/relay";
import styles from "../RPermitReview/RPermitReview.module.css";

export function ROrderPlan({
  plan,
  runtime,
  onClose,
}: {
  plan: OrderPlan;
  runtime: PermitRuntime | null;
  onClose: () => void;
}) {
  const auth = useAuthContext();
  const user = useUserContext();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const error = plan.error;
  const code = error instanceof RelayApiError ? error.code : "";
  useEffect(() => {
    if (
      !runtime ||
      !["FEE_CREDIT_REQUIRED", "CONTRACT_NOT_RELAYABLE"].includes(code)
    )
      return;
    let cancelled = false;
    if (code === "FEE_CREDIT_REQUIRED") setTopUpOpen(true);
    void Promise.resolve()
      .then(async () => {
        const scope = JSON.stringify(runtime.getScope());
        const config = await runtime.refreshConfig();
        if (cancelled || JSON.stringify(runtime.getScope()) !== scope) return;
        if (code === "FEE_CREDIT_REQUIRED" && config.fee.enabled)
          await fetchRelayCredits(runtime.getScope().wallet, config);
      })
      .catch(() => {
        if (!cancelled)
          setRefreshError(
            "Unable to refresh relay configuration or Credits. Retry from a new review."
          );
      });
    return () => {
      cancelled = true;
    };
  }, [code, runtime]);
  const message =
    error instanceof RelayApiError
      ? (error.serverMessage ?? error.message)
      : error instanceof Error
        ? error.message
        : null;
  if (plan.prepared && runtime && plan.state === "review")
    return (
      <RPermitReview
        key={plan.prepared.payload}
        prepared={plan.prepared}
        runtime={runtime}
        beforeSign={() => plan.validateReview()}
        onCancel={onClose}
        onSigned={(signed) => {
          void plan.submit(signed);
        }}
      />
    );
  return (
    <PopupWithIcon
      isOpen
      contentLabel="Order execution"
      onRequestClose={() => {
        if (plan.state !== "submitting") onClose();
      }}
    >
      <section className={styles.review} aria-label="Order execution">
        <p role="status">
          {
            {
              idle: "",
              preparing: "Checking current order, balance and permit state…",
              review: "Review and sign this step in your wallet.",
              submitting: "Submitting signed permit…",
              tracking:
                "Waiting for relay confirmation. Acceptance is not order completion. Recovery and details are available in relay progress.",
              next: "Operator permission confirmed. Review the order next; no order has been placed.",
              failed: "Plan stopped. Your order inputs are preserved.",
              confirmed:
                "Requested order action confirmed. Placement does not mean fill.",
            }[plan.state]
          }
        </p>
        {message && <p role="alert">{message}</p>}
        {code === "SIMULATION_FAILED" && (
          <p>
            {
              getContractErrorMessage(new Error(message ?? ""), true)
                .description
            }
          </p>
        )}
        {refreshError && <p role="alert">{refreshError}</p>}
        {code === "RELAY_UNAVAILABLE" && (
          <p>
            Sponsor service unavailable. Use the existing attempt’s bounded
            retries and reconcile it before choosing another payment method.
          </p>
        )}
        {(code === "RELAY_QUOTA_EXCEEDED" || code === "QUOTA_EXCEEDED") && (
          <p>
            Quota reached. Recovery respects Retry-After; do not sign a
            replacement while this attempt is unresolved.
          </p>
        )}
        {code === "SIGNER_MISMATCH" && (
          <RButton onClick={user.changeUser}>Reconnect wallet</RButton>
        )}
        {error instanceof RelayApiError && error.status === 401 && (
          <RButton
            onClick={() => {
              void auth
                .login()
                .catch(() =>
                  setRefreshError("Sign-in failed. Try signing in again.")
                );
            }}
          >
            Sign in
          </RButton>
        )}
        {(code === "KYC_REQUIRED" || message?.includes("Mavryk Pro")) && (
          <Link to={ROUTES.portfolioProfile}>Complete KYC in Profile</Link>
        )}
        {(plan.state === "next" || plan.canResign) && (
          <RButton
            onClick={() => {
              void plan.review();
            }}
          >
            {plan.canResign
              ? "Refresh and review a new permit"
              : "Review order"}
          </RButton>
        )}
        <Link to={ROUTES.portfolioProfile}>Payment settings</Link>
        {plan.state !== "submitting" && (
          <RButton variant="secondary" onClick={onClose}>
            Close plan
          </RButton>
        )}
        <AddCreditsModal
          isOpen={topUpOpen}
          onClose={() => setTopUpOpen(false)}
          blockedReason={TOP_UP_BLOCKER}
          walletBalanceUsd={0}
          onAddCredits={async () => {
            throw new Error(TOP_UP_BLOCKER);
          }}
        />
      </section>
    </PopupWithIcon>
  );
}
