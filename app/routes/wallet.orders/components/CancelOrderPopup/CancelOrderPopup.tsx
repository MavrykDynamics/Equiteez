import React from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";

export function CancelOrderPopup({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
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
          className="w-6 h-6 cursor-pointer relative stroke-current"
          onClick={onClose}
        />
      </button>
      <div className={styles.contentWrapper}>
        <div className="flex flex-col gap-[8px] justify-center items-center">
          <Text weight="semibold">Confirm Cancellation</Text>
          <Text size="smallBody">
            Are you sure you want to cancel your order?
          </Text>
        </div>
        <div className={styles.btnWrapper}>
          <Button onClick={onSubmit} className="flex-1" variant="outline">
            Cancel Order
          </Button>
          <Button onClick={onClose} className="flex-1">
            Keep Order
          </Button>
        </div>
      </div>
    </CustomPopup>
  );
}
