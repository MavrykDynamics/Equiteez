import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./styles.module.css";

const TABLE_ROWS_COUNT = 10;
const LEGEND_ITEMS_COUNT = 10;
// Amount, Avg Price, Price / 1M, Yield, Profit — two-line cells show a sub-value
const VALUE_CELLS_TWO_LINE = [true, false, true, false, false];

const range = (length: number) => Array.from({ length }, (_, index) => index);

function CellLines({ twoLine }: { twoLine: boolean }) {
  return (
    <div className={styles.skeletonCell}>
      <RSkeleton
        radius="none"
        className={twoLine ? styles.skeletonLine : styles.skeletonLineShort}
        variant="surface"
      />
      {twoLine ? (
        <RSkeleton
          radius="none"
          className={styles.skeletonSubLine}
          variant="surface"
        />
      ) : null}
    </div>
  );
}

// Rows rendered inside the real <tbody> so the table header stays interactive
export function AssetsTableSkeletonRows() {
  return (
    <>
      {range(TABLE_ROWS_COUNT).map((row) => (
        <tr aria-hidden="true" key={row}>
          <td>
            <div className={styles.assetIdentity}>
              <RSkeleton
                className={styles.assetIcon}
                radius="pill"
                variant="surface"
              />
              <div className={styles.skeletonCell}>
                <RSkeleton
                  radius="none"
                  className={styles.skeletonLineShort}
                  variant="surface"
                />
                <RSkeleton
                  radius="none"
                  className={styles.skeletonSubLine}
                  variant="surface"
                />
              </div>
            </div>
          </td>
          {VALUE_CELLS_TWO_LINE.map((twoLine, cell) => (
            <td key={cell}>
              <CellLines twoLine={twoLine} />
            </td>
          ))}
          <td className={styles.actionCell} />
        </tr>
      ))}
    </>
  );
}

export function AssetsChartSkeleton() {
  return (
    <div aria-busy="true" role="status">
      <RSkeleton className={styles.donut} radius="pill" variant="surface" />
      <div className={styles.legend}>
        {range(LEGEND_ITEMS_COUNT).map((item) => (
          <RSkeleton
            radius="none"
            className={styles.skeletonLegendItem}
            key={item}
            variant="surface"
          />
        ))}
      </div>
    </div>
  );
}
