import React from "react";
import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { Heading } from "~/lib/atoms/Typography/Heading";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";

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
          className="w-6 h-6 cursor-pointer relative text-white stroke-current"
          onClick={onClose}
        />
      </button>
      <div className={styles.contentWrapper}>
        <div className="flex flex-col gap-[8px] justify-center items-center">
          <Heading level="4">Confirm Cancellation</Heading>
          <Text size="smallBody">
            Are you sure you want to cancel your order?
          </Text>
        </div>
        <div className={styles.btnWrapper}>
          <ButtonV2
            onClick={onClose}
            className="flex-1"
            variant="yellowOutlined"
          >
            Keep Order
          </ButtonV2>
          <ButtonV2
            onClick={onSubmit}
            className="flex-1"
            variant="yellowPrimary"
          >
            Cancel Order
          </ButtonV2>
        </div>
      </div>
    </CustomPopup>
  );
}
