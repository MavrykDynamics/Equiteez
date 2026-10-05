// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RPurchaseHistoryTab } from "./RPurchaseHistoryTab";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  invalidate: vi.fn(),
  notifier: vi.fn(),
  isAuthenticated: true,
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({
  useFreshQuery: mocks.query,
  useFreshQueryInvalidation: () => mocks.invalidate,
  FreshnessSource: { Chain: "chain" },
}));
vi.mock("~/lib/apis/primaryPurchases/primaryPurchases", () => ({
  PRIMARY_HISTORY_QUERY_KEY: "primary-purchase-history",
  fetchPrimaryPurchaseHistory: vi.fn(),
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: "buyer" }),
}));
vi.mock("~/providers/NotificationsProvider/hooks/useNotifierEvent", () => ({
  useNotifierEvent: mocks.notifier,
}));
vi.mock("../OpenOrdersTab/OpenOrdersConnectWalletState", () => ({
  OpenOrdersConnectWalletState: () => <div>Connect wallet</div>,
}));

vi.mock("~/lib/atoms/Money", () => ({
  default: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("../OpenOrdersTab/OrderItem", () => ({
  formatOrderDate: (value: string) => value,
  renderNullableFiatValue: (value: number | null, currency: string) =>
    value === null ? "—" : `${value} ${currency}`,
}));
vi.mock("~/lib/molecules/RPagination", () => ({
  RPagination: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button onClick={() => onPageChange(2)}>Next</button>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isAuthenticated = true;
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.query.mockReturnValue({ data: { items: [] }, refetch: mocks.refetch });
});

async function render(
  check: (container: HTMLDivElement) => void | Promise<void>
) {
  const container = document.createElement("div");
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <RPurchaseHistoryTab
          asset={
            { address: "asset", metadata: { symbol: "XAUG" } } as AssetType
          }
        />
      )
    );
    await check(container);
  } finally {
    await act(async () => root.unmount());
  }
}

const receipt = {
  id: "transfer:62471699169282",
  type: "deposit",
  datetime: "2026-10-01T10:56:55Z",
  amount: 0.036231,
  currency: "usd",
  price_per_token: 137.959819,
  total: 4.998422,
};

it("renders the returned deposit with USD valuations and no invented status", async () => {
  mocks.query.mockReturnValue({
    data: { items: [receipt], total_pages: 2, truncated: true },
  });
  await render(async (container) => {
    const cells = [
      ...container.querySelectorAll('[role="rowgroup"] [role="cell"]'),
    ].map((cell) => cell.textContent);
    expect(cells).toEqual([
      receipt.datetime,
      "XAUG",
      "+ Deposit",
      "137.959819 USD",
      "0.036231",
      "—",
      "4.998422 USD",
    ]);
    expect(container.textContent).toContain("Older transactions");
    await act(async () =>
      [...container.querySelectorAll("button")]
        .find((button) => button.textContent === "Next")!
        .click()
    );
    expect(mocks.query.mock.lastCall![0].queryKey).toContain(2);
  });
});

it("renders missing valuations as dashes", async () => {
  mocks.query.mockReturnValue({
    data: { items: [{ ...receipt, price_per_token: null, total: null }] },
  });
  await render((container) => {
    const cells = [
      ...container.querySelectorAll('[role="rowgroup"] [role="cell"]'),
    ];
    expect(cells[3].textContent).toBe("—");
    expect(cells[6].textContent).toBe("—");
  });
});

it("shows the empty state only when there are no returned rows", async () => {
  await render((container) =>
    expect(container.textContent).toContain(
      "Incoming asset transactions will appear here."
    )
  );
});

it("retains loading and retryable error states", async () => {
  mocks.query.mockReturnValue({ isLoading: true });
  await render((container) =>
    expect(container.textContent).toContain("Loading purchase history")
  );
  mocks.query.mockReturnValue({ isError: true, refetch: mocks.refetch });
  await render(async (container) => {
    expect(container.textContent).toContain("Unable to load purchase history");
    await act(async () => container.querySelector("button")!.click());
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});

it("disables fetching without authentication", async () => {
  mocks.isAuthenticated = false;
  await render((container) => {
    expect(container.textContent).toBe("Connect wallet");
    expect(mocks.query.mock.calls[0][0].enabled).toBe(false);
  });
});

it("refreshes the chain source only for the connected wallet's purchase event", async () => {
  await render(() => {
    const handle = mocks.notifier.mock.calls[0][2];
    handle({}, "other");
    expect(mocks.invalidate).not.toHaveBeenCalled();
    handle({}, "buyer");
    expect(mocks.invalidate).toHaveBeenCalledWith(
      "fetchWalletTransferHistory",
      { source: "chain" }
    );
  });
});
