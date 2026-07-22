import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import styles from "./styles.module.css";

export type AssetsSortOption = {
  label: string;
  value: string;
};

type AssetsSortProps = {
  onChange: (value: string) => void;
  options: AssetsSortOption[];
  value: string;
};

export function AssetsSort({ onChange, options, value }: AssetsSortProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={styles.sort}>
      <RText size="body-sm" className={styles.sortTitle}>Sort By</RText>
      <RCustomDropdown className={styles.sortDropdown}>
        <RDropdownFaceContent className={styles.sortDropdownTrigger}>
          {selectedOption?.label ?? "Sort"}
        </RDropdownFaceContent>
        <RDropdownBodyContent align="right">
          {options.map((option) => (
            <RDropdownBodyContentItem
              isSelected={option.value === value}
              key={option.value}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </RDropdownBodyContentItem>
          ))}
        </RDropdownBodyContent>
      </RCustomDropdown>
    </div>
  );
}
