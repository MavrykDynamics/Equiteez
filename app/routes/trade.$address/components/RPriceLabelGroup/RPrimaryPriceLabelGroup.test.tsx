import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RPrimaryPriceLabelGroup } from "./RPrimaryPriceLabelGroup";

const mocks = vi.hoisted(() => ({ price: undefined as number | undefined }));

vi.mock("~/providers/AssetsProvider/assets.provider", () => ({
  useAssetsContext: () => ({
    prices: { asset: { primary_issuance: { price: mocks.price } } },
  }),
}));
vi.mock("./RPriceLabelGroup", () => ({
  RPriceLabelGroup: ({ price }: { price?: number }) => (
    <span>{price ?? "unavailable"}</span>
  ),
}));

describe("primary gallery display price", () => {
  it.each([1.25, 0, 100])(
    "displays the API price %s without a wallet or chain provider",
    (price) => {
      mocks.price = price;
      expect(
        renderToStaticMarkup(<RPrimaryPriceLabelGroup assetAddress="asset" />)
      ).toBe(`<span>${price}</span>`);
    }
  );

  it.each([undefined, NaN, Infinity])("handles unavailable price %s", (price) => {
    mocks.price = price;
    expect(
      renderToStaticMarkup(<RPrimaryPriceLabelGroup assetAddress="asset" />)
    ).toContain("unavailable");
  });
});
