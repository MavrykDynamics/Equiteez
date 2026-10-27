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

import {
  CREDIT_PACKAGES,
  CREDIT_PRICE_USDT,
  CUSTOM_TOP_UP_MAX_USDT,
  CUSTOM_TOP_UP_MIN_USDT,
  DEFAULT_CREDIT_PACKAGE,
  formatCredits,
  formatUsdt,
} from "../CreditsWalletDropdown/credits.utils";
import styles from "./AddCreditsModal.module.css";

type CreditsOption = number | "custom";
type AddCreditsStep = "form" | "submitted" | "unavailable";

export const TOP_UP_UNAVAILABLE_REASON =
  "Credit pricing and safe top-up processing are not yet available. Your existing balance is unchanged.";

type AddCreditsModalProps = {
  isOpen: boolean;
  // Forces the unavailable presentation instead of the top-up form.
  blockedReason?: string;
  onClose: () => void;
  // Submits the exact USDT payment. Without it the form ends in the
  // unavailable state, because top-up signing is not supported yet.
  onAddCredits?: (amountUsdt: BigNumber) => Promise<void>;
  // Fee-token wallet balance in whole tokens; null while unknown.
  walletBalance?: BigNumber | null;
};

export function AddCreditsModal({
  isOpen,
  blockedReason,
  onClose,
  onAddCredits,
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

  const paymentUsdt =
    selectedOption === "custom"
      ? new BigNumber(customAmount || NaN)
      : new BigNumber(selectedOption).times(CREDIT_PRICE_USDT);
  const creditsAmount = paymentUsdt.dividedToIntegerBy(CREDIT_PRICE_USDT);
  const isAmountValid =
    paymentUsdt.isFinite() &&
    paymentUsdt.gte(CUSTOM_TOP_UP_MIN_USDT) &&
    paymentUsdt.lte(CUSTOM_TOP_UP_MAX_USDT) &&
    paymentUsdt.decimalPlaces()! <= 2;
  const hasEnoughBalance =
    walletBalance !== null && isAmountValid && paymentUsdt.lte(walletBalance);
  const canSubmit = isAmountValid && hasEnoughBalance;
  const view = blockedReason ? "unavailable" : step;
  const customPlaceholder = `$${formatUsdt(CUSTOM_TOP_UP_MIN_USDT)}-${formatUsdt(
    CUSTOM_TOP_UP_MAX_USDT
  )}`;

  const handleClose = () => {
    onClose();
    setStep("form");
    setSelectedOption(DEFAULT_CREDIT_PACKAGE);
    setCustomAmount("");
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
    try {
      await onAddCredits(paymentUsdt);
      setStep("submitted");
    } catch (error) {
      setUnavailableReason(
        error instanceof Error ? error.message : TOP_UP_UNAVAILABLE_REASON
      );
      setStep("unavailable");
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
              Gas Credits cover platform and network fees on Equiteez. Each
              order uses 1 Gas Credit (${formatUsdt(CREDIT_PRICE_USDT)}), and
              there&apos;s no charge if you cancel. Any Gas Credits you buy
              can&apos;t be withdrawn.
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
              {CREDIT_PACKAGES.map((credits) => (
                <label
                  className={clsx(
                    styles.option,
                    selectedOption === credits && styles.optionSelected
                  )}
                  key={credits}
                >
                  <input
                    checked={selectedOption === credits}
                    className={styles.radio}
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
                    $
                    {formatUsdt(
                      new BigNumber(credits).times(CREDIT_PRICE_USDT)
                    )}
                  </RText>
                </label>
              ))}

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
                <RText size="body-sm">
                  {isAmountValid
                    ? `You're authorizing one payment of exactly ${formatUsdt(paymentUsdt)} USDT.`
                    : `Enter an amount between ${formatUsdt(CUSTOM_TOP_UP_MIN_USDT)} and ${formatUsdt(CUSTOM_TOP_UP_MAX_USDT)} USDT.`}
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
              Your payment of {formatUsdt(paymentUsdt)} USDT has been submitted.{" "}
              {formatCredits(creditsAmount)} will be added to your balance once
              the transaction is confirmed.
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
