// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { runKey } from "~/lib/refunds/model";
const mocks = vi.hoisted(() => ({
  account: { userAddress: "owner", isAuthenticated: true },
  dapp: { tezos: () => ({ rpc: { getChainId: async () => "chain" } }) },
  read: vi.fn(),
  config: vi.fn(),
  sign: vi.fn(),
  submit: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dapp: mocks.dapp }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => mocks.account,
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => mocks.account,
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({
  useFreshQueryInvalidation: () => mocks.invalidate,
  FreshnessSource: { Orderbook: "orderbook" },
}));
vi.mock("~/lib/atoms/RButton", () => ({
  RButton: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: any) =>
    isOpen ? <section>{children}</section> : null,
}));
vi.mock("~/lib/refunds/api", () => ({
  readRefundPage: (...args: unknown[]) => mocks.read(...args),
  readRelayConfig: () => mocks.config(),
  serviceFee: () => "0",
}));
vi.mock("~/lib/refunds/transport", () => ({
  assertScope: async () => {},
  estimateChunks: async (_: unknown, run: any) => run.chunks,
  createPorts: (_: unknown, run: any, persist: any) => ({
    assertScope: async () => {},
    persist,
    pause: async () => {},
    sign: mocks.sign,
    submit: mocks.submit,
    relay: async () => ({ status: "confirmed", opHash: "hash" }),
    chain: async () => ({
      state: "applied",
      level: 42,
      payouts: [{ token: "quote", id: "0", units: "17" }],
    }),
    indexed: async () => true,
  }),
}));
let Component: typeof import("./AssetRefundAll").AssetRefundAll;
let container: HTMLDivElement, root: Root;
const page = (items: unknown[]) => ({
  items,
  has_more: false,
  next_cursor: null,
  as_of: { orderbook: { level: 42, timestamp: "now", realtime: true } },
});
const item = {
  orderbook_address: "book",
  order_id: "9007199254740993",
  order_type: "BUY",
  availability: "eligible",
  blocked_reason: null,
  refund: {
    token_address: "quote",
    token_id: "0",
    amount_units: "9007199254740993",
    decimals: 0,
    symbol: "QT",
  },
};
const button = (label: string) =>
  [...container.querySelectorAll("button")].find(
    (b) => b.textContent === label
  )!;
const click = async (label: string) =>
  act(async () => {
    button(label).click();
  });
beforeAll(async () => {
  vi.stubEnv("REFUND_ALL_ENABLED", "true");
  Component = (await import("./AssetRefundAll")).AssetRefundAll;
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: async (_key: string, _opts: unknown, callback: any) =>
        callback({}),
    },
  });
});
beforeEach(async () => {
  localStorage.clear();
  vi.clearAllMocks();
  mocks.account.userAddress = "owner";
  mocks.account.isAuthenticated = true;
  mocks.config.mockResolvedValue({
    enabled: true,
    contracts: [{ address: "book", permitActions: ["permitProcessRefund"] }],
    fee: { enabled: false },
  });
  mocks.sign.mockResolvedValue({ idempotencyKey: "same-key" });
  mocks.submit.mockResolvedValue({ operationId: "op" });
  mocks.read.mockResolvedValueOnce(page([item])).mockResolvedValue(page([]));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<Component asset="asset" />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
it("shows exact preview, prevents double submit and reports receipt amounts instead of the estimate", async () => {
  await click("Claim all refunds");
  await click("Refresh available refunds");
  expect(container.textContent).toContain("9007199254740993 QT");
  await act(async () => {
    button("Confirm refunds").click();
    button("Confirm refunds").click();
  });
  expect(mocks.sign).toHaveBeenCalledTimes(1);
  expect(mocks.submit).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain(
    "Received in confirmed transactions:"
  );
  expect(container.textContent).toContain("17 QT");
  expect(container.textContent).toContain("No remaining refunds were found");
  expect(
    JSON.parse(localStorage.getItem(runKey("owner", "chain", "asset"))!)
      .chunks[0].state
  ).toBe("confirmed");
});
it("requires a new preview after payment selection and preserves blocked explanations", async () => {
  mocks.read.mockReset().mockResolvedValue(
    page([
      item,
      {
        ...item,
        order_id: "2",
        availability: "blocked",
        blocked_reason: "process_refund_paused",
      },
    ])
  );
  await click("Claim all refunds");
  await click("Refresh available refunds");
  expect(container.textContent).toContain("1 refunds unavailable");
  expect(container.textContent).toContain("process refund paused");
  await act(async () => {
    const select = container.querySelector("select")!;
    select.value = "mvrk";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(button("Confirm refunds").disabled).toBe(true);
  expect(mocks.sign).not.toHaveBeenCalled();
});
it("does not turn an upstream error into an empty successful preview", async () => {
  mocks.read.mockReset().mockRejectedValue(new Error("indexer unavailable"));
  await click("Claim all refunds");
  await click("Refresh available refunds");
  expect(container.querySelector('[role="alert"]')?.textContent).toContain(
    "indexer unavailable"
  );
  expect(button("Confirm refunds").disabled).toBe(true);
  expect(mocks.sign).not.toHaveBeenCalled();
});
