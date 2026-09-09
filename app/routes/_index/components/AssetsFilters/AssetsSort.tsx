import clsx from "clsx";

import { RText } from "~/lib/atoms/RTypography/RText";
import {
  RCustomDropdown,
  RDropdownBodyContent,
  RDropdownBodyContentItem,
  RDropdownFaceContent,
} from "~/lib/organisms/RCustomDropdown/RCustomDropdown";

import type { AssetsSortOption } from "./assetsFilters.types";
import styles from "./styles.module.css";

type AssetsSortProps = {
  className?: string;
  onChange: (value: string) => void;
  options: AssetsSortOption[];
  value: string;
};

export function AssetsSort({
  className,
  onChange,
  options,
  value,
}: AssetsSortProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={clsx(styles.sort, className)}>
      <RText className={styles.sortTitle} size="body-sm">
        Sort By
      </RText>
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
