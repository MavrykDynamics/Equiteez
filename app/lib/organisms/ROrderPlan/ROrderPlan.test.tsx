// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ROrderPlan } from "./ROrderPlan";
import type { OrderPlan } from "~/lib/relay/orderPlan";
import { RelayApiError } from "~/lib/relay/relay.errors";
import type { PermitRuntime } from "~/contracts/permit";
const mocks = vi.hoisted(() => ({
  credits: vi.fn(),
  reconnect: vi.fn(),
  login: vi.fn(),
}));
vi.mock("~/icons/info-message.svg?react", () => ({ default: () => <svg /> }));
vi.mock(
  "~/layouts/PageLayout/WalletDropdown/AddCreditsModal/useAddCredits",
  () => ({ useAddCredits: () => vi.fn() })
);
vi.mock(
  "~/layouts/PageLayout/WalletDropdown/CreditsWalletDropdown/useCredits",
  () => ({
    useCredits: () => ({
      config: {
        state: "ready",
        config: {
          fee: {
            enabled: true,
            decimals: 6,
            feeSchedule: {
              permitPlaceBuyOrder: "1000000",
              permitPlaceSellOrder: "1000000",
            },
            topUpMinUnits: "5000000",
            topUpMaxUnits: "100000000",
          },
        },
      },
    }),
    useCreditTokenWalletBalance: () => null,
  })
);
vi.mock("~/lib/apis/rwa/relay/relay", () => ({
  fetchRelayCredits: mocks.credits,
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ login: mocks.login }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ changeUser: mocks.reconnect }),
}));
vi.mock("@remix-run/react", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));
vi.mock("~/templates/PopupWIthIcon/PopupWithIcon", () => ({
  PopupWithIcon: ({ children }: { children: ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));
vi.mock("~/lib/organisms/RPermitReview/RPermitReview", () => ({
  RPermitReview: () => <div>Permit review</div>,
}));
vi.mock("~/lib/atoms/RButton", () => ({
  RButton: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
vi.mock("~/lib/atoms/RTypography/RHeading", () => ({
  RHeading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("~/lib/atoms/RTypography/RText", () => ({
  RText: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.clearAllMocks();
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(() => act(() => root.unmount()));
const runtime = {
  getScope: () => ({ wallet: "wallet" }),
  refreshConfig: vi.fn(async () => ({ enabled: true, fee: { enabled: true } })),
} as unknown as PermitRuntime;
async function render(error: RelayApiError | null = null, state = "failed") {
  const plan = {
    error,
    state,
    prepared: null,
    canResign: false,
    review: vi.fn(),
  } as unknown as OrderPlan;
  await act(async () =>
    root.render(<ROrderPlan plan={plan} runtime={runtime} onClose={vi.fn()} />)
  );
  return plan;
}
it("402 refreshes credit/config and opens the top-up form", async () => {
  await render(new RelayApiError(402, "FEE_CREDIT_REQUIRED", "give-up"));
  expect(runtime.refreshConfig).toHaveBeenCalled();
  expect(mocks.credits).toHaveBeenCalled();
  expect(host.textContent).toContain("Add Gas Credit");
  expect(host.querySelectorAll("input").length).toBeGreaterThan(0);
  expect(host.textContent).not.toContain("Transaction Submitted");
});
it("sponsor outage offers settings without Top Up", async () => {
  await render(
    new RelayApiError(503, "RELAY_UNAVAILABLE", "retry"),
    "tracking"
  );
  expect(host.textContent).toContain("Sponsor service unavailable");
  expect(host.textContent).toContain("Payment settings");
  expect(host.textContent).not.toContain("Top Up unavailable");
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("setup confirmation requires explicit next review", async () => {
  const plan = await render(null, "next");
  expect(plan.review).not.toHaveBeenCalled();
  expect(host.textContent).toContain("no order has been placed");
  await act(async () => {
    [...host.querySelectorAll("button")]
      .find((b) => b.textContent === "Review order")!
      .click();
  });
  expect(plan.review).toHaveBeenCalledOnce();
});
it("signer mismatch offers reconnect", async () => {
  await render(new RelayApiError(403, "SIGNER_MISMATCH", "give-up"));
  await act(async () => {
    [...host.querySelectorAll("button")]
      .find((b) => b.textContent === "Reconnect wallet")!
      .click();
  });
  expect(mocks.reconnect).toHaveBeenCalledOnce();
});
it("a stale 402 does not open Top Up after fees turn off", async () => {
  vi.mocked(runtime.refreshConfig).mockResolvedValueOnce({
    enabled: true,
    fee: { enabled: false },
    contracts: [],
    gaslessThresholdMumav: "0",
  });
  await render(new RelayApiError(402, "FEE_CREDIT_REQUIRED", "give-up"));
  expect(mocks.credits).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("Top Up unavailable");
});
