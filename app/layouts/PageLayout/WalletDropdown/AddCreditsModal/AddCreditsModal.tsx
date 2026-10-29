import { useState, type FormEvent } from "react";
import { useNavigate } from "@remix-run/react";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";

import InfoMessageIcon from "~/icons/info-message.svg?react";
import { ROUTES } from "~/consts/routes";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import type { RelayConfig } from "~/lib/apis/rwa/relay/relay.types";
import {
  CREDIT_PACKAGES,
  DEFAULT_CREDIT_PACKAGE,
  formatCredits,
  formatUsdt,
  getCreditPriceUnits,
  toTokenAmount,
  toTokenUnits,
} from "../CreditsWalletDropdown/credits.utils";
import styles from "./AddCreditsModal.module.css";

type CreditsOption = number | "custom";
type AddCreditsStep = "form" | "submitted" | "unavailable";
export type AddCreditsRequest = {
  amountUnits: string;
  // The Credit price a preset was reviewed at; a change needs a new review.
  reviewedPriceUnits?: string;
};

export const TOP_UP_UNAVAILABLE_REASON =
  "Gas Credits top-up is unavailable right now. Your existing balance is unchanged.";

type AddCreditsModalProps = {
  isOpen: boolean;
  // Forces the unavailable presentation instead of the top-up form.
  blockedReason?: string;
  onClose: () => void;
  // Signs and submits the exact payment. Without it the form ends in the
  // unavailable state.
  onAddCredits?: (request: AddCreditsRequest) => Promise<void>;
  // Current fee configuration: tariff, decimals and top-up bounds.
  fee?: RelayConfig["fee"];
  // Fee-token wallet balance in whole tokens; null while unknown.
  walletBalance?: BigNumber | null;
};

