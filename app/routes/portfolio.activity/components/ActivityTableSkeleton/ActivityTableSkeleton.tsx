import { RSkeleton } from "~/lib/atoms/RSkeleton";

import skeletonStyles from "./ActivityTableSkeleton.module.css";

export type ActivitySkeletonCell =
  | "date"
  | "asset"
  | "text"
  | "badge"
  | "progress"
  | "icon";

// The tab's own CSS module: the skeleton reuses its content, viewport, table,
// headerRow, row, headerCell and cell classes, so the columns follow the tab's
// grid template and line up with the loaded table
type ActivityTableStyles = Readonly<Record<string, string>>;

type ActivityTableSkeletonProps = {
  ariaLabel: string;
  columns: ActivitySkeletonCell[];
  rowsCount?: number;
  styles: ActivityTableStyles;
};

const range = (length: number) => Array.from({ length }, (_, index) => index);

function SkeletonCell({ type }: { type: ActivitySkeletonCell }) {
  switch (type) {
    case "date":
      return (
        <div className={skeletonStyles.lines}>
          <RSkeleton
            radius="none"
            className={skeletonStyles.date}
            variant="surface"
          />
          <RSkeleton
            radius="none"
            className={skeletonStyles.time}
            variant="surface"
          />
        </div>
      );
    case "asset":
      return (
        <div className={skeletonStyles.asset}>
          <RSkeleton
            className={skeletonStyles.assetIcon}
            style={{ borderRadius: "50%" }}
            variant="surface"
          />
          <RSkeleton
            radius="none"
            className={skeletonStyles.text}
            variant="surface"
          />
        </div>
      );
    case "badge":
      return (
        <RSkeleton
          className={skeletonStyles.badge}
          radius="pill"
          variant="surface"
        />
      );
    case "progress":
      return (
        <div className={skeletonStyles.lines}>
          <RSkeleton
            radius="none"
            className={skeletonStyles.text}
            variant="surface"
          />
          <RSkeleton
            className={skeletonStyles.progress}
            radius="pill"
            variant="surface"
          />
        </div>
      );
    case "icon":
      return (
        <RSkeleton
          radius="none"
          className={skeletonStyles.icon}
          variant="surface"
        />
      );
    default:
      return (
        <RSkeleton
          radius="none"
          className={skeletonStyles.text}
          variant="surface"
        />
      );
  }
}

export function ActivityTableSkeleton({
  ariaLabel,
  columns,
  rowsCount = 10,
  styles,
}: ActivityTableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      className={styles.content}
      role="status"
    >
      <div className={styles.viewport}>
        <div aria-hidden="true" className={styles.table}>
          <div className={styles.headerRow}>
            {columns.map((type, index) => (
              <div className={styles.headerCell} key={index}>
                {type === "icon" ? null : (
                  <RSkeleton
                    radius="none"
                    className={skeletonStyles.header}
                    variant="surface"
                  />
                )}
              </div>
            ))}
          </div>
          {range(rowsCount).map((row) => (
            <div className={styles.row} key={row}>
              {columns.map((type, index) => (
                <div className={styles.cell} key={index}>
                  <SkeletonCell type={type} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
