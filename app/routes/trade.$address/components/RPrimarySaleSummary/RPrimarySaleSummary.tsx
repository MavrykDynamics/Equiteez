import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { z } from "zod";
import { assetLaunchQueryOptions } from "../../hooks/assetLaunch";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPrimarySaleSummary.module.css";

const saleSummarySchema = z
  .object({
    max_amount_cap: z.string().regex(/^\d+$/),
    total_bought: z.string().regex(/^\d+$/),
    progress_percent: z.number().finite().min(0).max(100),
    token: z.object({
      address: z.string(),
      decimals: z.number().int().min(0).max(255),
    }),
  })
  .refine((sale) => new BigNumber(sale.total_bought).lte(sale.max_amount_cap));

export function RPrimarySaleSummary({
  assetAddress,
}: {
  assetAddress: string;
}) {
  const query = useQuery(assetLaunchQueryOptions(assetAddress));
  const parsed = saleSummarySchema.safeParse(query.data);
  const sale =
    !query.isError &&
    parsed.success &&
    parsed.data.token.address === assetAddress
      ? parsed.data
      : undefined;
  const remaining = sale
    ? new BigNumber(sale.max_amount_cap)
        .minus(sale.total_bought)
        .shiftedBy(-sale.token.decimals)
    : undefined;
  const total = sale
    ? new BigNumber(sale.max_amount_cap).shiftedBy(-sale.token.decimals)
    : undefined;
  const soldPercentage = sale?.progress_percent;

  return (
    <section
      className={styles.summary}
      aria-label="Primary Sale"
      aria-busy={query.isPending}
    >
      <div className={styles.row}>
        <RText size="body-sm" color="neutral-700">
          Tokens Left
        </RText>
        <RText size="body-l" weight="medium">
          {remaining?.toFormat(2) ?? "—"}
        </RText>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Primary sale tokens sold"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={soldPercentage}
      >
        <div
          className={styles.fill}
          style={{ width: `${soldPercentage ?? 0}%` }}
        />
      </div>
      <div className={styles.row}>
        <RText size="body-s" color="neutral-700">
          {sale
            ? `${soldPercentage}% sold`
            : query.isPending
              ? "—"
              : "Sale data unavailable"}
        </RText>
        <RText size="body-s" color="neutral-700">
          {total?.toFormat() ?? "—"} total
        </RText>
      </div>
    </section>
  );
}
