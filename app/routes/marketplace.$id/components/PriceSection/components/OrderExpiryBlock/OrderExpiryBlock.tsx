import { useId, useState, type FC } from "react";

import { Checkbox } from "~/lib/atoms/CheckBox";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import styles from "./OrderExpiryBlock.module.css";

const SECONDS_IN_DAY = 24 * 60 * 60;

export const ORDER_EXPIRY_OPTIONS = [
  { id: "1d", label: "1 day", seconds: SECONDS_IN_DAY },
  { id: "7d", label: "7 days", seconds: 7 * SECONDS_IN_DAY },
  { id: "30d", label: "30 days", seconds: 30 * SECONDS_IN_DAY },
  { id: "90d", label: "90 days", seconds: 90 * SECONDS_IN_DAY },
] as const;

export type OrderExpiryPeriodId = (typeof ORDER_EXPIRY_OPTIONS)[number]["id"];

type OrderExpiryBlockProps = {
  selectedPeriodId: OrderExpiryPeriodId | null;
  setSelectedPeriodId: (periodId: OrderExpiryPeriodId | null) => void;
};

const ORDER_EXPIRY_TOOLTIP =
  "Set an expiry date to automatically cancel the order if it hasn't been filled. If no expiry date is set, the order remains in the order book until it is filled or manually cancelled.";

export const getOrderExpiryTimestamp = (
  periodId: OrderExpiryPeriodId,
  fromDate = new Date()
) => {
  const selectedOption = ORDER_EXPIRY_OPTIONS.find(
    (option) => option.id === periodId
  );

  if (!selectedOption) return null;

  return new Date(
    fromDate.getTime() + selectedOption.seconds * 1000
  ).toISOString();
};

export const OrderExpiryBlock: FC<OrderExpiryBlockProps> = ({
  selectedPeriodId,
  setSelectedPeriodId,
}) => {
  const checkboxId = useId();
  const [isExpiryEnabled, setIsExpiryEnabled] = useState(true);
  const selectedPeriod = ORDER_EXPIRY_OPTIONS.find(
    (option) => option.id === selectedPeriodId
  );

  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <label className={styles.checkboxLabel} htmlFor={checkboxId}>
          <Checkbox
            checked={isExpiryEnabled}
            id={checkboxId}
            onChange={(checked) => {
              setIsExpiryEnabled(checked);

              if (!checked) {
                setSelectedPeriodId(null);
              }
            }}
          />
          <span>Set an expiry date</span>
        </label>

        <InfoTooltip
          className={styles.infoIcon}
          content={ORDER_EXPIRY_TOOLTIP}
        />
      </div>

      <RCustomDropdown className={styles.dropdown} disabled={!isExpiryEnabled}>
        <RDropdownFaceContent
          aria-label="Choose order expiry period"
          className={styles.dropdownTrigger}
          placeholder="Choose period"
        >
          {selectedPeriod?.label}
        </RDropdownFaceContent>
        <RDropdownBodyContent align="right" className={styles.dropdownMenu}>
          {ORDER_EXPIRY_OPTIONS.map((option) => (
            <RDropdownBodyContentItem
              className={styles.dropdownOption}
              isSelected={option.id === selectedPeriodId}
              key={option.id}
              onClick={() => setSelectedPeriodId(option.id)}
            >
              {option.label}
            </RDropdownBodyContentItem>
          ))}
        </RDropdownBodyContent>
      </RCustomDropdown>
    </section>
  );
};
