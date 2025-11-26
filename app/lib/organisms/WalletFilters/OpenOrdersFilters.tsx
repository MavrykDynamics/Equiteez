import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import { Icon } from "~/lib/atoms/Icon";
import { Text } from "~/lib/atoms/Typography/Text";
import { ButtonV2 } from "~/lib/atoms/ButtonV2/ButtonV2";
import { SelectOrderType } from "~/lib/organisms/WalletFilters/SelectOrderType";
import { FilterPopup } from "~/lib/organisms/WalletFilters/FilterPopup";

export function OpenOrdersFilters({
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
                      placeholder="Select Type"
                      title="Limit Type"
                      customWidth={294}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-[12px]">
                  <ButtonV2
                    onClick={() => {
                      setOrderType("");
                      applyFilter("");
                    }}
                    className="flex-1"
                    disabled={!orderType}
                    variant="yellowOutlined"
                  >
                    Reset
                  </ButtonV2>
                  <ButtonV2
                    onClick={() => {
                      applyFilter(orderType);
                    }}
                    className="flex-1"
                    variant="yellowPrimary"
                  >
                    Apply
                  </ButtonV2>
                </div>
              </div>
            </DropdownBodyContent>
          </ClickableDropdownArea>
        </CustomDropdown>
      </div>

      <div className={styles.mobileContent}>
        <ButtonV2
          onClick={() => setIsOpenFilterPopup(true)}
          className={styles.dropdownWrapper}
          variant="yellowOutlined"
        >
          <Icon icon="filter" className={styles.accountIcon} />
        </ButtonV2>
        <FilterPopup
          applyFilter={applyFilter}
          isOpen={isOpenFilterPopup}
          setOrderType={setOrderType}
          orderType={orderType}
          selectedType={selectedType}
          placeholder="Select Type"
          title="Limit Type"
          handleClose={() => {
            setIsOpenFilterPopup(false);
          }}
        />
      </div>
    </>
  );
}
