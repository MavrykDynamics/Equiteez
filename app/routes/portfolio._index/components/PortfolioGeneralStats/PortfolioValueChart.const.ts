import type { AssetPriceChartPoint } from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

export type PortfolioChartPeriod = "1d" | "7d" | "30d" | "all" | "ytd";

type MockPortfolioChart = {
  change: number;
  changePercentage: number;
  values: number[];
};

export const PORTFOLIO_CHART_PERIODS: Array<{
  label: string;
  value: PortfolioChartPeriod;
}> = [
  { label: "1D", value: "1d" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "YTD", value: "ytd" },
  { label: "ALL", value: "all" },
];

export const MOCK_PORTFOLIO_CHARTS: Record<
  PortfolioChartPeriod,
  MockPortfolioChart
> = {
  "1d": {
    change: 3_099.84,
    changePercentage: 1.65,
    values: [168_480, 168_720, 168_590, 169_020, 168_910, 169_240, 169_506],
  },
  "7d": {
    change: 5_897.91,
    changePercentage: 2.4,
    values: [
      151_420, 152_110, 151_880, 153_280, 152_740, 154_060, 155_233, 154_418,
      156_870, 156_294, 158_992, 158_410, 159_540, 157_880, 160_134, 161_270,
      160_822, 163_098, 162_440, 164_268, 163_686, 165_780, 164_994, 167_208,
      166_484, 168_962, 167_890, 170_616, 169_848, 172_508,
    ],
  },
  "30d": {
    change: 12_412.7,
    changePercentage: 7.75,
    values: [
      160_096, 159_820, 160_740, 161_360, 161_034, 162_210, 162_890, 162_244,
      163_520, 164_180, 163_674, 164_870, 165_622, 165_040, 166_364, 166_980,
      166_520, 167_932, 168_614, 168_122, 169_430, 170_016, 169_648, 171_106,
      170_742, 171_854, 171_298, 172_106, 171_780, 172_508,
    ],
  },
  all: {
    change: 72_508.14,
    changePercentage: 72.48,
    values: [
      100_000, 103_460, 101_980, 107_320, 110_640, 108_120, 115_300, 118_990,
      116_840, 124_440, 128_204, 126_350, 134_728, 138_502, 136_870, 145_220,
      149_564, 147_110, 156_840, 161_472, 159_680, 166_230, 170_066, 172_508,
    ],
  },
  ytd: {
    change: 31_856.48,
    changePercentage: 22.65,
    values: [
      140_652, 142_306, 141_820, 145_194, 147_032, 146_510, 149_326, 151_640,
      150_718, 154_238, 155_946, 154_820, 159_164, 161_428, 160_016, 164_920,
      166_244, 165_710, 169_208, 170_962, 169_884, 172_508,
    ],
  },
};

const MOCK_CHART_END_DATE = Date.UTC(2025, 6, 20);

const MOCK_CHART_DURATION_BY_PERIOD: Record<PortfolioChartPeriod, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: 365 * 24 * 60 * 60 * 1000,
  ytd: 200 * 24 * 60 * 60 * 1000,
};

export function getMockPortfolioChartPoints(
  period: PortfolioChartPeriod
): AssetPriceChartPoint[] {
  const values = MOCK_PORTFOLIO_CHARTS[period].values;
  const duration = MOCK_CHART_DURATION_BY_PERIOD[period];
  const start = MOCK_CHART_END_DATE - duration;

  return values.map((value, index) => ({
    p: value,
    t: new Date(
      start + (duration / (values.length - 1)) * index
    ).toISOString(),
    usd: value,
  }));
}
