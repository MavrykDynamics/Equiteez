import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rwaApi } from "~/lib/apis/rwa/client";
import { assetLaunchQueryOptions } from "../../hooks/assetLaunch";
import { RPrimarySaleSummary } from "./RPrimarySaleSummary";

vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: { get: vi.fn() } }));

const address = "KT1asset";
const launch = {
  name: "issuance",
  status: "active",
  max_amount_cap: "100000000000",
  total_bought: "1724793",
  progress_percent: 0.001724793,
  token: { address, decimals: 6 },
};

async function renderSummary(load = true, assetAddress = address) {
  const client = new QueryClient({
    defaultOptions: { queries: { retryOnMount: false } },
  });
  if (load) await client.prefetchQuery(assetLaunchQueryOptions(assetAddress));
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <RPrimarySaleSummary assetAddress={assetAddress} />
    </QueryClientProvider>
  );
  client.clear();
  return html;
}

beforeEach(() => {
  vi.mocked(rwaApi.get).mockReset();
  vi.mocked(rwaApi.get).mockResolvedValue({
    data: { address, launches: [launch] },
  });
});

describe("primary sale summary", () => {
  it("displays decimal-adjusted amounts and the API percentage unchanged", async () => {
    const html = await renderSummary();
    expect(rwaApi.get).toHaveBeenCalledWith(`/assets/${address}/launch`);
    expect(html).toContain("Tokens Left");
    expect(html).toContain("99,998.28");
    expect(html).toContain("100,000 total");
    expect(html).toContain("0.001724793% sold");
    expect(html).toContain("width:0.001724793%");
  });

  it("selects the active launch and supports other decimals without precision loss", async () => {
    vi.mocked(rwaApi.get).mockResolvedValue({
      data: {
        address,
        launches: [
          { ...launch, status: "closed" },
          {
            ...launch,
            max_amount_cap: "900719925474099301",
            total_bought: "1",
            token: { address, decimals: 2 },
          },
        ],
      },
    });
    expect(await renderSummary()).toContain("9,007,199,254,740,993.00");
  });

  it("falls back to the first launch and displays sold-out zeroes", async () => {
    vi.mocked(rwaApi.get).mockResolvedValue({
      data: {
        address,
        launches: [
          {
            ...launch,
            status: "closed",
            total_bought: launch.max_amount_cap,
            progress_percent: 100,
          },
        ],
      },
    });
    const html = await renderSummary();
    expect(html).toContain(">0.00<");
    expect(html).toContain("width:100%");
  });

  it("shows placeholders while loading", async () => {
    const html = await renderSummary(false);
    expect(html.match(/—/g)).toHaveLength(3);
    expect(html).toContain("width:0%");
    expect(html).not.toContain("Sale data unavailable");
  });

  it.each([
    { address, launches: [] },
    { address: "other", launches: [launch] },
    {
      address,
      launches: [{ ...launch, token: { address: "other", decimals: 6 } }],
    },
    { address, launches: [{ ...launch, total_bought: "invalid" }] },
    { address, launches: [{ ...launch, token: { address, decimals: -1 } }] },
  ])("keeps unavailable data in the existing layout", async (data) => {
    vi.mocked(rwaApi.get).mockResolvedValue({ data });
    const html = await renderSummary();
    expect(html).toContain("Sale data unavailable");
    expect(html.match(/—/g)).toHaveLength(2);
    expect(html).toContain("width:0%");
  });

  it("handles request failures", async () => {
    vi.mocked(rwaApi.get).mockRejectedValue(new Error("Network error"));
    expect(await renderSummary()).toContain("Sale data unavailable");
  });

  it("uses the requested asset address", async () => {
    const assetAddress = "KT1another";
    vi.mocked(rwaApi.get).mockResolvedValue({
      data: {
        address: assetAddress,
        launches: [
          { ...launch, token: { address: assetAddress, decimals: 6 } },
        ],
      },
    });
    expect(await renderSummary(true, assetAddress)).toContain("99,998.28");
    expect(rwaApi.get).toHaveBeenCalledWith(`/assets/${assetAddress}/launch`);
  });
});
