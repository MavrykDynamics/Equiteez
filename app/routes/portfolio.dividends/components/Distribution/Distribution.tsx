import { useMemo, useState } from "react";

import { RIcon } from "~/lib/atoms/RIcon/RIcon";
import { RInput } from "~/lib/atoms/RInput/RInput";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";
import { DistributionProps } from "~/routes/portfolio.dividends/components/Distribution/Distribution.types";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function Header({
  children,
  sortable = false,
}: {
  children: string;
  sortable?: boolean;
}) {
  return (
    <div className={styles.headerCell}>
      <RText color="neutral-700" size="body-xs" weight="medium">
        {children}
      </RText>
      {sortable && (
        <RIcon
          className={styles.sortIcon}
          name="arrow-long-down"
          size="small"
        />
      )}
    </div>
  );
}

export function Distribution({ data }: DistributionProps) {
  const [search, setSearch] = useState("");
  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return data;

    return data.filter(
      (item) =>
        item.assetName.toLowerCase().includes(normalizedSearch) ||
        item.assetSymbol.toLowerCase().includes(normalizedSearch)
    );
  }, [data, search]);

  return (
    <section className={styles.distribution} aria-label="Distribution">
      <div className={styles.toolbar}>
        <RText className={styles.title} size="body-m" weight="medium">
          Distribution
        </RText>
        <RInput
          aria-label="Search asset"
          className={styles.search}
          icon="search"
          iconSize="small"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Asset"
          value={search}
        />
      </div>

      <div className={styles.tableScroll}>
        <div className={styles.table} role="table">
          <div className={styles.tableRow} role="row">
            <Header sortable>DATE</Header>
            <Header>ASSET</Header>
            <Header sortable>LAST PAID</Header>
            <Header>CADENCE</Header>
            <Header sortable>YIELD</Header>
            <Header>TX HASH</Header>
            <Header sortable>PAYMENTS</Header>
            <Header sortable>LIFETIME TOTAL</Header>
          </div>

          {filteredData.map((item) => (
            <div className={styles.tableRow} key={item.id} role="row">
              <div className={styles.dateCell} role="cell">
                <RText size="body-sm">
                  {dateFormatter.format(new Date(item.date))}
                </RText>
                <RText color="neutral-700" size="body-s">
                  {item.time}
                </RText>
              </div>
              <div className={styles.assetCell} role="cell">
                <img
                  className={styles.assetImage}
                  src={item.assetImage}
                  alt=""
                />
                <div className={styles.assetCopy}>
                  <RText size="body-sm" weight="medium">
                    {item.assetSymbol}
                  </RText>
                  <RText color="neutral-700" size="body-s" className={styles.assetName}>
                    {item.assetName}
                  </RText>
                </div>
              </div>
              <div className={styles.cell} role="cell">
                <RText color="green-500" size="body-sm">
                  +$
                  <Money fiat tooltip={false}>
                    {item.lastPaid}
                  </Money>
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText
                  className={styles.cadence}
                  color="accent-green-700"
                  size="body-xs"
                >
                  {item.cadence}
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money fiat tooltip={false}>
                    {item.yield}
                  </Money>
                  %
                </RText>
              </div>
              <div className={styles.transactionCell} role="cell">
                <RText size="body-sm">{item.transactionHash}</RText>
                <RIcon
                  className={styles.transactionIcon}
                  name="copy"
                  size="small"
                />
                <RIcon
                  className={styles.transactionIcon}
                  name="arrow-long-up-right"
                  size="small"
                />
              </div>
              <div className={styles.cell} role="cell">
                <RText size="body-sm">
                  <Money tooltip={false}>{item.payments}</Money>
                </RText>
              </div>
              <div className={styles.cell} role="cell">
                <RText color="green-500" size="body-sm">
                  $
                  <Money fiat tooltip={false}>
                    {item.lifetimeTotal}
                  </Money>
                </RText>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
