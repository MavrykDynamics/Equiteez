export type DividendsStatsData = {
  totalDividendsReceived: number;
  distributionsLifetime: number;
  newestPaymentAmount: number;
  nextPaymentAmount: number;
  nextPaymentDays: number;
  thisMonth: number;
  averagePerMonth: number;
  averagePeriodMonths: number;
  yearToDate: number;
  year: number;
  incomeAssets: number;
};

export type DividendsStatsProps = {
  data: DividendsStatsData;
  className?: string;
};

export type PaymentHighlightProps = {
  amount: number;
  indicatorTone: "received" | "upcoming";
  label: string;
  timingLabel: string;
  valuePrefix?: string;
  valueSuffix: string;
};
