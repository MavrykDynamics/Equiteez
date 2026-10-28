// @vitest-environment jsdom
import { RGasPaymentDetails } from "~/lib/organisms/PriceSection/components/FeesCard/RGasPaymentDetails";
import { act, type ReactNode } from "react";
import { BigNumber } from "bignumber.js";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RelayConfigResult } from "~/lib/apis/rwa/relay/relay.types";
import type { RelayRecord } from "~/lib/relay/relay.storage";
import { useCredits } from "./useCredits";
import {
  formatCreditTokenUnits,
  getCreditFeeText,
  getCreditsBalanceStatus,
  getTopUpProgress,
  type Credits,
} from "./credits.utils";
import { AddCreditsModal } from "../AddCreditsModal/AddCreditsModal";
import { CreditsBalanceBadge } from "./CreditsBalanceBadge";

const mocks = vi.hoisted(() => ({
  wallet: "alice",
  scope: "scope-alice",
  authenticatedWallet: "alice",
  authenticated: true,
  revision: 0,
  records: [] as RelayRecord[],
  config: vi.fn(),
  credits: vi.fn(),
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({
  useGasPayment: () => ({ wallet: mocks.wallet, scope: mocks.scope }),
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({
    isAuthenticated: mocks.authenticated,
    authenticatedWalletAddress: mocks.authenticatedWallet,
    isAuthLoading: false,
  }),
}));
vi.mock("~/providers/RelayProvider/RelayProvider", () => ({
  useRelay: () => ({ records: mocks.records }),
}));
vi.mock("~/providers/UserProvider/user.provider", async () => {
  const { createContext } = await import("react");
  return { userContext: createContext(undefined) };
});
vi.mock("@remix-run/react", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("~/icons/info-message.svg?react", () => ({ default: () => <svg /> }));
vi.mock("~/icons/gas-credit-info.svg?react", () => ({
  default: () => <svg />,
}));
vi.mock("~/icons/gas-credit-low.svg?react", () => ({ default: () => <svg /> }));
vi.mock("~/icons/gas-credit-empty.svg?react", () => ({
  default: () => <svg />,
}));
vi.mock("~/lib/atoms/RTooltip", () => ({
  RTooltip: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("~/lib/relay/relay.scope", () => ({
  getRelayScopeRevision: () => mocks.revision,
  subscribeRelayScope: () => () => {},
}));
vi.mock("~/lib/apis/rwa/relay/relay", () => ({
  fetchRelayCredits: (...args: unknown[]) => mocks.credits(...args),
  relayConfigQueryOptions: (scope: string) => ({
    queryKey: ["relay", scope, "config"],
    queryFn: mocks.config,
    retry: false,
    staleTime: 60_000,
  }),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));
const paid: RelayConfigResult = {
  state: "ready",
  config: {
    enabled: true,
    contracts: [],
    gaslessThresholdMumav: "0",
    fee: {
      enabled: true,
      tokenContract: "quote",
      tokenId: 0,
      collector: "collector",
      decimals: 6,
      feeSchedule: { permitPlaceBuyOrder: "1500000" },
      defaultFeeUnits: "9000000",
      topUpMinUnits: "1",
      topUpMaxUnits: "999999999999",
      freeAllowanceOps: 5,
      entrypoint: "permitAndExecute",
    },
  },
};
const balance: Credits = {
  enabled: true,
  signerAddress: "alice",
  decimals: 6,
  balanceUnits: "9007199254740993123456",
  actionsRemaining: { permitPlaceBuyOrder: 2 },
  freeAllowanceRemaining: 3,
  lifetimeToppedUpUnits: "0",
  lifetimeSpentUnits: "0",
};
const off: RelayConfigResult = {
  state: "ready",
  config: { ...paid.config, fee: { enabled: false } },
};
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
let result: ReturnType<typeof useCredits>;
let second: ReturnType<typeof useCredits>;
function Probe({
  enabled = true,
  both = false,
}: {
  enabled?: boolean;
  both?: boolean;
}) {
  result = useCredits(enabled);
  return both ? (
    <Second />
  ) : (
    <CreditsBalanceBadge status={result.status} progress={result.progress} />
  );
}
function Second() {
  second = useCredits();
  return null;
}
const render = async (node: ReactNode = <Probe />) => {
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>{node}</QueryClientProvider>
    );
  });
  for (let i = 0; i < 3; i++)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
};
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(mocks, {
    wallet: "alice",
    scope: "scope-alice",
    authenticatedWallet: "alice",
    authenticated: true,
    revision: 0,
    records: [],
  });
  mocks.config.mockResolvedValue(paid);
  mocks.credits.mockResolvedValue(balance);
  host = document.createElement("div");
  root = createRoot(host);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  act(() => root.unmount());
  client.clear();
});

it("formats huge and tiny token quantities without Number or USD conversion", () => {
  expect(formatCreditTokenUnits(balance.balanceUnits, 6)).toBe(
    "9007199254740993.123456"
  );
  expect(formatCreditTokenUnits("1", 18)).toBe("0.000000000000000001");
});
it("shows unknown/loading/error separately, never an empty balance", () => {
  expect(
    getCreditsBalanceStatus({ authenticated: false, isError: false })
  ).toBe("unknown");
  expect(getCreditsBalanceStatus({ authenticated: true, isError: false })).toBe(
    "loading"
  );
  expect(
    getCreditsBalanceStatus({
      authenticated: true,
      isError: true,
      config: paid,
      credits: balance,
    })
  ).toBe("error");
  expect(
    getCreditsBalanceStatus({
      authenticated: true,
      isError: false,
      config: paid,
      credits: { ...balance, decimals: 8 },
    })
  ).toBe("error");
});
it("does not combine paid and free counts or label them Credits", async () => {
  await render();
  expect(result.status).toBe("ready");
  expect(result.credits).toEqual(balance);
  expect(host.textContent).toBe("Gas Credits");
  expect(result).not.toHaveProperty("addCredits");
});
it("fee-off skips protected credit reads and top-up controls", async () => {
  mocks.config.mockResolvedValue(off);
  await render();
  expect(result.status).toBe("free");
  expect(result.canTopUp).toBe(false);
  expect(mocks.credits).not.toHaveBeenCalled();
  expect(host.textContent).toBe("Gas sponsored");
});
it("direct mode skips config and Credits reads", async () => {
  await render(<Probe enabled={false} />);
  expect(mocks.config).not.toHaveBeenCalled();
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("mismatched authentication skips protected reads", async () => {
  mocks.authenticatedWallet = "bob";
  await render();
  expect(result.status).toBe("unknown");
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("disabled config is unavailable, not sponsored gas", async () => {
  mocks.config.mockResolvedValue({
    state: "disabled",
    config: off.config,
    reason: "not-found",
  });
  await render();
  expect(result.status).toBe("error");
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("credit errors never expose cached allowance as current", async () => {
  await render();
  mocks.credits.mockRejectedValue(new Error("offline"));
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "credits"],
    });
  });
  await render();
  expect(result.status).toBe("error");
  expect(result.credits).toBeUndefined();
});
it("shares reads and outcome invalidation between header and form", async () => {
  await render(<Probe both />);
  expect(mocks.credits).toHaveBeenCalledTimes(1);
  expect(second.credits).toEqual(result.credits);
  mocks.credits.mockResolvedValue({ ...balance, balanceUnits: "1" });
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "credits"],
    });
  });
  await render(<Probe both />);
  expect(second.credits).toEqual(result.credits);
  expect(result.credits).toMatchObject({ balanceUnits: "1" });
});
it("ignores a late old-wallet response after switching scope", async () => {
  let resolve!: (data: Credits) => void;
  mocks.credits.mockImplementationOnce(
    () =>
      new Promise<Credits>((done) => {
        resolve = done;
      })
  );
  await render();
  expect(result.status).toBe("loading");
  Object.assign(mocks, {
    wallet: "bob",
    scope: "scope-bob",
    authenticatedWallet: "bob",
    revision: 1,
  });
  mocks.credits.mockResolvedValue({
    ...balance,
    signerAddress: "bob",
    balanceUnits: "7",
  });
  await render();
  await act(async () => resolve(balance));
  await render();
  expect(result.credits).toMatchObject({
    signerAddress: "bob",
    balanceUnits: "7",
  });
});
it("auth revisions prevent cached allowance reappearing after reauthentication", async () => {
  await render();
  mocks.revision++;
  mocks.credits.mockImplementation(() => new Promise(() => {}));
  await render();
  expect(result.status).toBe("loading");
  expect(result.credits).toBeUndefined();
});
it("fee config changes isolate the balance and fee-off hides old data", async () => {
  await render();
  mocks.config.mockResolvedValue(off);
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "config"],
    });
  });
  await render();
  expect(result.status).toBe("free");
  expect(result.credits).toBeUndefined();
});
function topUp(status: "pending" | "confirmed" | "failed"): RelayRecord {
  return {
    version: 1,
    scope: mocks.scope,
    id: "top-up",
    contract: "quote",
    createdAt: 0,
    method: "credits",
    identity: "",
    state: status === "pending" ? "tracking" : "settled",
    posts: 0,
    nextRetryAt: 0,
    minimized: true,
    dismissed: false,
    row: { operationId: "top-up", status, intentKind: "fee_top_up" },
  };
}
it("pending overlays preexisting balance; confirmation stays updating until the next credits read", async () => {
  mocks.records = [topUp("pending")];
  await render();
  expect(result.progress).toBe("pending");
  expect(result.credits).toEqual(balance);
  // Observed after the read above completed.
  mocks.records = [
    { ...topUp("confirmed"), settledObservedAt: Date.now() + 1000 },
  ];
  await render();
  expect(result.progress).toBe("updating");
  mocks.records = [{ ...topUp("confirmed"), settledObservedAt: 1 }];
  mocks.credits.mockResolvedValue({ ...balance, balanceUnits: "0" });
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "credits"],
    });
  });
  await render();
  expect(result.progress).toBeNull();
  expect(result.credits).toMatchObject({ balanceUnits: "0" });
});
it("updating clears once a credits read completes after the confirmation was observed", () => {
  const confirmedAt = Date.parse("2026-10-22T00:02:00Z");
  const confirmed = {
    ...topUp("confirmed"),
    // A server timestamp far ahead of the client must not keep it updating.
    row: { ...topUp("confirmed").row!, updatedAt: "2030-01-01T00:00:00Z" },
    settledObservedAt: confirmedAt,
  };
  expect(getTopUpProgress([confirmed])).toBe("updating");
  expect(getTopUpProgress([confirmed], confirmedAt - 1)).toBe("updating");
  expect(getTopUpProgress([confirmed], confirmedAt + 1)).toBeNull();
  expect(getTopUpProgress([topUp("pending")], confirmedAt + 1)).toBe("pending");
});
it("failed top-ups do not create adding/success state", () => {
  expect(getTopUpProgress([topUp("failed")])).toBeNull();
});
it("itemizes exact per-variant fees without default price, USD parity or protocol fee subtraction", () => {
  expect(getCreditFeeText(paid, "permitPlaceBuyOrder")).toContain(
    "1.5 quote tokens from prepaid balance"
  );
  expect(getCreditFeeText(paid, "permitCancelOrders")).toContain(
    "no relay service fee"
  );
  expect(getCreditFeeText(off, "permitPlaceBuyOrder")).toContain(
    "No relay service fee"
  );
  expect(getCreditFeeText(paid, "permitPlaceBuyOrder")).toContain(
    "protocol fees remain separate"
  );
});
const submitForm = async () => {
  await act(async () => {
    host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};
it("top-up form defaults to 20 Gas Credits and authorizes the exact payment", async () => {
  await render(
    <AddCreditsModal
      isOpen
      onClose={vi.fn()}
      walletBalance={new BigNumber(999)}
    />
  );
  expect(host.textContent).toContain("Add Gas Credit");
  expect(host.textContent).toContain("Wallet Balance:$999.00");
  expect(host.textContent).toContain(
    "You're authorizing one payment of exactly 20.00 USDT."
  );
});
it("without a submit handler the form ends in Top Up unavailable, never success", async () => {
  const close = vi.fn();
  await render(
    <AddCreditsModal
      isOpen
      onClose={close}
      walletBalance={new BigNumber(999)}
    />
  );
  await submitForm();
  expect(host.textContent).toContain("Top Up unavailable");
  expect(host.textContent).not.toContain("Transaction Submitted");
  expect(host.querySelector("input")).toBeNull();
  await act(async () => {
    host.querySelector("button")!.click();
  });
  expect(close).toHaveBeenCalledOnce();
});
it("blocked reason and insufficient balance never call the submit handler", async () => {
  const submit = vi.fn();
  await render(
    <AddCreditsModal
      isOpen
      blockedReason="Blocked by plan"
      onClose={vi.fn()}
      onAddCredits={submit}
      walletBalance={new BigNumber(999)}
    />
  );
  expect(host.textContent).toContain("Blocked by plan");
  await render(
    <AddCreditsModal
      isOpen
      onClose={vi.fn()}
      onAddCredits={submit}
      walletBalance={new BigNumber(1)}
    />
  );
  expect(host.textContent).toContain("Insufficient wallet balance.");
  await submitForm();
  expect(submit).not.toHaveBeenCalled();
});
it("an accepted top-up shows Transaction Submitted", async () => {
  const submit = vi.fn().mockResolvedValue(undefined);
  await render(
    <AddCreditsModal
      isOpen
      onClose={vi.fn()}
      onAddCredits={submit}
      walletBalance={new BigNumber(999)}
    />
  );
  await submitForm();
  expect(submit.mock.calls[0][0].toFixed()).toBe("20");
  expect(host.textContent).toContain("Transaction Submitted");
});
it("a failed top-up keeps the form and amount for another attempt", async () => {
  const submit = vi
    .fn()
    .mockRejectedValueOnce(
      new Error("Signature request was rejected. No payment was made.")
    )
    .mockResolvedValueOnce(undefined);
  await render(
    <AddCreditsModal
      isOpen
      onClose={vi.fn()}
      onAddCredits={submit}
      walletBalance={new BigNumber(999)}
    />
  );
  await submitForm();
  expect(host.querySelector("[role=alert]")?.textContent).toBe(
    "Signature request was rejected. No payment was made."
  );
  expect(host.textContent).toContain(
    "You're authorizing one payment of exactly 20.00 USDT."
  );
  await submitForm();
  expect(submit).toHaveBeenCalledTimes(2);
  expect(host.textContent).toContain("Transaction Submitted");
});
const buttonByText = (text: string) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent === text);
it("order summary shows the per-order Gas Credit charge without warnings when healthy", async () => {
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).toContain("Gas Credit1.5 Gas Credits");
  expect(host.textContent).not.toContain("Top Up");
  expect(
    host.querySelector('[aria-label^="1 Gas Credit covers"]')
  ).not.toBeNull();
});
it("low balance warns and Top Up opens the shared modal", async () => {
  mocks.credits.mockResolvedValue({ ...balance, balanceUnits: "2000000" });
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).toContain(
    "Running low on Gas Credits. Please Top Up your balance."
  );
  await act(async () => buttonByText("Top Up")!.click());
  expect(host.textContent).toContain("Add Gas Credit");
});
it("empty balance offers Top Up or switching to manual gas", async () => {
  mocks.credits.mockResolvedValue({
    ...balance,
    balanceUnits: "0",
    freeAllowanceRemaining: 0,
  });
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).toContain(
    "You're out of Gas Credits. Please Top Up your balance or Switch to Manual Gas Transactions."
  );
});
it("free allowance prevents the empty warning", async () => {
  mocks.credits.mockResolvedValue({
    ...balance,
    balanceUnits: "0",
    freeAllowanceRemaining: 2,
  });
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).not.toContain("out of Gas Credits");
});
it("fee-off shows a free Gas Credit row with no Top Up", async () => {
  mocks.config.mockResolvedValue(off);
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).toContain("Gas CreditFree");
  expect(buttonByText("Top Up")).toBeUndefined();
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("direct mode shows one wallet network fee row and no Credit controls", async () => {
  await render(
    <RGasPaymentDetails
      method="mvrk"
      variant="permitPlaceBuyOrder"
      networkFee="0.123456"
      storageCost="0.01"
    />
  );
  expect(host.textContent).toBe("Network Fee~ 0.133456 MVRK");
  expect(host.querySelector("button")).toBeNull();
  expect(mocks.credits).not.toHaveBeenCalled();
});
it("badge shows hardcoded-price Credit counts with design tones", async () => {
  const at = (units: string, free = 0) =>
    render(
      <CreditsBalanceBadge
        status="ready"
        progress={null}
        credits={{
          ...balance,
          balanceUnits: units,
          freeAllowanceRemaining: free,
        }}
        onAddCredits={vi.fn()}
      />
    );
  await at("20500000");
  expect(host.textContent).toBe("20 Gas Credits");
  await at("2000000");
  expect(host.textContent).toBe("2 Gas Credits");
  await at("1000000");
  expect(host.textContent).toBe("1 Gas Credit");
  await at("999999");
  expect(host.textContent).toBe("0 Gas CreditsAdd Credits");
  await at("0", 5);
  expect(host.textContent).toBe("5 Free Gas Credits");
});
