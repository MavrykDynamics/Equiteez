import type { DistributionCadence } from "~/routes/portfolio.dividends/components/Distribution/Distribution.types";

export type DistributionMockData = {
  cadence: DistributionCadence;
  date: string;
  lastPaid: number;
  lifetimeTotal: number;
  payments: number;
  time: string;
  transactionHash: string;
  yield: number;
};

export const distributionMock: DistributionMockData[] = [
  {
    date: "2026-05-08",
    time: "13:44",
    lastPaid: 220.08,
    cadence: "monthly",
    yield: 11.66,
    transactionHash: "o9QJPUU...EBV",
    payments: 6,
    lifetimeTotal: 1320.49,
  },
  {
    date: "2026-05-07",
    time: "09:12",
    lastPaid: 147.83,
    cadence: "weekly",
    yield: 12.4,
    transactionHash: "opH3mKx...4Qd",
    payments: 8,
    lifetimeTotal: 1182.64,
  },
  {
    date: "2026-05-06",
    time: "16:33",
    lastPaid: 141.86,
    cadence: "monthly",
    yield: 9.11,
    transactionHash: "oo7bWNr...Tz8",
    payments: 8,
    lifetimeTotal: 1134.9,
  },
  {
    date: "2026-05-05",
    time: "21:07",
    lastPaid: 99.15,
    cadence: "monthly",
    yield: 5.1,
    transactionHash: "onRvC2j...kF6",
    payments: 9,
    lifetimeTotal: 892.32,
  },
  {
    date: "2026-05-04",
    time: "08:55",
    lastPaid: 86.82,
    cadence: "weekly",
    yield: 6.15,
    transactionHash: "opYs5Ae...Lm1",
    payments: 8,
    lifetimeTotal: 694.6,
  },
  {
    date: "2026-05-03",
    time: "14:29",
    lastPaid: 77.69,
    cadence: "monthly",
    yield: 10.2,
    transactionHash: "ooKdV8w...Np7",
    payments: 7,
    lifetimeTotal: 543.84,
  },
  {
    date: "2026-05-02",
    time: "19:18",
    lastPaid: 59.16,
    cadence: "monthly",
    yield: 4.2,
    transactionHash: "onBxQ4r...Ws3",
    payments: 7,
    lifetimeTotal: 414.15,
  },
  {
    date: "2026-05-01",
    time: "07:46",
    lastPaid: 51.36,
    cadence: "yearly",
    yield: 8.88,
    transactionHash: "opF7hLe...Jc9",
    payments: 5,
    lifetimeTotal: 359.52,
  },
];
