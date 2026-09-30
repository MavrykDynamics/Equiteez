import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import TradePage from "./route";

const { asset } = vi.hoisted(() => ({
  asset: {
    address: "test-asset",
    market_type: "secondary",
    metadata: { symbol: "PRIMARY", name: "Test asset" },
    profile: { lifecycle: "primary_issuance", gallery: [{ url: "asset.jpg" }] },
  },
}));

vi.mock("@remix-run/react", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ address: asset.address }),
}));
vi.mock("~/providers/AssetsProvider/assets.provider", () => ({
  useAssetsContext: () => ({ assets: [asset] }),
}));
vi.mock("~/lib/atoms/Container/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("~/lib/atoms/RButton", () => ({ RButton: () => null }));
vi.mock("~/consts", () => ({ ROUTES: { home: "/" } }));
vi.mock("~/hooks/useWindowDimensions", () => ({ TABLET_MAX_WIDTH: 1180 }));
vi.mock("./components/AssetDetails/AssetDetails", () => ({
  AssetDetails: () => <div>Asset details</div>,
}));
vi.mock("./components/AssetTabs/AssetTabs", () => ({
  AssetTabs: () => <div>Asset tabs</div>,
}));
vi.mock("./components/ChartBlock/ChartBlock", () => ({
  ChartBlock: () => <div>Price chart</div>,
}));
vi.mock("./components/BuySellPanel/BuySellPanel", () => ({
  BuySellPanel: () => <div>Live trading panel</div>,
}));
vi.mock("./components/AssetGallery/AssetGallerySlider", () => ({
  AssetGallerySlider: ({ size }: { size: string }) => <div>{size} gallery</div>,
}));

describe("trade-page asset classification", () => {
  it.each(["MARS1", "NEW"])(
    "uses the secondary lifecycle layout for %s even without an orderbook",
    (symbol) => {
      asset.metadata.symbol = symbol;
      asset.market_type = "primary";
      asset.profile.lifecycle = "secondary";
      const html = renderToStaticMarkup(<TradePage />);
      expect(html).toContain("Price chart");
      expect(html).toContain("compact gallery");
      expect(html).toContain("Live trading panel");
      expect(html).not.toContain("Primary Sale");
    }
  );

  it.each(["NEW", "MARS1"])(
    "uses the primary lifecycle layout for %s regardless of symbol or market_type",
    (symbol) => {
      asset.metadata.symbol = symbol;
      asset.market_type = "secondary";
      asset.profile.lifecycle = "primary_issuance";
      const html = renderToStaticMarkup(<TradePage />);
      expect(html).toContain("large gallery");
      expect(html).toContain("Primary Sale");
      expect(html).toContain("25,000.00");
      expect(html).toContain('aria-valuenow="90"');
      expect(html).toContain("Live trading panel");
      expect(html).not.toContain("Price chart");
      expect(html).not.toContain("compact gallery");
    }
  );
});
