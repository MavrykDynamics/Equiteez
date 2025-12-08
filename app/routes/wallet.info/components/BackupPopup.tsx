import React, { useState } from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";
import AttentionIcon from "app/icons/wallet/attension.svg?react";
import { Checkbox } from "~/lib/atoms/CheckBox";

export function BackupPopup({
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
        <Text size="largeBody" weight="semibold">
          Manual Backup
        </Text>
        <div className="flex flex-col gap-[12px]">
          <div className={styles.attentionBLock}>
            <AttentionIcon className="min-w-[32px]" />
            <div className="flex flex-col gap-[4px]">
              <Text weight="semibold">Be Careful!</Text>
              <Text size="smallBody" color="lightSand">
                Losing your backup means permanently losing access to your
                wallet and funds. Store your backup securely offline and never
                share it with anyone. Multibank.io cannot restore it if lost.
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
          <Button onClick={onClose} className="flex-1" variant="outline">
            Cancel
          </Button>
          <Button onClick={onSubmit} className="flex-1" disabled={!isAgree}>
            Manual Backup
          </Button>
        </div>
      </div>
    </CustomPopup>
  );
}
