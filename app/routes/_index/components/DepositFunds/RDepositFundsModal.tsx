import { useState } from "react";

import UsdtToken from "~/assets/redesign/deposit/UsdtToken.png";
import DepositAddressQr from "~/assets/redesign/deposit/DepositAddressQr.png";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";

import styles from "./RDepositFundsModal.module.css";

type DepositTab = "bridge" | "receive";

type RDepositFundsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const mockMavrykAddress = "mv1RtVe9xQm3nK7wZ2aBcD4eF5gH6jL8sPqd";

export function RDepositFundsModal({
  isOpen,
  onClose,
}: RDepositFundsModalProps) {
  const [activeTab, setActiveTab] = useState<DepositTab>("bridge");
  const [depositAmount, setDepositAmount] = useState("");

  const handleCopyAddress = () => {
    void navigator.clipboard?.writeText(mockMavrykAddress);
  };

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Deposit funds"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close deposit funds"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <RHeading className={styles.title} size="h6" weight="medium">
            Deposit Funds
          </RHeading>
          <div
            aria-label="Deposit method"
            className={styles.tabs}
            role="tablist"
          >
            <button
              aria-selected={activeTab === "bridge"}
              className={styles.tab}
              data-active={activeTab === "bridge"}
              onClick={() => setActiveTab("bridge")}
              role="tab"
              type="button"
            >
              Bridge From Ethereum
            </button>
            <button
              aria-selected={activeTab === "receive"}
              className={styles.tab}
              data-active={activeTab === "receive"}
              onClick={() => setActiveTab("receive")}
              role="tab"
              type="button"
            >
              Receive On Mavryk
            </button>
          </div>
        </div>

        {activeTab === "bridge" ? (
          <div className={styles.bridgePanel} role="tabpanel">
            <div className={styles.amountFields}>
              <AmountField
                amount={depositAmount}
                balanceText="Connect wallet to view balance"
                label="Send from Ethereum"
                onChange={setDepositAmount}
                topAction="Connect Wallet"
              />
              <AmountField
                amount={depositAmount || "0.00"}
                balanceText="Bal. 200.00 USDT"
                label="Receive on MVRK"
                readOnly
                topAction="mv1xxxxxx...xxx"
              />
            </div>
            <div className={styles.exchangeDetails}>
              <RText color="neutral-600" size="body-s">
                1 USDT = 1 USDT
              </RText>
              <div className={styles.networkDetails}>
                <RText color="neutral-600" size="body-s">
                  Time: ≈2s
                </RText>
                <RText color="neutral-600" size="body-s">
                  Fee: 0.01 MVRK
                </RText>
              </div>
            </div>
            <RButton className={styles.connectButton} tone="black">
              Connect Ethereum Wallet
            </RButton>
          </div>
        ) : (
          <div className={styles.receivePanel} role="tabpanel">
            <RText
              className={styles.receiveDescription}
              color="neutral-600"
              size="body-sm"
            >
              Send USDT from another Mavryk Wallet straight to this address. To
              move funds from Ethereum, use the Bridge tab.
            </RText>
            <div className={styles.addressBlock}>
              <div className={styles.qrCode}>
                <img
                  alt="Mock QR code for the Mavryk deposit address"
                  src={DepositAddressQr}
                />
              </div>
              <div className={styles.addressField}>
                <RText size="body-sm">{mockMavrykAddress}</RText>
                <button
                  aria-label="Copy Mavryk deposit address"
                  className={styles.copyButton}
                  onClick={handleCopyAddress}
                  type="button"
                >
                  <RIcon name="copy" size="medium" />
                </button>
              </div>
            </div>
            <div className={styles.warning}>
              <RText color="neutral-600" size="body-sm">
                <strong>Send only Mavryk assets to this address.</strong>
                <br />
                Sending assets straight from Ethereum or another chain to this
                address will lose them. Use the bridge for anything on Ethereum.
              </RText>
            </div>
          </div>
        )}
      </div>
    </CustomPopup>
  );
}

type AmountFieldProps = {
  amount: string;
  balanceText: string;
  label: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  topAction: string;
};

function AmountField({
  amount,
  balanceText,
  label,
  onChange,
  readOnly = false,
  topAction,
}: AmountFieldProps) {
  return (
    <label className={styles.amountField}>
      <span className={styles.fieldHeader}>
        <RText color="neutral-600" size="body-s">
          {label}
        </RText>
        <span className={styles.fieldAction}>{topAction}</span>
      </span>
      <span className={styles.amountRow}>
        <span className={styles.currency}>
          <img alt="USDT" src={UsdtToken} />
          <RText size="body-s">USDT</RText>
        </span>
        <input
          aria-label={`${label} amount`}
          className={styles.amountInput}
          inputMode="decimal"
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="0.00"
          readOnly={readOnly}
          type="text"
          value={amount}
        />
      </span>
      <span className={styles.fieldFooter}>
        <RText color="neutral-600" size="body-s">
          {balanceText}
        </RText>
        <RText color="neutral-600" size="body-s">
          $0.00
        </RText>
      </span>
    </label>
  );
}
