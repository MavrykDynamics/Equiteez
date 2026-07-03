import { FC } from "react";
import { DefaultPopupProps } from "../../popup.provider.types";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";

import styles from "./transactionOperation.module.css";
import clsx from "clsx";

export type TransactionOperationPopupProps = {
  subTitle: string | React.ReactNode | null;
  title: string | React.ReactNode | null;
  body: string | React.ReactNode | null;
} & DefaultPopupProps;

export const TransactionOperationPopup: FC<TransactionOperationPopupProps> = ({
  subTitle,
  title,
  body,
  isOpen,
  onRequestClose,
}) => {
  return (
    <CustomPopup
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentPosition={"center"}
      overlayClassName="z-[9999]"
      className={styles.popup}
    >
      <button className="absolute top-4 right-4 md:top-11 md:right-11 z-10">
        <CloseIcon
          className="w-6 h-6 cursor-pointer relative text-sand-900 stroke-current"
          onClick={onRequestClose}
        />
      </button>
      <div className="flex flex-col">
        <div className={clsx("mb-2", styles.subTitle)}>{subTitle}</div>
        <div className={clsx("block mx-auto mb-6 md:mb-8", styles.title)}>
          {title}
        </div>
        <div className="text-sand-900">{body}</div>
      </div>
    </CustomPopup>
  );
};
