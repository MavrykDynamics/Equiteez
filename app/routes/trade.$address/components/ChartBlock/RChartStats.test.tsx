import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getChartData } from "~/routes/_index/components/AssetPriceChart/AssetPriceChart";
import { RChartStats } from "./RChartStats";

vi.mock("~/lib/atoms/Money", () => ({
  default: ({ children }: { children: number }) => children.toFixed(2),
}));

function getValues(props: Parameters<typeof RChartStats>[0]) {
  const html = renderToStaticMarkup(<RChartStats {...props} />);
  return Array.from(
    html.matchAll(/<dd[^>]*>(.*?)<\/dd>/g),
    ([, value]) => value
  );
}

describe("selected-range chart statistics", () => {
  it("uses the chart's chronological, valid USD points for opening, latest, high and low", () => {
    const prices = getChartData([
      { t: "2026-09-17T02:00:00Z", usd: 12, p: 120 },
      { t: "invalid", usd: 999, p: 999 },
      { t: "2026-09-17T00:00:00Z", usd: 10, p: 100 },
      { t: "2026-09-17T01:00:00Z", usd: 8, p: 80 },
    ]).map(({ value }) => value);

    expect(
      getValues({ prices, amount: 2, percentage: 20, isUnavailable: false })
    ).toEqual(["$10.00", "$12.00", "$12.00", "$8.00", "+$2.00", "+20.00%"]);
  });

  it("preserves zero prices and zero changes", () => {
    expect(
      getValues({
        prices: [0, 0],
        amount: 0,
        percentage: 0,
        isUnavailable: false,
      })
    ).toEqual(["$0.00", "$0.00", "$0.00", "$0.00", "$0.00", "0.00%"]);
  });

  it("keeps negative changes signed and unknown percentage unavailable", () => {
    expect(
      getValues({
        prices: [10, 8],
        amount: -2,
        percentage: null,
        isUnavailable: false,
      })
    ).toEqual(["$10.00", "$8.00", "$10.00", "$8.00", "−$2.00", "—"]);
  });

  it.each([
    { prices: [], amount: null, percentage: null, isUnavailable: false },
    { prices: [10, 12], amount: 2, percentage: 20, isUnavailable: true },
  ])(
    "does not display stale or fabricated values when data is unavailable",
    (props) => {
      expect(getValues(props)).toEqual(Array(6).fill("—"));
    }
  );
});
