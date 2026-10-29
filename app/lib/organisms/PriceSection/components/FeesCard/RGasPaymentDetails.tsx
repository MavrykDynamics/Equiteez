import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Link } from "@remix-run/react";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import { ROUTES } from "~/consts/routes";
import GasCreditEmptyIcon from "~/icons/gas-credit-empty.svg?react";
import GasCreditInfoIcon from "~/icons/gas-credit-info.svg?react";
import GasCreditLowIcon from "~/icons/gas-credit-low.svg?react";
import { RTooltip } from "~/lib/atoms/RTooltip";
import { useUsdToTokenRates } from "~/lib/fiat-currency";
import { MVRK_ASSET_SLUG } from "~/lib/metadata";
import { AddCreditsModal } from "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/AddCreditsModal";
import { useAddCredits } from "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/useAddCredits";
import {
  useCreditTokenWalletBalance,
  useCredits,
} from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/useCredits";
import { formatCreditCharge } from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/credits.utils";
import type { RelayFailureNotice } from "~/lib/relay/relayFailure";
import { MILLION } from "~/lib/utils/numbers";
import { calculateOrderSummaryValues } from "./FeesCard.utils";
import styles from "./styles.module.css";

const GAS_CREDIT_TOOLTIP =
  "1 Gas Credit covers the platform and network fees for this order. Gas Credits can't be withdrawn.";

function InfoButton({
  content,
  allowHTML,
  label,
}: {
  content: string;
  allowHTML?: boolean;
  label: string;
}) {
  return (
    <RTooltip
      allowHTML={allowHTML}
      className={styles.gasCreditTooltip}
      content={content}
      maxWidth={315}
    >
      <button aria-label={label} className={styles.gasCreditInfo} type="button">
        <GasCreditInfoIcon aria-hidden />
      </button>
    </RTooltip>
  );
}

const switchLink = (
  <Link className={styles.messageLink} to={ROUTES.portfolioProfile}>
    Switch
  </Link>
);

function PaymentMethodChangedMessage({ reason }: { reason: string }) {
  return (
    <div
      className={clsx(styles.creditMessage, styles.creditMessageLow)}
      role="status"
    >
      <GasCreditLowIcon aria-hidden className={styles.creditMessageIcon} />
      <p>
        {reason} Review the order and submit it again, or change it in{" "}
        <Link className={styles.messageLink} to={ROUTES.portfolioProfile}>
          Profile settings
        </Link>
        .
      </p>
    </div>
  );
}

