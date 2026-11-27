// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: {
    isKyced: false,
    userAddress: "mv1Wallet" as string | null,
    refetchUserAccountStatus: vi.fn(),
  },
  request: vi.fn(),
}));

vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => mocks.user,
}));
// The real module pulls in the RWA client, which needs RWA_API at import
vi.mock("~/lib/apis/kyc/kycApi", () => ({
  KycRegistrationError: class KycRegistrationError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  },
  requestKycRegistration: mocks.request,
}));

import { KycRegistrationError } from "~/lib/apis/kyc/kycApi";

import {
  KYC_CONFIRM_TIMEOUT_MS,
  KYC_POLL_INTERVAL_MS,
  useKycRegistration,
} from "./useKycRegistration";

let container: HTMLDivElement;
let root: Root;
let hook: ReturnType<typeof useKycRegistration>;

function Probe() {
  hook = useKycRegistration();
  return null;
}

const render = () => act(async () => root.render(<Probe />));

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers();
  mocks.user.isKyced = false;
  mocks.user.userAddress = "mv1Wallet";
  mocks.user.refetchUserAccountStatus.mockReset().mockResolvedValue(undefined);
  mocks.request.mockReset();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
});

describe("useKycRegistration", () => {
  it("polls the indexer after sending until the wallet is a member", async () => {
    mocks.request.mockResolvedValue({ status: "submitted", opHash: "oo1" });
    await render();

    await act(() => hook.start());
    expect(hook.state.name).toBe("confirming");

    await act(async () => vi.advanceTimersByTime(KYC_POLL_INTERVAL_MS * 2));
    expect(mocks.user.refetchUserAccountStatus).toHaveBeenCalledTimes(3);

    mocks.user.isKyced = true;
    await render();
    expect(hook.state.name).toBe("idle");
  });

  it("says it is still processing after the timeout, without failing", async () => {
    mocks.request.mockResolvedValue({ status: "submitted", opHash: "oo1" });
    await render();
    await act(() => hook.start());

    await act(async () =>
      vi.advanceTimersByTime(KYC_CONFIRM_TIMEOUT_MS + KYC_POLL_INTERVAL_MS)
    );

    expect(hook.state.name).toBe("processing");
  });

  it("explains a failure", async () => {
    mocks.request.mockRejectedValue(
      new KycRegistrationError("rwa-unavailable")
    );
    await render();

    await act(() => hook.start());

    expect(hook.state).toEqual({
      name: "failed",
      message:
        "Verification is unavailable right now. Please try again in a minute.",
    });
  });

  it("drops the result when the wallet changed meanwhile", async () => {
    let finish!: (value: unknown) => void;
    mocks.request.mockImplementation(
      () => new Promise((resolve) => (finish = resolve))
    );
    await render();
    let pending!: Promise<void>;
    act(() => {
      pending = hook.start();
    });

    mocks.user.userAddress = "mv1Other";
    await render();
    await act(async () => {
      finish({ status: "submitted", opHash: "oo1" });
      await pending;
    });

    expect(hook.state.name).toBe("idle");
  });
});
