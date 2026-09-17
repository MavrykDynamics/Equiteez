import { FC } from "react";

import { OrderBook } from "./OrderBook";

type OrderBookTabsProps = {
  baseTokenDecimals: number;
  rwaAddress: string;
  slug: string;
  symbol: string;
};

export const OrderBookTabs: FC<OrderBookTabsProps> = ({
  baseTokenDecimals,
  rwaAddress,
  slug,
  symbol,
}) => {
  return (
    <section className="flex flex-col w-full">
      <OrderBook
        baseTokenDecimals={baseTokenDecimals}
        rwaAddress={rwaAddress}
        slug={slug}
        symbol={symbol}
      />
    </section>
  );
};
