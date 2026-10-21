import { useState, type FormEvent } from "react";
import { useNavigate } from "@remix-run/react";
import clsx from "clsx";

import { ROUTES } from "~/consts/routes";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import {
  CREDIT_PACKAGES,
  CREDIT_PRICE_USD,
  CUSTOM_CREDITS_MAX,
  CUSTOM_CREDITS_MIN,
  formatCredits,
  formatCreditsUsd,
} from "../CreditsWalletDropdown/credits.utils";
import styles from "./AddCreditsModal.module.css";

type CreditsOption = number | "custom";
type AddCreditsStep = "form" | "submitted";

const DEFAULT_OPTION: CreditsOption = 20;

type AddCreditsModalProps = {
  isOpen: boolean;
  onAddCredits: (amount: number) => Promise<void>;
  onClose: () => void;
  walletBalanceUsd: number;
};

const formatUsd = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

export function AddCreditsModal({
  isOpen,
  onAddCredits,
  onClose,
  walletBalanceUsd,
}: AddCreditsModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<AddCreditsStep>("form");
  const [selectedOption, setSelectedOption] =
    useState<CreditsOption>(DEFAULT_OPTION);
  const [customAmount, setCustomAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const creditsAmount =
    selectedOption === "custom" ? Number(customAmount) : selectedOption;
  const paymentAmountUsd = creditsAmount * CREDIT_PRICE_USD;
  const isCustomAmountValid =
    Number.isFinite(creditsAmount) &&
    creditsAmount >= CUSTOM_CREDITS_MIN &&
    creditsAmount <= CUSTOM_CREDITS_MAX;
  const hasEnoughBalance = paymentAmountUsd <= walletBalanceUsd;
  const canSubmit =
    (selectedOption !== "custom" || isCustomAmountValid) && hasEnoughBalance;

  const handleClose = () => {
    onClose();
    setStep("form");
    setSelectedOption(DEFAULT_OPTION);
    setCustomAmount("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      await onAddCredits(creditsAmount);
      setStep("submitted");
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
      className={styles.modal}
      contentLabel="Add trading credit"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={handleClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close add trading credit"
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      {step === "form" ? (
        <form className={styles.content} noValidate onSubmit={handleSubmit}>
          <header className={styles.header}>
            <RHeading size="h6" weight="medium">
              Add Trading Credit
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              Credits cover platform and network fees on Equiteez. Each order
              uses 1 credit ({formatCreditsUsd(1)}), and there&apos;s no charge
              if you cancel. Any credits you buy can&apos;t be withdrawn.
            </RText>
          </header>

          <div className={styles.fields}>
            <div className={styles.walletBalance}>
              <RText size="body-sm">Wallet Balance:</RText>
              <RText size="body-sm" weight="medium">
                ${formatUsd(walletBalanceUsd)}
              </RText>
            </div>

            <div
              aria-label="Credits amount"
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
                    {formatCreditsUsd(credits)}
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
                      !isCustomAmountValid &&
                      styles.customAmountError
                  )}
                >
                  {customAmount ? "$" : null}
                  <input
                    aria-label="Custom credits amount"
                    className={styles.customInput}
                    inputMode="decimal"
                    onChange={(event) =>
                      setCustomAmount(
                        event.target.value.replace(/[^\d.]/g, "")
                      )
                    }
                    onFocus={() => setSelectedOption("custom")}
                    placeholder={`$${formatUsd(CUSTOM_CREDITS_MIN)}-${formatUsd(
                      CUSTOM_CREDITS_MAX
                    )}`}
                    size={Math.max(customAmount.length, 1)}
                    value={customAmount}
                  />
                </span>
              </label>
            </div>

            <div className={styles.message}>
              <RIcon name="info" size="small" />
              <RText size="body-sm">
                You&apos;re authorizing one payment of exactly{" "}
                {canSubmit ? formatUsd(paymentAmountUsd) : "0.00"} USDT.
                <br />
                <RText color="neutral-700" size="body-sm">
                  {hasEnoughBalance
                    ? "Credit is used to place orders and can't be withdrawn."
                    : "Insufficient wallet balance."}
                </RText>
              </RText>
            </div>
          </div>

          <div className={styles.actions}>
            <RButton
              className={styles.action}
              onClick={handleClose}
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
              tone="black"
              type="submit"
            >
              Add Credits
            </RButton>
          </div>
        </form>
      ) : (
        <div className={styles.statusContent}>
          <div className={styles.successIcon}>
            <RIcon aria-hidden name="check" size="medium" />
          </div>
          <header className={styles.header}>
            <RHeading size="h6" weight="medium">
              Transaction Submitted
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              Your payment of {formatUsd(paymentAmountUsd)} USDT has been
              submitted. {formatCredits(creditsAmount)} will be added to your
              balance once the transaction is confirmed.
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
    </CustomPopup>
  );
}
