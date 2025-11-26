import React from "react";
import styles from "./styles.module.css";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
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
          className="w-6 h-6 cursor-pointer relative text-white stroke-current"
          onClick={handleClose}
        />
      </button>
      <div className={styles.contentWrapper}>
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Heading level="4">Deposit Into Account</Heading>
          <Text>Send Crypto to your Wallet</Text>
        </div>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[4px] lg:gap-[12px]">
            <div className={styles.attentionBLock}>
              <AttentionIcon className="min-w-[32px]" />
              <div className="flex flex-col">
                <Text weight="bold">Please Note</Text>
                <Text size="smallBody">
                  You can deposit only USDT and MVRK. Any other assets won’t be
                  credited to your account.
                </Text>
              </div>
            </div>
            <div className="flex flex-col gap-[12px]">
              <Text weight="bold">Network</Text>
              <div className={styles.textItem}>
                <span>
                  <Text size="smallBody" weight="bold">
                    MVRK
                  </Text>{" "}
                  <Text size="smallBody" weight="bold" color="lightBlue">
                    Mavryk Network (MRC20)
                  </Text>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[12px]">
            <Text weight="bold">Deposit Address</Text>
            <div className={styles.textItem}>
              <Text size="smallBody" weight="bold">
                {depositAddress}
              </Text>
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
