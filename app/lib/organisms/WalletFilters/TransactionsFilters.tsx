import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { Icon } from "~/lib/atoms/Icon";
import { Text } from "~/lib/atoms/Typography/Text";
import { Button } from "~/lib/atoms/Button";
import { SelectOrderType } from "~/lib/organisms/WalletFilters/SelectOrderType";
import SellIcon from "app/icons/wallet/sell.svg?react";
import BuyIcon from "app/icons/wallet/buy.svg?react";
import WithdrawIcon from "app/icons/wallet/send.svg?react";
import DepositIcon from "app/icons/wallet/upload.svg?react";
import { FilterPopup } from "~/lib/organisms/WalletFilters/FilterPopup";

export function TransactionsFilters({
  applyFilter,
  selectedType,
}: {
  applyFilter: (orderType: string) => void;
  selectedType: string;
}) {
  const [orderType, setOrderType] = useState("");
  const [isOpenFilterPopup, setIsOpenFilterPopup] = useState(false);

  useEffect(() => {
    setOrderType(selectedType);
  }, [selectedType]);

  const allOptions = useMemo(
    () => [
      // {
      //   icon: <BuyIcon />,
      //   label: "Buy",
      //   value: "1",
      // },
      // {
      //   icon: <SellIcon />,
      //   label: "Sell",
      //   value: "2",
      // },
      // {
      //   icon: <WithdrawIcon />,
      //   label: "Withdraw",
      //   value: "3",
      // },
      // {
      //   icon: <DepositIcon />,
      //   label: "Deposit",
      //   value: "4",
      // },
      // {
      //   icon: OpenOrderIconByType[OpenOrderType.buy],
      //   label: OpenOrderNameByType[OpenOrderType.buy],
      //   value: OpenOrderType.buy,
      // },
      // {
      //   icon: OpenOrderIconByType[OpenOrderType.sell],
      //   label: OpenOrderNameByType[OpenOrderType.sell],
      //   value: OpenOrderType.sell,
      // },
    ],
    []
  );

  return (
    <>
      <div className={styles.desktopContent}>
        <CustomDropdown>
          <ClickableDropdownArea>
            <DropdownFaceContent
              gap={12}
              openedClassName={styles.dropdownWrapperActive}
              className={styles.dropdownWrapper}
              iconClassName={styles.dropdownIcon}
            >
              <Icon icon="filter" className={styles.accountIcon} />
              <span className="hidden lg:inline">Filter</span>
            </DropdownFaceContent>

            <DropdownBodyContent
              customOverflow="visible"
              position="right"
              topMargin={10}
              customWidth={326}
            >
              <div className={styles.filterContentWrapper}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex flex-col gap-[16px]"
                >
                  <Text weight="extraBold">Filter</Text>
                  <div className={styles.line} />
                  <div>
                    <SelectOrderType
                      selectedOrderType={orderType}
                      setOrderType={setOrderType}
                      title="Action"
                      placeholder="Select Action"
                      customWidth={294}
                      options={allOptions}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <Button
                    onClick={() => {
                      setOrderType("");
                      applyFilter("");
                    }}
                    className="flex-1"
                    disabled={!orderType}
                    variant="outline"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      applyFilter(orderType);
                    }}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </DropdownBodyContent>
          </ClickableDropdownArea>
        </CustomDropdown>
      </div>

      <div className={styles.mobileContent}>
        <Button
          onClick={() => setIsOpenFilterPopup(true)}
          className={styles.dropdownWrapper}
          variant="outline"
        >
          <Icon icon="filter" className={styles.accountIcon} />
        </Button>
        <FilterPopup
          applyFilter={applyFilter}
          isOpen={isOpenFilterPopup}
          setOrderType={setOrderType}
          orderType={orderType}
          selectedType={selectedType}
          title="Action"
          placeholder="Action"
          options={allOptions}
          handleClose={() => {
            setIsOpenFilterPopup(false);
          }}
        />
      </div>
    </>
  );
}
