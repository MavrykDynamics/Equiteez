import { useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";

import { RInput } from "~/lib/atoms/RInput/RInput";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RSelectList.module.css";

export type RSelectListItem = {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  /** Right-aligned primary value, e.g. a balance. */
  value?: ReactNode;
  /** Right-aligned secondary value under `value`. */
  subValue?: ReactNode;
  disabled?: boolean;
  isSelected?: boolean;
  /** Extra text matched by the search besides `title`. */
  keywords?: string[];
};

export type RSelectListSection = {
  id: string;
  title?: ReactNode;
  items: RSelectListItem[];
};

export type RSelectListProps = {
  sections: RSelectListSection[];
  onSelect: (id: string) => void;
  searchPlaceholder: string;
  /** Accessible name of the option list. */
  label: string;
  emptyText?: string;
  className?: string;
};

const matches = (item: RSelectListItem, query: string) =>
  [item.title, ...(item.keywords ?? [])].some((text) =>
    text.toLowerCase().includes(query)
  );

/** Searchable picker list with headed sections and dimmed unavailable rows. */
export function RSelectList({
  sections,
  onSelect,
  searchPlaceholder,
  label,
  emptyText = "Nothing matches your search.",
  className,
}: RSelectListProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: query
            ? section.items.filter((item) => matches(item, query))
            : section.items,
        }))
        .filter((section) => section.items.length > 0),
    [query, sections]
  );

  return (
    <div className={clsx(styles.list, className)}>
      <RInput
        aria-label={searchPlaceholder}
        autoComplete="off"
        className={styles.search}
        icon="search"
        iconSize="small"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={search}
      />
      {visible.length === 0 ? (
        <RText
          className={styles.empty}
          color="neutral-700"
          role="status"
          size="body-sm"
        >
          {emptyText}
        </RText>
      ) : (
        <div aria-label={label} className={styles.sections} role="listbox">
          {visible.map((section) => (
            <div
              aria-label={
                typeof section.title === "string" ? section.title : undefined
              }
              className={styles.section}
              key={section.id}
              role="group"
            >
              {section.title && (
                <RText
                  className={styles.sectionTitle}
                  color="neutral-700"
                  size="body-s"
                >
                  {section.title}
                </RText>
              )}
              {section.items.map((item) => (
                <button
                  aria-disabled={item.disabled || undefined}
                  aria-selected={Boolean(item.isSelected)}
                  className={styles.row}
                  data-selected={item.isSelected || undefined}
                  disabled={item.disabled}
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  role="option"
                  type="button"
                >
                  <span className={styles.rowIcon}>{item.icon}</span>
                  <span className={styles.rowCopy}>
                    <span className={styles.rowTitle}>{item.title}</span>
                    {item.subtitle && (
                      <span className={styles.rowSubtitle}>
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                  {(item.value || item.subValue) && (
                    <span className={styles.rowValues}>
                      {item.value && (
                        <span className={styles.rowValue}>{item.value}</span>
                      )}
                      {item.subValue && (
                        <span className={styles.rowSubValue}>
                          {item.subValue}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
