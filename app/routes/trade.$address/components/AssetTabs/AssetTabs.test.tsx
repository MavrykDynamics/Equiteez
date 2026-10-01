// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { AssetTabs } from "./AssetTabs";

vi.mock("~/lib/organisms/RTabSwitcher", () => ({
  RTabSwitcher: ({
    tabs,
    onChange,
  }: {
    tabs: { id: string; label: string }[];
    onChange: (id: string) => void;
  }) => (
    <div>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("./PurchaseHistoryTab/RPurchaseHistoryTab", () => ({
  RPurchaseHistoryTab: () => <div>Purchase records</div>,
}));
vi.mock("./OrderHistoryTab/OrderHistoryTab", () => ({
  OrderHistoryTab: () => <div>Order records</div>,
}));
vi.mock("./OpenOrdersTab/OpenOrdersTab", () => ({
  OpenOrdersTab: () => <div>Open records</div>,
}));
vi.mock("./AssetOverviewTab/AssetOverviewTab", () => ({
  AssetOverviewTab: () => <div>Overview</div>,
}));
vi.mock("./BlockchainTab/BlockchainTab", () => ({ BlockchainTab: () => null }));
vi.mock("./OfferingTab/OfferingTab", () => ({ OfferingTab: () => null }));
vi.mock("./RoiCalculatorTab/ROICalculator", () => ({
  ROICalculator: () => null,
}));

it("isolates primary purchase tabs and clears an invalid active tab when switching asset lifecycle", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = async (lifecycle: string) =>
    act(async () =>
      root.render(
        <AssetTabs
          asset={{ address: lifecycle, profile: { lifecycle } } as AssetType}
        />
      )
    );
  const click = async (label: string) =>
    act(async () =>
      [...container.querySelectorAll("button")]
        .find((button) => button.textContent === label)!
        .click()
    );
  try {
    await render("primary_issuance");
    expect(container.textContent).toContain("Purchase History");
    expect(container.textContent).not.toContain("Open Orders");
    expect(container.textContent).not.toContain("Order History");
    await click("Purchase History");
    expect(container.textContent).toContain("Purchase records");
    await render("secondary");
    expect(container.textContent).not.toContain("Purchase");
    expect(container.textContent).toContain("Overview");
    await click("Order History");
    expect(container.textContent).toContain("Order records");
    await click("Open Orders");
    expect(container.textContent).toContain("Open records");
    await render("primary_issuance");
    expect(container.textContent).not.toContain("Open records");
    expect(container.textContent).toContain("Overview");
  } finally {
    await act(async () => root.unmount());
  }
});
