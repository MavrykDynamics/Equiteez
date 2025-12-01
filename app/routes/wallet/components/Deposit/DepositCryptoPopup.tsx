import React from "react";
import styles from "./styles.module.css";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import { Icon } from "~/lib/atoms/Icon";
import { CopyButton } from "~/lib/atoms/CopyButton";
import { QrCode } from "~/routes/wallet/components/Deposit/QrCode";
import AttentionIcon from "app/icons/wallet/attension.svg?react";

export function DepositCryptoPopup({
  isOpen,
  handleClose,
  depositAddress,
}: {
  isOpen: boolean;
  handleClose: () => void;
  depositAddress: string;
}) {
  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition={"center"}
      className={classNames(
        "max-h-screen px-11 py-14 z-100 relative",
        styles.popupWrapper
      )}
    >
      <button className="absolute top-6 right-7 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-current stroke-current"
          onClick={handleClose}
        />
      </button>
      <div className={styles.contentWrapper}>
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Text size="largeBody" weight="semibold">
            Deposit Into Account
          </Text>
          <Text>Send Crypto to your Wallet</Text>
        </div>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[4px] lg:gap-[12px]">
            <div className={styles.attentionBLock}>
              <AttentionIcon className="min-w-[32px]" />
              <div className="flex flex-col gap-[4px]">
                <Text weight="semibold">Please Note</Text>
                <Text size="smallBody" color="lightSand">
                  You can deposit only USDT, MVRK, and RWA assets listed on the
                  platform. Any other assets won’t be credited to your account
                  and will not be recoverable.
                </Text>
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <Text size="smallBody">Network</Text>
              <div className={styles.textItem}>
                <span>
                  <Text weight="semibold">MVRK</Text>{" "}
                  <Text color="extraLightSand">Mavryk Network (MRC20)</Text>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <Text size="smallBody">Deposit Address</Text>
            <div className={styles.textItem}>
              <Text>{depositAddress}</Text>
              <CopyButton text={depositAddress}>
                <Text>
                  <Icon icon="copy" />
                </Text>
              </CopyButton>
            </div>
          </div>

          <div className={styles.qrCodeWrapper}>
            <QrCode address={depositAddress} />
          </div>
        </div>
      </div>
    </CustomPopup>
  );
}
