import React, { useState } from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import AttentionIcon from "app/icons/wallet/attension.svg?react";
import { Checkbox } from "~/lib/atoms/CheckBox";

export function ExportKeyPopup({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
  const [isAgree, setIsAgree] = useState(false);

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
          onClick={onClose}
        />
      </button>
      <div className={styles.contentWrapper}>
        <Heading level="4">Export Private Key</Heading>
        <div className="flex flex-col gap-[12px]">
          <div className={styles.attentionBLock}>
            <AttentionIcon className="min-w-[32px]" />
            <div className="flex flex-col">
              <Text weight="bold">Be Careful!</Text>
              <Text size="smallBody">
                Your private key gives full access to your wallet and funds.
                Anyone with it can control your assets.Export it only to a safe,
                offline location and never share it. If lost or stolen, it
                cannot be recovered.
              </Text>
            </div>
          </div>
          <div
            onClick={() => setIsAgree((prevState) => !prevState)}
            className="flex cursor-pointer items-center gap-[8px]"
          >
            <Checkbox checked={isAgree} />
            <Text>I understand the risks and want to proceed</Text>
          </div>
        </div>
        <div className={styles.btnWrapper}>
          <ButtonV2
            onClick={onClose}
            className="flex-1"
            variant="yellowOutlined"
          >
            Cancel
          </ButtonV2>
          <ButtonV2
            onClick={onSubmit}
            className="flex-1"
            disabled={!isAgree}
            variant="yellowPrimary"
          >
            Export Key
          </ButtonV2>
        </div>
      </div>
    </CustomPopup>
  );
}
