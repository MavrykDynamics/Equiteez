// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RPurchaseHistoryTab } from "./RPurchaseHistoryTab";

const mocks = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn() }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.query,
  useQueryClient: () => ({}),
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ isAuthenticated: true }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: "buyer" }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({}),
}));
vi.mock("~/providers/NotificationsProvider/hooks/useNotifierEvent", () => ({
  useNotifierEvent: vi.fn(),
}));
vi.mock("~/lib/atoms/Money", () => ({
  default: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("../OpenOrdersTab/OrderItem", () => ({
  formatOrderDate: (date: string) => date,
}));
vi.mock("../OpenOrdersTab/OpenOrdersConnectWalletState", () => ({
  OpenOrdersConnectWalletState: () => null,
}));
vi.mock("../OpenOrdersTab/OpenOrdersEmptyState", () => ({
  OpenOrdersEmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}));
vi.mock("~/lib/molecules/RPagination", () => ({
  RPagination: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button onClick={() => onPageChange(2)}>Next</button>
  ),
}));

it("renders the seven history columns, confirmed purchase rows and ten-row pagination", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.query.mockReturnValue({
    data: Array.from({ length: 11 }, (_, index) => ({
      id: index,
      datetime: "2026-10-01T08:00:15Z",
      amount: "1.5",
      price: "29.85",
      total: "44.775",
    })),
    refetch: mocks.refetch,
    isPending: false,
    isFetching: false,
    isError: false,
  });
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <RPurchaseHistoryTab
          asset={
            {
              address: "asset",
              metadata: { symbol: "RWA", decimals: 6 },
            } as AssetType
          }
        />
      )
    );
    expect(
      [...container.querySelectorAll('[role="columnheader"]')].map(
        (cell) => cell.textContent
      )
    ).toEqual(["DATE", "ASSET", "TYPE", "PRICE", "AMOUNT", "STATUS", "TOTAL"]);
    expect(
      container.querySelectorAll('[role="rowgroup"] [role="row"]')
    ).toHaveLength(10);
    const cells = [
      ...container
        .querySelectorAll('[role="rowgroup"] [role="row"]')[0]
        .querySelectorAll('[role="cell"]'),
    ].map((cell) => cell.textContent);
    expect(cells).toEqual([
      "2026-10-01T08:00:15Z",
      "RWA",
      "+Purchase",
      "29.85 wUSDT",
      "1.5",
      "CONFIRMED",
      "44.775 wUSDT",
    ]);
    await act(async () =>
      [...container.querySelectorAll("button")]
        .find((button) => button.textContent === "Next")!
        .click()
    );
    expect(
      container.querySelectorAll('[role="rowgroup"] [role="row"]')
    ).toHaveLength(1);
  } finally {
    await act(async () => root.unmount());
  }
});
