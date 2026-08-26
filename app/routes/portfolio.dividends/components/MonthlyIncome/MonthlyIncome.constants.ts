import type { MonthlyIncomeDataPoint } from "./MonthlyIncome";

export const monthlyIncomeMock: MonthlyIncomeDataPoint[] = [
  { assets: [], date: "2025-08-01", value: 179.25 },
  { assets: [], date: "2025-09-01", value: 179.25 },
  { assets: [], date: "2025-10-01", value: 322.65 },
  { assets: [], date: "2025-11-01", value: 448.13 },
  { assets: [], date: "2025-12-01", value: 478 },
  { assets: [], date: "2026-01-01", value: 478 },
  { assets: [], date: "2026-02-01", value: 657.25 },
  { assets: [], date: "2026-03-01", value: 687.13 },
  { assets: [], date: "2026-04-01", value: 746.88 },
  {
    assets: [
      { amount: 124.5, symbol: "VGRT" },
      { amount: 89.75, symbol: "GDSD" },
      { amount: 67.3, symbol: "TBPF" },
      { amount: 103.2, symbol: "SPPT" },
      { amount: 45.8, symbol: "MLCC" },
      { amount: 112.45, symbol: "SVE" },
      { amount: 78.6, symbol: "OXC" },
      { amount: 55.9, symbol: "ER2" },
      { amount: 91.15, symbol: "BRU" },
      { amount: 72.4, symbol: "FDR" },
      { amount: 58.25, symbol: "CDX" },
      { amount: 56.7, symbol: "APL" },
    ],
    date: "2026-05-01",
    value: 956,
  },
  { assets: [], date: "2026-06-01", value: 717 },
  { assets: [], date: "2026-07-01", value: 836.5 },
];