export function AddCreditsModal({
  isOpen,
  blockedReason,
  onClose,
  onAddCredits,
  fee,
  walletBalance = null,
}: AddCreditsModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<AddCreditsStep>("form");
  const [unavailableReason, setUnavailableReason] = useState(
    TOP_UP_UNAVAILABLE_REASON
  );
  const [selectedOption, setSelectedOption] = useState<CreditsOption>(
    DEFAULT_CREDIT_PACKAGE
  );
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const enabledFee = fee?.enabled ? fee : null;
  const decimals = enabledFee?.decimals ?? 0;
  const price = getCreditPriceUnits(enabledFee ?? undefined);
  const minUnits = BigInt(enabledFee?.topUpMinUnits ?? "0");
  const maxUnits = BigInt(enabledFee?.topUpMaxUnits ?? "0");
  const balanceUnits =
    walletBalance === null
      ? null
      : BigInt(
          toTokenUnits(walletBalance, decimals)
            .integerValue(BigNumber.ROUND_FLOOR)
            .toFixed()
        );
  const presetUnits = (credits: number) =>
    price === null ? null : BigInt(credits) * price;
  const inBounds = (units: bigint | null): units is bigint =>
    units !== null && units >= minUnits && units <= maxUnits;
  const isAffordable = (units: bigint) =>
    balanceUnits === null || units <= balanceUnits;

  const customUnits = (() => {
    const value = toTokenUnits(customAmount || NaN, decimals);
    return value.isFinite() && value.isInteger() && value.gt(0)
      ? BigInt(value.toFixed())
      : null;
  })();
  const paymentUnits =
    selectedOption === "custom" ? customUnits : presetUnits(selectedOption);
  const paymentUsdt =
    paymentUnits === null ? null : toTokenAmount(paymentUnits, decimals);
  const isAmountValid = inBounds(paymentUnits);
  const hasEnoughBalance =
    balanceUnits !== null && isAmountValid && paymentUnits <= balanceUnits;
  const canSubmit = Boolean(enabledFee) && isAmountValid && hasEnoughBalance;
  const view = blockedReason || !enabledFee ? "unavailable" : step;
  const minUsdt = formatUsdt(toTokenAmount(minUnits, decimals));
  const maxUsdt = formatUsdt(toTokenAmount(maxUnits, decimals));
  const customPlaceholder = `$${minUsdt}-${maxUsdt}`;

  const handleClose = () => {
    onClose();
    setStep("form");
    setSelectedOption(DEFAULT_CREDIT_PACKAGE);
    setCustomAmount("");
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (!onAddCredits) {
      setUnavailableReason(TOP_UP_UNAVAILABLE_REASON);
      setStep("unavailable");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onAddCredits({
        amountUnits: paymentUnits!.toString(),
        reviewedPriceUnits:
          selectedOption === "custom" ? undefined : price?.toString(),
      });
      setStep("submitted");
    } catch (error) {
      // Recoverable: the form keeps the chosen amount for another attempt.
      setSubmitError(
        error instanceof Error ? error.message : TOP_UP_UNAVAILABLE_REASON
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    handleClose();
    navigate(ROUTES.portfolioActivity);
  };

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition="center"
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel={
        view === "unavailable" ? "Top Up unavailable" : "Add Gas Credit"
      }
      onRequestClose={handleClose}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close"
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      {view === "form" && (
        <form className={styles.content} noValidate onSubmit={handleSubmit}>
          <header className={styles.header}>
            <RHeading size="h6" weight="medium">
              Add Gas Credit
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              Gas Credits cover platform and network fees on Equiteez.{" "}
              {price !== null &&
                `Each order uses 1 Gas Credit ($${formatUsdt(toTokenAmount(price, decimals))}), and there's no charge if you cancel. `}
              Any Gas Credits you buy can&apos;t be withdrawn.
            </RText>
          </header>

          <div className={styles.fields}>
            <div className={styles.walletBalance}>
              <RText size="body-sm">Wallet Balance:</RText>
              <RText size="body-sm" weight="medium">
                {walletBalance === null ? "—" : `$${formatUsdt(walletBalance)}`}
              </RText>
            </div>

            <div
              aria-label="Gas Credits amount"
              className={styles.options}
              role="radiogroup"
            >
              {price !== null &&
                CREDIT_PACKAGES.map((credits) => {
                  const units = presetUnits(credits);
                  // Out of bounds or unaffordable presets cannot be chosen.
                  const isDisabled = !inBounds(units) || !isAffordable(units);
                  return (
                    <label
                      className={clsx(
                        styles.option,
                        selectedOption === credits && styles.optionSelected,
                        isDisabled && styles.optionDisabled
                      )}
                      key={credits}
                    >
                      <input
                        checked={selectedOption === credits}
                        className={styles.radio}
                        disabled={isDisabled}
                        name="credits-amount"
                        onChange={() => setSelectedOption(credits)}
                        type="radio"
                      />
                      <RText size="body-sm">{formatCredits(credits)}</RText>
                      <RText
                        className={styles.optionPrice}
                        color="neutral-700"
                        size="body-sm"
                      >
                        ${formatUsdt(toTokenAmount(units!, decimals))}
                      </RText>
                    </label>
                  );
                })}

              <label
                className={clsx(
                  styles.option,
                  selectedOption === "custom" && styles.optionSelected
                )}
              >
                <input
                  checked={selectedOption === "custom"}
                  className={styles.radio}
                  name="credits-amount"
                  onChange={() => setSelectedOption("custom")}
                  type="radio"
                />
                <RText size="body-sm">Custom</RText>
                <span
                  className={clsx(
                    styles.customAmount,
                    selectedOption === "custom" &&
                      customAmount &&
                      !isAmountValid &&
                      styles.customAmountError
                  )}
                >
                  {customAmount ? "$" : null}
                  <input
                    aria-label="Custom amount in USDT"
                    className={styles.customInput}
                    inputMode="decimal"
                    onChange={(event) =>
                      setCustomAmount(event.target.value.replace(/[^\d.]/g, ""))
                    }
                    onFocus={() => setSelectedOption("custom")}
                    placeholder={customPlaceholder}
                    // Grow with the typed value; show the full range when empty.
                    style={{
                      width: `${(customAmount || customPlaceholder).length + 0.5}ch`,
                    }}
                    value={customAmount}
                  />
                </span>
              </label>
            </div>

            <div className={styles.message}>
              <span className={styles.messageIcon}>
                <InfoMessageIcon aria-hidden />
              </span>
              <div className={styles.messageText}>
                {submitError && (
                  <RText role="alert" size="body-sm" weight="medium">
                    {submitError}
                  </RText>
                )}
                <RText size="body-sm">
                  {isAmountValid
                    ? `You're authorizing one payment of exactly ${formatUsdt(paymentUsdt!)} USDT.`
                    : `Enter an amount between ${minUsdt} and ${maxUsdt} USDT.`}
                </RText>
                <RText color="neutral-700" size="body-sm">
                  {isAmountValid && walletBalance !== null && !hasEnoughBalance
                    ? "Insufficient wallet balance."
                    : isAmountValid && walletBalance === null
                      ? "Wallet balance is loading."
                      : "Gas Credit is used to place orders and can't be withdrawn."}
                </RText>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <RButton
              className={styles.action}
              onClick={handleClose}
              size="medium"
              tone="black"
              type="button"
              variant="secondary"
            >
              Cancel
            </RButton>
            <RButton
              className={styles.action}
              disabled={!canSubmit}
              isLoading={isSubmitting}
              size="medium"
              tone="black"
              type="submit"
            >
              Add Gas Credits
            </RButton>
          </div>
        </form>
      )}

      {view === "submitted" && (
        <div className={clsx(styles.content, styles.statusContent)}>
          <div className={styles.successIcon}>
            <RIcon aria-hidden name="check" size="medium" />
          </div>
          <header className={styles.header}>
            <RHeading size="h6" weight="medium">
              Transaction Submitted
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              Your payment of {paymentUsdt ? formatUsdt(paymentUsdt) : "—"} USDT
              has been submitted.{" "}
              {selectedOption === "custom"
                ? "Your Gas Credits balance will update"
                : `${formatCredits(selectedOption)} will be added to your balance`}{" "}
              once the transaction is confirmed.
            </RText>
          </header>
          <div className={styles.divider} />
          <div className={styles.actions}>
            <RButton
              className={styles.action}
              onClick={handleClose}
              size="medium"
              tone="black"
              type="button"
              variant="secondary"
            >
              Minimize And Continue Browsing
            </RButton>
            <RButton
              className={styles.action}
              onClick={handleViewDetails}
              size="medium"
              tone="black"
              type="button"
            >
              View Details
            </RButton>
          </div>
        </div>
      )}

      {view === "unavailable" && (
        <div className={styles.content}>
          <header className={styles.header}>
            <RHeading size="h6" weight="medium">
              Top Up unavailable
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              {blockedReason ?? unavailableReason}
            </RText>
          </header>

          <div className={styles.message}>
            <span className={styles.messageIcon}>
              <InfoMessageIcon aria-hidden />
            </span>
            <RText color="neutral-700" size="body-sm">
              Credits are prepaid and cannot be withdrawn. Any existing top-up
              continues in Relay activity; reopening this window does not send
              another payment.
            </RText>
          </div>

          <RButton
            className={styles.action}
            onClick={handleClose}
            size="medium"
            tone="black"
          >
            Close
          </RButton>
        </div>
      )}
    </CustomPopup>
  );
}
