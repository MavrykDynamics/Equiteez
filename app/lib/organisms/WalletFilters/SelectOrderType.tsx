import React, { useMemo } from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import styles from "./styles.module.css";
import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from "~/lib/organisms/CustomDropdown/CustomDropdown";
import {
  OrderIconByType,
  OrderNameByType,
  OrderTypes,
} from "~/lib/apis/mbrwa/user/userOrders/order.const";

export function SelectOrderType({
  selectedOrderType,
  setOrderType,
  title,
  placeholder,
  options,
  customWidth,
}: {
  selectedOrderType: string;
  setOrderType: (value: string) => void;
  title: string;
  placeholder: string;
  customWidth?: number;
  options?: { label: string; value: string; icon: React.ReactNode }[];
}) {
  const allOptions = useMemo(
    () =>
      options || [
        {
          icon: OrderIconByType[OrderTypes.LIMIT_SELL],
          label: OrderNameByType[OrderTypes.LIMIT_SELL],
          value: OrderTypes.LIMIT_SELL,
        },
        {
          icon: OrderIconByType[OrderTypes.LIMIT_BUY],
          label: OrderNameByType[OrderTypes.LIMIT_BUY],
          value: OrderTypes.LIMIT_BUY,
        },
      ],
    [options]
  );

  const selectedOption = useMemo(() => {
    if (!selectedOrderType) return null;
    return allOptions.find((item) => item.value === selectedOrderType) || null;
  }, [allOptions, selectedOrderType]);

  return (
    <div className="flex flex-col gap-[12px]">
      <Text weight="semibold">{title}</Text>
      <CustomDropdown>
        <ClickableDropdownArea>
          <DropdownFaceContent
            gap={12}
            openedClassName={styles.selectWrapperActive}
            className={styles.selectWrapper}
            iconClassName={styles.selectIcon}
          >
            {selectedOption ? (
              <div className="flex items-center gap-[8px]">
                <Text>{selectedOption.icon}</Text>
                <Text size="smallBody">
                  {selectedOption.label}
                </Text>
              </div>
            ) : (
              <Text size="smallBody" color="lightSand">
                {placeholder}
              </Text>
            )}
          </DropdownFaceContent>

          <DropdownBodyContent
            position="right"
            topMargin={10}
            customWidth={customWidth}
          >
            <div className="flex flex-col">
              {allOptions.map((item) => (
                <div
                  role="listitem"
                  onClick={() => {
                    setOrderType(item.value);
                  }}
                  className={styles.selectCoinListItem}
                  key={item.value}
                >
                  <Text>{item.icon}</Text>
                  <Text size="smallBody">
                    {item.label}
                  </Text>
                </div>
              ))}
            </div>
          </DropdownBodyContent>
        </ClickableDropdownArea>
      </CustomDropdown>
    </div>
  );
}
