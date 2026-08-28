import { useEffect, useMemo, useState, type FormEvent } from "react";
import BigNumber from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";

import { isKTAddress, isAddressValid, loadContract, toTransferParams } from "~/lib/utils/helpers";
import { AssetImage } from "~/lib/organisms/AssetImage";
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
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

import styles from "./RWithdrawFundsModal.module.css";
import { type WithdrawableAsset, useWithdrawableAssets } from "./useWithdrawableAssets";

type WithdrawStep = "form" | "success";

type RWithdrawFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RWithdrawFundsModal({
  isOpen,
  onClose,
}: RWithdrawFundsModalProps) {
  const queryClient = useQueryClient();
  const { bug } = useToasterContext();
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const { assets, isLoading: isAssetsLoading } = useWithdrawableAssets();
  const [step, setStep] = useState<WithdrawStep>("form");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAssetSlug, setSelectedAssetSlug] = useState<string>();
  const [transactionHash, setTransactionHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.tokenSlug === selectedAssetSlug) ?? assets[0],
    [assets, selectedAssetSlug]
  );

  useEffect(() => {
    if (!selectedAssetSlug && assets[0]) {
      setSelectedAssetSlug(assets[0].tokenSlug);
    }
  }, [assets, selectedAssetSlug]);

  const handleClose = () => {
    setStep("form");
    setRecipientAddress("");
    setAmount("");
    setTransactionHash("");
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAsset || !userAddress || !dapp) {
      bug("Wallet or token data is unavailable. Please try again.");
      return;
    }

    const requestedAmount = new BigNumber(amount);

    if (!isAddressValid(recipientAddress.trim())) {
      bug("Enter a valid Mavryk wallet address.");
      return;
    }

    if (
      !requestedAmount.isFinite() ||
      requestedAmount.lte(0) ||
      requestedAmount.gt(selectedAsset.availableBalance)
    ) {
      bug("Enter an amount within your available balance.");
      return;
    }

    try {
      const tezos = dapp.tezos();
      const transferParams = await toTransferParams(
        tezos,
        selectedAsset.tokenSlug,
        selectedAsset.metadata,
        userAddress,
        recipientAddress.trim(),
        requestedAmount
      );

      setIsSubmitting(true);

      const operation = isKTAddress(selectedAsset.metadata.address)
        ? await (
            await loadContract(tezos, selectedAsset.metadata.address)
          ).methodsObject.transfer(transferParams).send()
        : await tezos.wallet.transfer(transferParams).send();

      setTransactionHash(operation.opHash);
      await operation.confirmation();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rwa-wallet", userAddress] }),
        queryClient.invalidateQueries({ queryKey: ["rwa-wallet-portfolio", userAddress] }),
        queryClient.invalidateQueries({ queryKey: [userAddress, "fetchUserAssets"] }),
      ]);
      setStep("success");
    } catch (error) {
      if (error instanceof Error && error.message === "Declined") {
        setStep("form");
        return;
      }

      setStep("form");
      bug(error instanceof Error ? error.message : "Withdrawal failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTransactionHash = () => {
    void navigator.clipboard?.writeText(transactionHash);
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
        <form className={styles.content} onSubmit={handleSubmit}>
          <header className={styles.header}>
            <RHeading className={styles.title} size="h6" weight="medium">
              Withdraw Funds
            </RHeading>
            <RText className={styles.description} color="neutral-700" size="body-sm">
              Transfer funds from one Mavryk Wallet to another.
            </RText>
          </header>

          <div className={styles.fields}>
            <Field label="From">
              <div className={styles.staticField}>{userAddress ?? "Not connected"}</div>
            </Field>
            <Field label="To">
              <input
                className={styles.input}
                onChange={(event) => setRecipientAddress(event.target.value)}
                placeholder="Enter Address"
                required
                type="text"
                value={recipientAddress}
              />
            </Field>

            <div className={styles.eligibilityNotice}>
              <RIcon aria-hidden="true" name="check" size="small" />
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
                        <AssetImage
                          assetSlug={selectedAsset.tokenSlug}
                          className={styles.assetFaceImage}
                          metadata={selectedAsset.metadata}
                          size={24}
                        />
                        <span className={styles.assetValue}>
                          {selectedAsset.metadata.symbol}
                        </span>
                      </span>
                    ) : (
                      <span className={styles.assetValue}>Select</span>
                    )}
                  </RDropdownFaceContent>
                  <RDropdownBodyContent className={styles.assetMenu}>
                    {assets.map((asset) => (
                      <RDropdownBodyContentItem
                        className={styles.assetOption}
                        isSelected={asset.tokenSlug === selectedAsset?.tokenSlug}
                        key={asset.tokenSlug}
                        onClick={() => setSelectedAssetSlug(asset.tokenSlug)}
                      >
                        <AssetImage
                          assetSlug={asset.tokenSlug}
                          className={styles.assetOptionImage}
                          metadata={asset.metadata}
                          size={32}
                        />
                        <span className={styles.assetOptionLabel}>
                          <strong>{asset.metadata.symbol}</strong>
                          <span>{asset.metadata.name}</span>
                        </span>
                      </RDropdownBodyContentItem>
                    ))}
                  </RDropdownBodyContent>
                </RCustomDropdown>
              </Field>
              <Field className={styles.amountField} label="Amount">
                <span className={styles.amountLabel}>
                  Bal. {formatTokenAmount(selectedAsset?.availableBalance)} {selectedAsset?.metadata.symbol}
                </span>
                <div className={styles.amountInputRow}>
                  <input
                    className={styles.input}
                    inputMode="decimal"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter Amount"
                    required
                    type="text"
                    value={amount}
                  />
                  <button
                    className={styles.maxButton}
                    disabled={!selectedAsset}
                    onClick={() => setAmount(selectedAsset?.availableBalance.toFixed() ?? "")}
                    type="button"
                  >
                    Max
                  </button>
                </div>
              </Field>
            </div>

            <WithdrawalSummary amount={amount} asset={selectedAsset} />
          </div>

          <RButton className={styles.submitButton} disabled={!selectedAsset || isAssetsLoading} isLoading={isSubmitting} tone="black" type="submit">
            Withdraw Funds
          </RButton>
        </form>
      ) : (
        <SuccessStep
          amount={amount || "0.00"}
          asset={selectedAsset?.metadata.symbol ?? ""}
          onClose={handleClose}
          onCopy={handleCopyTransactionHash}
        />
      )}
    </CustomPopup>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")}>
      <RText size="body-sm">{label}</RText>
      {children}
    </label>
  );
}

