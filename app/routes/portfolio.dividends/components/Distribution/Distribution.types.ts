export type DistributionCadence = "monthly" | "weekly" | "yearly";

export type DistributionItem = {
  assetImage: string;
  assetName: string;
  assetSymbol: string;
  cadence: DistributionCadence;
  date: string;
  id: string;
  lastPaid: number;
  lifetimeTotal: number;
  payments: number;
  time: string;
  transactionHash: string;
  yield: number;
};

export type DistributionProps = {
  data: DistributionItem[];
};
