import styles from "./styles.module.css";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import classNames from "clsx";
import { RButton } from "~/lib/atoms/RButton";
import { RText } from "~/lib/atoms/RTypography/RText";

export function CancelOrderPopup({
  description = "Are you sure you want to cancel your order?",
  isOpen,
  onClose,
  onSubmit,
  submitLabel = "Cancel Order",
  title = "Confirm Cancellation",
}: {
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  submitLabel?: string;
  title?: string;
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
          <RText size="body-l" weight="medium">
            {title}
          </RText>
          <RText size="body-sm">{description}</RText>
        </div>
        <div className={styles.btnWrapper}>
          <RButton onClick={onSubmit} className="flex-1" tone="black">
            {submitLabel}
          </RButton>
          <RButton
            onClick={onClose}
            className="flex-1"
            variant="secondary"
            tone="black"
          >
            Keep Order
          </RButton>
        </div>
      </div>
    </CustomPopup>
  );
}