export function RGasPaymentDetails({
  method,
  variant,
  networkFee,
  storageCost,
  orderbookFee,
  notice,
}: {
  method: "credits" | "mvrk";
  variant: string;
  networkFee?: string;
  storageCost?: string;
  /** Orderbook fee per order, in MVRK atoms. */
  orderbookFee?: BigNumber.Value;
  /** Relay availability or the last relay failure for this order. */
  notice?: RelayFailureNotice | null;
}) {
  const credits = useCredits(method === "credits");
  const walletBalance = useCreditTokenWalletBalance(credits.config);
  const addCredits = useAddCredits();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const mvrkUsdRate = useUsdToTokenRates()[MVRK_ASSET_SLUG];

  if (method === "mvrk") {
    // Gas Fee is the wallet's network fee plus storage burn, in MVRK.
    const gasFee =
      networkFee === undefined
        ? undefined
        : new BigNumber(networkFee).plus(storageCost ?? 0);
    // Platform Fee is the whole MVRK cost: gas plus the orderbook fee (atoms).
    const platformFee = gasFee?.plus(
      new BigNumber(orderbookFee ?? 0).div(MILLION)
    );
    const { orderbookFeeUsd, gasFeeUsd } = calculateOrderSummaryValues({
      gasFee,
      orderbookFee,
      feeUsdRate: mvrkUsdRate,
    });
    const feeTooltip = renderToStaticMarkup(
      <div className={styles.feeTooltip}>
        {[
          {
            label: "Orderbook Fee",
            value:
              orderbookFee === undefined
                ? "-"
                : `$${orderbookFeeUsd.toFixed(6)}`,
          },
          {
            label: "Gas Fee",
            value: gasFee === undefined ? "-" : `$${gasFeeUsd.toFixed(6)}`,
          },
        ].map(({ label, value }) => (
          <div className={styles.feeTooltipRow} key={label}>
            <span>{label}</span>
            <span className={styles.feeTooltipValue}>{value}</span>
          </div>
        ))}
      </div>
    );

    return (
      <>
        <div className={styles.detailRow}>
          <span className={styles.feeLabel}>
            Platform Fee
            <InfoButton
              allowHTML
              content={feeTooltip}
              label="Platform fee breakdown"
            />
          </span>
          <span className={styles.detailValue}>
            {platformFee === undefined
              ? "—"
              : `~ ${platformFee.toFixed()} MVRK`}
          </span>
        </div>
        {notice?.kind === "payment-mismatch" && (
          <PaymentMethodChangedMessage reason={notice.reason} />
        )}
      </>
    );
  }

  const fee =
    credits.config?.state === "ready" ? credits.config.config.fee : undefined;
  // Absent variants are free; the resolved schedule is authoritative.
  const orderUnits = fee?.enabled
    ? BigInt(fee.feeSchedule[variant] ?? "0")
    : null;
  const value =
    credits.status === "free" || orderUnits === 0n
      ? "Free"
      : credits.status === "ready" && fee?.enabled && orderUnits !== null
        ? formatCreditCharge(orderUnits, fee)
        : "—";

  // Warnings only for chargeable orders; free ones never need Credits.
  const tone =
    credits.status === "ready" && !credits.progress && orderUnits
      ? (credits.summary?.tone ?? null)
      : null;
  // The relay's FEE_CREDIT_REQUIRED is the same empty state, never shown twice.
  const isEmpty = tone === "empty" || notice?.kind === "credit-shortage";
  const topUpLink = credits.canTopUp ? (
    <button
      className={styles.messageLink}
      onClick={() => setIsTopUpOpen(true)}
      type="button"
    >
      Top Up
    </button>
  ) : (
    "Top Up"
  );

  return (
    <>
      <div className={styles.detailRow}>
        <span className={styles.feeLabel}>
          Gas Credit
          <InfoButton content={GAS_CREDIT_TOOLTIP} label={GAS_CREDIT_TOOLTIP} />
        </span>
        <span className={styles.detailValue}>{value}</span>
      </div>

      {tone === "low" && !isEmpty && (
        <div className={clsx(styles.creditMessage, styles.creditMessageLow)}>
          <GasCreditLowIcon aria-hidden className={styles.creditMessageIcon} />
          <p>Running low on Gas Credits. Please {topUpLink} your balance.</p>
        </div>
      )}
      {isEmpty && (
        <div
          className={clsx(styles.creditMessage, styles.creditMessageEmpty)}
          role="alert"
        >
          <GasCreditEmptyIcon
            aria-hidden
            className={styles.creditMessageIcon}
          />
          <p>
            You&apos;re out of Gas Credits. Please {topUpLink} your balance or{" "}
            {switchLink} to Manual Gas Transactions.
          </p>
        </div>
      )}
      {/* Sponsor or availability problem: Top Up would not help. */}
      {notice?.kind === "unavailable" && (
        <div
          className={clsx(styles.creditMessage, styles.creditMessageEmpty)}
          role="alert"
        >
          <GasCreditEmptyIcon
            aria-hidden
            className={styles.creditMessageIcon}
          />
          <p>
            {notice.reason} Try again later or {switchLink} to Manual Gas
            Transactions.
          </p>
        </div>
      )}
      {notice?.kind === "payment-mismatch" && (
        <PaymentMethodChangedMessage reason={notice.reason} />
      )}

      <AddCreditsModal
        fee={fee}
        isOpen={isTopUpOpen && credits.canTopUp}
        onAddCredits={addCredits}
        onClose={() => setIsTopUpOpen(false)}
        walletBalance={walletBalance}
      />
    </>
  );
}
