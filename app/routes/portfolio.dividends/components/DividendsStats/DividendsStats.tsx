import clsx from "clsx";

import Money from "~/lib/atoms/Money";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";
import {
  DividendsStatsProps,
  PaymentHighlightProps,
} from "~/routes/portfolio.dividends/components/DividendsStats/DividendsStats.types";

function PaymentHighlight({
  amount,
  indicatorTone,
  label,
  timingLabel,
  valuePrefix = "",
  valueSuffix,
}: PaymentHighlightProps) {
  return (
    <div className={styles.paymentHighlight}>
      <div className={styles.paymentContent}>
        <span
          className={clsx(styles.paymentIndicator, styles[indicatorTone])}
          aria-hidden="true"
        />
        <div className={styles.paymentCopy}>
          <RText
            className={styles.paymentLabel}
            color="neutral-700"
            size="body-s"
          >
            {label}
          </RText>
          <RText className={styles.paymentValue} size="body-m" weight="medium">
            {valuePrefix}$
            <Money fiat tooltip={false}>
              {amount}
            </Money>{" "}
            {valueSuffix}
          </RText>
        </div>
      </div>
      <RText
        className={styles.timingLabel}
        color="accent-green-700"
        size="body-xs"
      >
        {timingLabel}
      </RText>
    </div>
  );
}

export function DividendsStats({ data, className }: DividendsStatsProps) {
  return (
    <section
      className={clsx(styles.stats, className)}
      aria-label="Dividend statistics"
    >
      <div className={styles.summary}>
        <div className={styles.total}>
          <RText
            className={styles.totalLabel}
            color="neutral-700"
            size="body-s"
            weight="medium"
          >
            Total Dividends Received
          </RText>
          <RHeading className={styles.totalValue} size="h3" weight="medium">
            $
            <Money fiat tooltip={false}>
              {data.totalDividendsReceived}
            </Money>
          </RHeading>
          <RText
            className={styles.distributionsLifetime}
            color="neutral-700"
            size="body-sm"
          >
            <Money tooltip={false}>{data.distributionsLifetime}</Money>{" "}
            distributions lifetime
          </RText>
        </div>

        <div className={styles.paymentHighlights}>
          <PaymentHighlight
            amount={data.newestPaymentAmount}
            indicatorTone="received"
            label="Newest Payment"
            timingLabel="TODAY"
            valuePrefix="+"
            valueSuffix="from VG"
          />
          <PaymentHighlight
            amount={data.nextPaymentAmount}
            indicatorTone="upcoming"
            label="Next Up"
            timingLabel={`IN ${data.nextPaymentDays} DAYS`}
            valueSuffix="from ER"
          />
        </div>
      </div>

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt>
            <RText
              className={styles.metricLabel}
              color="neutral-700"
              size="body-s"
              weight="medium"
            >
              This Month
            </RText>
          </dt>
          <dd>
            <RHeading className={styles.metricValue} size="h4" weight="medium">
              $
              <Money fiat tooltip={false}>
                {data.thisMonth}
              </Money>
            </RHeading>
          </dd>
          <dd>
            <RText
              className={styles.metricDescription}
              color="neutral-700"
              size="body-s"
            >
              July so far
            </RText>
          </dd>
        </div>
        <div className={styles.metric}>
          <dt>
            <RText
              className={styles.metricLabel}
              color="neutral-700"
              size="body-s"
              weight="medium"
            >
              Avg / Month
            </RText>
          </dt>
          <dd>
            <RHeading className={styles.metricValue} size="h4" weight="medium">
              $
              <Money fiat tooltip={false}>
                {data.averagePerMonth}
              </Money>
            </RHeading>
          </dd>
          <dd>
            <RText
              className={styles.metricDescription}
              color="neutral-700"
              size="body-s"
            >
              Across <Money tooltip={false}>{data.averagePeriodMonths}</Money>{" "}
              months
            </RText>
          </dd>
        </div>
        <div className={styles.metric}>
          <dt>
            <RText
              className={styles.metricLabel}
              color="neutral-700"
              size="body-s"
              weight="medium"
            >
              Year To Date
            </RText>
          </dt>
          <dd>
            <RHeading className={styles.metricValue} size="h4" weight="medium">
              $
              <Money fiat tooltip={false}>
                {data.yearToDate}
              </Money>
            </RHeading>
          </dd>
          <dd>
            <RText
              className={styles.metricDescription}
              color="neutral-700"
              size="body-s"
            >
              <Money tooltip={false}>{data.year}</Money> income
            </RText>
          </dd>
        </div>
        <div className={styles.metric}>
          <dt>
            <RText
              className={styles.metricLabel}
              color="neutral-700"
              size="body-s"
              weight="medium"
            >
              Income Assets
            </RText>
          </dt>
          <dd>
            <RHeading className={styles.metricValue} size="h4" weight="medium">
              <Money tooltip={false}>{data.incomeAssets}</Money>
            </RHeading>
          </dd>
          <dd>
            <RText
              className={styles.metricDescription}
              color="neutral-700"
              size="body-s"
            >
              Paying distribution
            </RText>
          </dd>
        </div>
      </dl>
    </section>
  );
}
