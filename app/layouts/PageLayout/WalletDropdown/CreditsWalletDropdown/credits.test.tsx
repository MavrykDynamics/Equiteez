// @vitest-environment jsdom
import { RGasPaymentDetails } from "~/lib/organisms/PriceSection/components/FeesCard/RGasPaymentDetails";
import { act, type ReactNode } from "react";
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
  expect(host.textContent).toBe("Credits");
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
it("pending overlays preexisting balance; delayed reads and concurrent spend never synthesize settlement", async () => {
  mocks.records = [topUp("pending")];
  await render();
  expect(result.progress).toBe("pending");
  expect(result.credits).toEqual(balance);
  mocks.records = [topUp("confirmed")];
  mocks.credits.mockResolvedValue({ ...balance, balanceUnits: "0" });
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "credits"],
    });
  });
  await render();
  expect(result.progress).toBe("updating");
  expect(result.credits).toMatchObject({ balanceUnits: "0" });
  await act(async () => root.unmount());
  root = createRoot(host);
  await render();
  expect(result.progress).toBe("updating");
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
it("close/reopen never enables top-up submission, fake payment or success", async () => {
  const submit = vi.fn();
  const close = vi.fn();
  for (const isOpen of [true, false, true])
    await render(
      <AddCreditsModal
        isOpen={isOpen}
        onClose={close}
        onAddCredits={submit}
        walletBalanceUsd={999}
      />
    );
  expect(host.textContent).toContain("Top Up unavailable");
  expect(host.textContent).not.toContain("Transaction Submitted");
  expect(host.querySelector("input")).toBeNull();
  expect(host.textContent).not.toContain("0.00");
  await act(async () => {
    host.querySelector("button")!.click();
  });
  expect(close).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
});
it("inline Top Up uses the same blocked modal and disappears when fees turn off", async () => {
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.textContent).toContain("1.5 quote tokens");
  await act(async () => host.querySelector("button")!.click());
  expect(host.textContent).toContain("Top Up unavailable");
  mocks.config.mockResolvedValue(off);
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["relay", mocks.scope, "config"],
    });
  });
  await render(
    <RGasPaymentDetails method="credits" variant="permitPlaceBuyOrder" />
  );
  expect(host.querySelector("button")).toBeNull();
  expect(host.textContent).toContain("No relay service fee");
});
it("direct itemization shows the exact wallet fee and no paid Credit controls", async () => {
  await render(
    <RGasPaymentDetails
      method="mvrk"
      variant="permitPlaceBuyOrder"
      networkFee="0.123456"
      storageCost="0.01"
    />
  );
  expect(host.textContent).toContain("0.123456 MVRK");
  expect(host.textContent).toContain("0.01 MVRK");
  expect(host.querySelector("button")).toBeNull();
  expect(mocks.credits).not.toHaveBeenCalled();
});
