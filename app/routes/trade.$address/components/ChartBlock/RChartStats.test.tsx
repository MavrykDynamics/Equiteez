import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { RChartStats } from "./RChartStats";

vi.mock("~/lib/atoms/Money", () => ({
  default: ({ children }: { children: number | string }) => String(children),
}));

const asset: Parameters<typeof RChartStats>[0]["asset"] = {
  apy: 6.5,
  finance: {
    value_per_token: 100,
    total_dividends_distributed: "0",
    decimals: 6,
  },
  total_supply: "12000",
  holders_count: 42,
  profile: {
    description: "",
    asset_type: "Real estate",
    status: "Active",
    lifecycle: "",
    gallery: [],
  },
};

describe("asset statistics", () => {
  it("renders asset values without any chart data", () => {
    const html = renderToStaticMarkup(<RChartStats asset={asset} />);
    const values = Array.from(
      html.matchAll(/<dd[^>]*>(.*?)<\/dd>/g),
      ([, value]) => value.replace(/<!--.*?-->/g, "")
    );
    expect(values).toEqual([
      "6.50%",
      "$100",
      "12000",
      "42",
      "Real estate",
      "Active",
    ]);
    expect(html).toContain('aria-label="Asset statistics"');
  });

  it("preserves zero metrics and marks missing profile values unavailable", () => {
    const html = renderToStaticMarkup(
      <RChartStats
        asset={{
          ...asset,
          apy: 0,
          holders_count: 0,
          profile: { ...asset.profile, asset_type: "", status: "" },
        }}
      />
    );
    expect(html).toContain("0.00%");
    expect(html.match(/—/g)).toHaveLength(2);
  });
});
