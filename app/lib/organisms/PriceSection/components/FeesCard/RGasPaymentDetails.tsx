import { useState } from "react";
import { Link } from "@remix-run/react";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import { ROUTES } from "~/consts/routes";
import GasCreditEmptyIcon from "~/icons/gas-credit-empty.svg?react";
import GasCreditInfoIcon from "~/icons/gas-credit-info.svg?react";
import GasCreditLowIcon from "~/icons/gas-credit-low.svg?react";
import { RTooltip } from "~/lib/atoms/RTooltip";
import { AddCreditsModal } from "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/AddCreditsModal";
import {
  useCreditTokenWalletBalance,
  useCredits,
} from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/useCredits";
import {
  CREDIT_PRICE_USDT,
  formatCredits,
  getCreditsCount,
  getCreditsTone,
} from "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/credits.utils";
import styles from "./styles.module.css";

const GAS_CREDIT_TOOLTIP =
  "1 Gas Credit covers the platform and network fees for this order. Gas Credits can't be withdrawn.";

export function RGasPaymentDetails({
  method,
  variant,
  networkFee,
  storageCost,
}: {
  method: "credits" | "mvrk";
  variant: string;
  networkFee?: string;
  storageCost?: string;
}) {
  const credits = useCredits(method === "credits");
  const walletBalance = useCreditTokenWalletBalance(credits.config);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  if (method === "mvrk")
    return (
      <div className={styles.detailRow}>
        <span>Network Fee</span>
        <span className={styles.detailValue}>
          {networkFee === undefined
            ? "—"
            : `~ ${new BigNumber(networkFee).plus(storageCost ?? 0).toFixed()} MVRK`}
        </span>
      </div>
    );

  const fee =
    credits.config?.state === "ready" ? credits.config.config.fee : undefined;
  const orderCredits =
    fee?.enabled &&
    new BigNumber(fee.feeSchedule[variant] ?? "0")
      .shiftedBy(-fee.decimals)
      .div(CREDIT_PRICE_USDT);
  const value =
    credits.status === "free" || (orderCredits && orderCredits.isZero())
      ? "Free"
      : credits.status === "ready" && orderCredits
        ? formatCredits(orderCredits)
        : "—";

  const tone =
    credits.status === "ready" && credits.credits?.enabled && !credits.progress
      ? getCreditsTone(
          getCreditsCount(
            credits.credits.balanceUnits,
            credits.credits.decimals
          ),
          credits.credits.freeAllowanceRemaining
        )
      : null;
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
          <RTooltip content={GAS_CREDIT_TOOLTIP} maxWidth={315}>
            <button
              aria-label={GAS_CREDIT_TOOLTIP}
              className={styles.gasCreditInfo}
              type="button"
            >
              <GasCreditInfoIcon aria-hidden />
            </button>
          </RTooltip>
        </span>
        <span className={styles.detailValue}>{value}</span>
      </div>

      {tone === "low" && (
        <div className={clsx(styles.creditMessage, styles.creditMessageLow)}>
          <GasCreditLowIcon aria-hidden className={styles.creditMessageIcon} />
          <p>Running low on Gas Credits. Please {topUpLink} your balance.</p>
        </div>
      )}
      {tone === "empty" && (
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
            <Link className={styles.messageLink} to={ROUTES.portfolioProfile}>
              Switch
            </Link>{" "}
            to Manual Gas Transactions.
          </p>
        </div>
      )}

      <AddCreditsModal
        isOpen={isTopUpOpen && credits.canTopUp}
        onClose={() => setIsTopUpOpen(false)}
        walletBalance={walletBalance}
      />
    </>
  );
}
