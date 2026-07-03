import styles from "./styles.module.css";
import classNames from "clsx";
import React from "react";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import CloseIcon from "app/icons/cross.svg?react";
import { Text } from "~/lib/atoms/Typography/Text";
import { SelectOrderType } from "~/lib/organisms/WalletFilters/SelectOrderType";
import { Button } from "~/lib/atoms/Button";

export function FilterPopup({
  isOpen,
  applyFilter,
  handleClose,
  orderType,
  setOrderType,
  selectedType,
  options,
  title,
  placeholder,
}: {
  isOpen: boolean;
  handleClose: () => void;
  applyFilter: (orderType: string) => void;
  setOrderType: (value: string) => void;
  selectedType: string;
  title: string;
  placeholder: string;
  orderType: string;
  options?: { label: string; value: string; icon: React.ReactNode }[];
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
      <div className="flex flex-col h-full justify-between">
        <div className={styles.contentWrapper}>
          <Text weight="semibold">Filter</Text>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <SelectOrderType
              selectedOrderType={orderType}
              setOrderType={setOrderType}
              placeholder={placeholder}
              title={title}
              options={options}
            />
          </div>
        </div>
        <div className={styles.btnWrapper}>
          <Button
            onClick={() => {
              applyFilter("");
              handleClose();
            }}
            className="flex-1"
            disabled={!selectedType}
            variant="outline"
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              applyFilter(orderType);
              handleClose();
            }}
            className="flex-1"
          >
            Apply
          </Button>
        </div>
      </div>
    </CustomPopup>
  );
}