function WithdrawalSummary({ amount, asset }: { amount: string; asset?: WithdrawableAsset }) {
  const requestedAmount = new BigNumber(amount);
  const displayAmount = requestedAmount.isFinite() ? requestedAmount : new BigNumber(0);
  const displayValue = asset?.availableBalanceUsd && asset.availableBalance.gt(0)
    ? displayAmount.times(asset.availableBalanceUsd).div(asset.availableBalance)
    : null;

  return (
    <section aria-label="Withdrawal summary" className={styles.summary}>
      <SummaryRow label="Summary" value={displayValue ? `$${displayValue.toFormat(2)}` : "-"} />
      <SummaryRow label="Withdraw Amount" value={`${formatTokenAmount(displayAmount)} ${asset?.metadata.symbol ?? ""}`} />
      <SummaryRow label="Network Fee" value="Shown in wallet" />
      <SummaryRow isTotal label="Total" value={displayValue ? `$${displayValue.toFormat(2)} + fee` : "-"} />
    </section>
  );
}

function formatTokenAmount(value?: BigNumber) {
  if (!value || !value.isFinite()) return "0";

  return value.decimalPlaces(6, BigNumber.ROUND_DOWN).toFormat();
}

function SummaryRow({
  isTotal = false,
  label,
  value,
}: {
  isTotal?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className={isTotal ? styles.summaryTotal : styles.summaryRow}>
      <RText size="body-sm" weight={isTotal ? "medium" : "regular"}>{label}</RText>
      <RText size="body-sm" weight="medium">{value}</RText>
    </div>
  );
}

function SuccessStep({
  amount,
  asset,
  onClose,
  onCopy,
}: {
  amount: string;
  asset: string;
  onClose: () => void;
  onCopy: () => void;
}) {
  return (
    <div className={styles.statusContent}>
      <div className={styles.successIcon}><RIcon aria-hidden="true" name="check" size="medium" /></div>
      <div className={styles.successHeader}>
        <RHeading className={styles.title} size="h6" weight="medium">Withdraw Confirmed</RHeading>
        <RText className={styles.description} color="neutral-700" size="body-sm">
          Your funds have been successfully transferred.<br />
          <strong>{amount} {asset}</strong> is now available in your wallet and ready to use.
        </RText>
      </div>
      <div className={styles.transactionPill}>
        <span className={styles.confirmed}><span className={styles.confirmedDot} />Confirmed on-chain</span>
        <span className={styles.transactionDivider} />
        <span className={styles.transaction}>Txn <button aria-label="Copy transaction hash" onClick={onCopy} type="button">{transactionHash}<RIcon aria-hidden="true" name="copy" size="small" /></button></span>
      </div>
      <div className={styles.successDivider} />
      <RButton className={styles.submitButton} onClick={onClose} tone="black">OK</RButton>
    </div>
  );
}
