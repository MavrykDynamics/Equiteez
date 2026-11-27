import clsx from "clsx";
import QRCode from "react-qr-code";

import { Icon } from "~/lib/atoms/Icon";
import { CopyButton } from "~/lib/atoms/CopyButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "../RDepositFundsModal.module.css";

type ReceiveViewProps = {
  mavrykAddress: string;
  /** Replaces the default text, which points to the modal's Bridge tab */
  description?: string;
  /** false outside the deposit modal's tabs */
  isTabPanel?: boolean;
};

export function ReceiveView({
  mavrykAddress,
  description,
  isTabPanel = true,
}: ReceiveViewProps) {
  return (
    <div
      className={styles.receivePanel}
      role={isTabPanel ? "tabpanel" : undefined}
    >
      <RText
        className={styles.receiveDescription}
        color="neutral-600"
        size="body-sm"
      >
        {description ??
          "Send USDT from another Mavryk Wallet straight to this address. This is for assets already on Mavryk. To move funds from Ethereum, use the Bridge tab."}
      </RText>
      <div className={styles.addressBlock}>
        <div className={styles.qrCode}>
          <QRCode
            aria-label="QR code for the Mavryk deposit address"
            role="img"
            value={mavrykAddress}
            size={146}
          />
        </div>
        <CopyButton
          aria-label="Copy Mavryk deposit address"
          className={styles.addressField}
          mode="reverse"
          text={mavrykAddress}
          type="block"
        >
          <RText size="body-sm">{mavrykAddress}</RText>
          <RIcon
            aria-hidden="true"
            className={styles.copyIcon}
            name="copy"
            size="medium"
          />
        </CopyButton>
      </div>
      <div className={clsx(styles.notice, styles.warning)}>
        <div className="flex items-start justify-center mt-1">
          <Icon className="w-4 h-4" icon="warning" />
        </div>
        <RText color="neutral-700" size="body-sm">
          <strong>Send only Mavryk assets to this address.</strong>
          <br />
          Sending assets straight from Ethereum or another chain to this address
          will lose them. Use the bridge for anything on Ethereum.
        </RText>
      </div>
    </div>
  );
}
