import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { useQuery } from "@apollo/client/index";

import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import {
  isKTAddress,
  isAddressValid,
  loadContract,
  toTransferParams,
} from "~/lib/utils/helpers";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { getActionAvailability } from "~/providers/WalletProvider/capabilities";
import { toCapabilityContext } from "~/providers/WalletProvider/useActionAvailability";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";

import styles from "./WithdrawFundsModal.module.css";
import { Field } from "./Field";
import { ProcessingStep } from "./ProcessingStep";
import { SuccessStep } from "./SuccessStep";
import { WithdrawalSummary } from "./WithdrawalSummary";
import { useWithdrawableAssets } from "./useWithdrawableAssets";
import { MVRK_ASSET_SLUG, MVRK_CONTRACT_ADDRESS } from "~/lib/metadata";
import { AssetIcon } from "~/templates/AssetIcon";
import WalletBalanceIcon from "~/icons/wallet-balance.svg?react";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
import { getIsKycedForAddress } from "~/providers/UserProvider/helpers/userStatus.helpers";
import { sendAndConfirmBatch } from "~/contracts/execution";
import { classifyContractActionError } from "~/contracts/hooks/contractActionError";
import { executeTrackedAction } from "~/services/direct/executor";
import {
  formatMvrk,
  summarizeNativeCost,
} from "~/services/direct/nativeBudget";

import { OpKind } from "@mavrykdynamics/taquito";

import { buildWithdrawalBatch, nativeMaxAmount } from "./withdrawal";

type WithdrawStep = "form" | "processing" | "success";

type WithdrawFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WithdrawFundsModal({
  isOpen,
  onClose,
}: WithdrawFundsModalProps) {
  const queryClient = useQueryClient();
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const { bug, warning } = useToasterContext();
  const { userAddress } = usePortfolioContext();
  const { getIdentity, getToolkit, directExecution } = useWalletContext();
  const { assets, isLoading: isAssetsLoading } = useWithdrawableAssets();
  const [step, setStep] = useState<WithdrawStep>("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAssetSlug, setSelectedAssetSlug] = useState<string>();
  const [transactionHash, setTransactionHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRecipientTouched, setIsRecipientTouched] = useState(false);
  const [isAmountTouched, setIsAmountTouched] = useState(false);
  const [isRecipientKyced, setIsRecipientKyced] = useState<boolean | null>(
    null
  );
  const [isWalletConfirmed, setIsWalletConfirmed] = useState(false);
  const [isFallbackDelayElapsed, setIsFallbackDelayElapsed] = useState(false);
  const activeOperationHashRef = useRef("");

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.tokenSlug === selectedAssetSlug),
    [assets, selectedAssetSlug]
  );
  const normalizedRecipientAddress = recipientAddress.trim();
  const [debouncedRecipientAddress] = useDebounce(
    normalizedRecipientAddress,
    400
  );
  const requestedAmount = new BigNumber(amount);
  const isRecipientValid =
    normalizedRecipientAddress.length > 0 &&
    isAddressValid(normalizedRecipientAddress);
  const isDebouncedRecipientValid =
    debouncedRecipientAddress.length > 0 &&
    isAddressValid(debouncedRecipientAddress);
  const isAmountValid =
    requestedAmount.isFinite() &&
    requestedAmount.gt(0) &&
    !!selectedAsset &&
    requestedAmount.lte(selectedAsset.availableBalance);
  const recipientError = isRecipientTouched && !isRecipientValid;
  const amountError = isAmountTouched && !isAmountValid;

  const {
    data: recipientKycData,
    loading: isRecipientKycLoading,
    error: recipientKycQueryError,
  } = useQuery(USER_ACCOUNT_STATUS_QUERY, {
    variables: { address: debouncedRecipientAddress },
    skip: !isDebouncedRecipientValid,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (
      !isRecipientValid ||
      normalizedRecipientAddress !== debouncedRecipientAddress
    ) {
      setIsRecipientKyced(null);
      return;
    }

    if (recipientKycQueryError) {
      setIsRecipientKyced(false);
      return;
    }

    if (!recipientKycData) return;

    setIsRecipientKyced(
      getIsKycedForAddress(recipientKycData, debouncedRecipientAddress)
    );
  }, [
    debouncedRecipientAddress,
    isRecipientValid,
    normalizedRecipientAddress,
    recipientKycData,
    recipientKycQueryError,
  ]);

  useEffect(() => {
    if (step !== "processing") return;

    const fallbackDelay = window.setTimeout(() => {
      setIsFallbackDelayElapsed(true);
    }, 20_000);

    return () => window.clearTimeout(fallbackDelay);
  }, [step]);

  useEffect(() => {
    if (
      step === "processing" &&
      isWalletConfirmed &&
      isFallbackDelayElapsed
    ) {
      setStep("success");
    }
  }, [isFallbackDelayElapsed, isWalletConfirmed, step]);

  const handleTokenSent = useCallback(
    (frame: { kind?: string | null; payload?: Record<string, unknown> }) => {
      const operationHash = frame.payload?.operation_hash;

      if (
        step === "processing" &&
        frame.kind === "tokens_sent" &&
        typeof operationHash === "string" &&
        operationHash === activeOperationHashRef.current
      ) {
        setStep("success");
      }
    },
    [step]
  );

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.TokenLedgerTransfer,
    handleTokenSent
  );

  const handleClose = () => {
    activeOperationHashRef.current = "";
    setStep("form");
    setRecipientAddress("");
    setAmount("");
    setTransactionHash("");
    setIsSummaryOpen(false);
    setIsRecipientTouched(false);
    setIsAmountTouched(false);
    setIsRecipientKyced(null);
    setIsWalletConfirmed(false);
    setIsFallbackDelayElapsed(false);
    setSelectedAssetSlug(undefined);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsRecipientTouched(true);
    setIsAmountTouched(true);

    const tezos = getToolkit();

    if (!selectedAsset || !userAddress || !tezos) {
      if (!selectedAsset) {
        return;
      }

      bug("Wallet or token data is unavailable. Please try again.");
      return;
    }

    const identity = getIdentity();
    const availability = identity
      ? getActionAvailability("withdraw", toCapabilityContext(identity))
      : null;

    if (availability && !availability.isAllowed) {
      bug(availability.reason);
      return;
    }

    if (!isRecipientValid) {
      bug("Enter a valid Mavryk wallet address.");
      return;
    }

    if (isRecipientKyced !== true) {
      bug("Recipient wallet must have completed KYC to receive RWA tokens.");
      return;
    }

    if (!isAmountValid) {
      bug("Enter an amount within your available balance.");
      return;
    }

    const isNative = selectedAsset.metadata.address === MVRK_CONTRACT_ADDRESS;
    const tokenSlug = isNative ? MVRK_ASSET_SLUG : selectedAsset.tokenSlug;
    let submittedHash = "";

    const refreshAfterConfirmation = async (
      operationHash: string,
      level: number
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rwa-wallet"] }),
        queryClient.invalidateQueries({
          queryKey: ["rwa-wallet-portfolio"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["rwa-wallet-portfolio-history"],
        }),
        invalidateFreshQueries("fetchWalletTransferHistory", {
          level,
          source: FreshnessSource.Chain,
        }),
        invalidateFreshQueries("fetchWalletActivitySummary", {
          level,
          source: FreshnessSource.Chain,
        }),
      ]);

      if (activeOperationHashRef.current === operationHash) {
        setIsWalletConfirmed(true);
      }
    };

    try {
      setIsSubmitting(true);

      const transferParams = await toTransferParams(
        tezos,
        tokenSlug,
        selectedAsset.metadata,
        userAddress,
        normalizedRecipientAddress,
        requestedAmount
      );
      const batch = buildWithdrawalBatch(
        isKTAddress(selectedAsset.metadata.address)
          ? {
              kind: "token",
              params: (
                await loadContract(tezos, selectedAsset.metadata.address)
              ).methodsObject
                .transfer(transferParams)
                .toTransferParams(),
            }
          : {
              kind: "native",
              to: normalizedRecipientAddress,
              amount: requestedAmount,
            }
      );

      // Shared direct send: MVRK budget and reviewed-operation checks for
      // email wallets, every result checked, duplicates blocked
      await executeTrackedAction({
        tracking: directExecution?.tracking ?? null,
        action: "withdraw",
        intent: {
          asset: tokenSlug,
          recipient: normalizedRecipientAddress,
          amount: requestedAmount.toFixed(),
        },
        run: (hooks) =>
          sendAndConfirmBatch(tezos, batch, {
            execution: directExecution?.options,
            onTransactionSubmitted: (submission) => {
              if (!submission) return;

              hooks.onSubmitted(submission.opHash);
              submittedHash = submission.opHash;
              // The form is done; confirmation continues in the background
              setIsSubmitting(false);
              activeOperationHashRef.current = submission.opHash;
              setTransactionHash(submission.opHash);
              setIsWalletConfirmed(false);
              setIsFallbackDelayElapsed(false);
              setStep("processing");
            },
            onTransactionConfirmed: ({ level, opHash }) => {
              hooks.onApplied();
              void refreshAfterConfirmation(opHash ?? submittedHash, level);
            },
          }),
      });
    } catch (error) {
      const errorKind = classifyContractActionError(error, {
        hasSubmitted: Boolean(submittedHash),
      });
      const isCurrent =
        !submittedHash || activeOperationHashRef.current === submittedHash;

      // Another tab is sending the same withdrawal
      if (errorKind === "in-progress" || !isCurrent) return;

      if (
        errorKind === "abort" ||
        (error instanceof Error && error.message === "Declined")
      ) {
        setStep("form");
        return;
      }

      // Sent, result not known yet: keep showing it as processing
      if (errorKind === "still-processing") {
        warning(
          "Withdrawal is still processing",
          error instanceof Error
            ? error.message
            : "Check its status before trying again."
        );
        if (!submittedHash) setStep("form");
        return;
      }

      setStep("form");
      bug(
        error instanceof Error
          ? error.message
          : "Withdrawal failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * "Max" for MVRK leaves the network fee and burn in the wallet: sending the
   * whole balance could never pay for itself.
   */
  const handleMax = async () => {
    if (!selectedAsset) return;

    if (selectedAsset.metadata.address !== MVRK_CONTRACT_ADDRESS) {
      setAmount(selectedAsset.availableBalance.toFixed());
      return;
    }

    const tezos = getToolkit();

    if (!tezos || !userAddress) return;

    try {
      // Fee and burn barely depend on the amount; a recipient that is not
      // allocated yet adds an allocation burn, so estimate for it when known.
      // estimate.batch, unlike estimate.transfer, keeps the reveal a new
      // account pays for on its first operation.
      const estimates = await tezos.estimate.batch([
        {
          kind: OpKind.TRANSACTION,
          to: isRecipientValid ? normalizedRecipientAddress : userAddress,
          amount: 1,
          mumav: true,
        },
      ]);
      const { feeMumav, burnMumav } = summarizeNativeCost(estimates);
      const { amount: maxAmount, reserveMumav } = nativeMaxAmount({
        balanceMvrk: selectedAsset.availableBalance,
        feeMumav,
        burnMumav,
      });

      if (!maxAmount) {
        bug(
          `Not enough MVRK to pay the network fee of about ${formatMvrk(
            reserveMumav
          )} MVRK.`
        );
        return;
      }

      setAmount(maxAmount);
    } catch {
      bug("Couldn't estimate the network fee. Please try again.");
    }
  };

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Withdraw funds"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={handleClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close withdraw funds"
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
            <RHeading className={styles.title} size="h6" weight="medium">
              Withdraw Funds
            </RHeading>
            <RText
              className={styles.description}
              color="neutral-700"
              size="body-sm"
            >
              Transfer funds from one Mavryk Wallet to another.
            </RText>
          </header>

          <div className={styles.fields}>
            <Field label="From">
              <div className={styles.staticField}>
                {userAddress ?? "Not connected"}
              </div>
            </Field>
            <Field label="To">
              <div
                className={[
                  styles.recipientInput,
                  recipientError && styles.inputError,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  aria-describedby={
                    recipientError ? "withdraw-recipient-error" : undefined
                  }
                  aria-invalid={recipientError}
                  className={styles.input}
                  onBlur={() => setIsRecipientTouched(true)}
                  onChange={(event) => setRecipientAddress(event.target.value)}
                  placeholder="Enter Address"
                  type="text"
                  value={recipientAddress}
                />
                {isRecipientKyced !== null ? (
                  <div className={styles.recipientBadges}>
                    {(["KYC", "RWA"] as const).map((label) => (
                      <span
                        className={[
                          styles.recipientBadge,
                          isRecipientKyced
                            ? styles.recipientBadgeEligible
                            : styles.recipientBadgeIneligible,
                        ].join(" ")}
                        key={label}
                      >
                        {label}
                        <RIcon
                          aria-hidden="true"
                          name={isRecipientKyced ? "check" : "close"}
                          size="small"
                        />
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {recipientError ? (
                <RText
                  className={styles.errorText}
                  id="withdraw-recipient-error"
                  size="body-xs"
                >
                  Enter a valid Mavryk wallet address.
                </RText>
              ) : null}
            </Field>

            <div className={styles.eligibilityNotice}>
              <RIcon aria-hidden="true" name="info" size="medium" />
              <RText
                className={styles.noticeText}
                color="neutral-700"
                size="body-sm"
              >
                <strong>Send to an Eligible Wallet</strong>
                <br />
                Only send funds to a wallet that has completed KYC and supports
                RWA tokens. Otherwise, the transaction will fail.
              </RText>
            </div>

            <div className={styles.assetAmountRow}>
              <Field className={styles.assetField} label="Asset">
                <RCustomDropdown className={styles.assetDropdown}>
                  <RDropdownFaceContent className={styles.assetTrigger}>
                    {selectedAsset ? (
                      <span className={styles.assetFace}>
                        <AssetIcon
                          assetSlug={selectedAsset.tokenSlug}
                          className={styles.assetFaceImage}
                          size={24}
                        />
                        <span className={styles.assetValue}>
                          {selectedAsset.metadata.symbol}
                        </span>
                      </span>
                    ) : (
                      <span className={styles.assetValueEmpty}>Select</span>
                    )}
                  </RDropdownFaceContent>
                  <RDropdownBodyContent className={styles.assetMenu}>
                    {assets.map((asset) => (
                      <RDropdownBodyContentItem
                        className={styles.assetOption}
                        isSelected={
                          asset.tokenSlug === selectedAsset?.tokenSlug
                        }
                        key={asset.tokenSlug}
                        onClick={() => setSelectedAssetSlug(asset.tokenSlug)}
                      >
                        <AssetIcon
                          assetSlug={asset.tokenSlug}
                          className={styles.assetOptionImage}
                          size={32}
                        />
                        <span className={styles.assetOptionContent}>
                          <span className={styles.assetOptionLabel}>
                            <strong>{asset.metadata.symbol}</strong>
                            <span>{asset.metadata.name}</span>
                          </span>
                        </span>
                      </RDropdownBodyContentItem>
                    ))}
                  </RDropdownBodyContent>
                </RCustomDropdown>
              </Field>
              <Field className={styles.amountField} label="Amount">
                {selectedAsset ? (
                  <span className={styles.amountLabel}>
                    <WalletBalanceIcon
                      aria-label="Balance"
                      className={styles.amountLabelIcon}
                      height={16}
                      width={16}
                    />{" "}
                    <Money tooltip={false}>
                      {selectedAsset.availableBalance}
                    </Money>{" "}
                    {selectedAsset.metadata.symbol}
                  </span>
                ) : null}
                <div
                  className={[
                    styles.amountInputRow,
                    amountError && styles.inputError,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    aria-describedby={
                      amountError ? "withdraw-amount-error" : undefined
                    }
                    aria-invalid={amountError}
                    className={styles.input}
                    inputMode="decimal"
                    onBlur={() => setIsAmountTouched(true)}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter Amount"
                    type="text"
                    value={amount}
                  />
                  {selectedAsset && (
                    <button
                      className={styles.maxButton}
                      disabled={!selectedAsset}
                      onClick={() => void handleMax()}
                      type="button"
                    >
                      Max
                    </button>
                  )}
                </div>
                {amountError ? (
                  <RText
                    className={styles.errorText}
                    id="withdraw-amount-error"
                    size="body-xs"
                  >
                    {requestedAmount.isFinite() &&
                    requestedAmount.gt(selectedAsset?.availableBalance ?? 0)
                      ? "Amount exceeds your available balance."
                      : "Enter an amount greater than 0."}
                  </RText>
                ) : null}
              </Field>
            </div>

            <WithdrawalSummary
              amount={amount}
              asset={selectedAsset}
              isOpen={isSummaryOpen}
              onToggle={() => setIsSummaryOpen((isOpen) => !isOpen)}
            />
          </div>

          <RButton
            className={styles.submitButton}
            disabled={
              !selectedAsset ||
              isAssetsLoading ||
              !isRecipientValid ||
              !isAmountValid ||
              isRecipientKyced !== true ||
              isRecipientKycLoading
            }
            isLoading={isSubmitting}
            tone="black"
            type="submit"
            size="medium"
          >
            Withdraw Funds
          </RButton>
        </form>
      ) : step === "processing" ? (
        <ProcessingStep
          amount={amount || "0.00"}
          asset={selectedAsset?.metadata.symbol ?? ""}
          onClose={handleClose}
        />
      ) : (
        <SuccessStep
          amount={amount || "0.00"}
          asset={selectedAsset?.metadata.symbol ?? ""}
          onClose={handleClose}
          transactionHash={transactionHash}
        />
      )}
    </CustomPopup>
  );
}
