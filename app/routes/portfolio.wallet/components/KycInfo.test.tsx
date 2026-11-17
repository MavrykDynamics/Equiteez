// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { KycRegistrationState } from "~/lib/kyc/useKycRegistration";
import type { KycStatus } from "~/lib/kyc/useKycStatus";

const mocks = vi.hoisted(() => ({
  status: {} as KycStatus,
  registration: { state: { name: "idle" } as KycRegistrationState },
  start: vi.fn(),
}));

vi.mock("~/lib/kyc/useKycStatus", () => ({
  useKycStatus: () => mocks.status,
}));
vi.mock("~/lib/kyc/useKycRegistration", () => ({
  useKycRegistration: () => ({
    state: mocks.registration.state,
    start: mocks.start,
  }),
}));

import { formatKycDate, KycInfo } from "./KycInfo";

let container: HTMLDivElement;
let root: Root;

const render = () => act(async () => root.render(<KycInfo />));
const text = () => container.textContent ?? "";
const startButton = () =>
  Array.from(container.querySelectorAll("button")).find((button) =>
    /Start KYC|Try again/.test(button.textContent ?? "")
  );

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubEnv("KYC_SELF_SERVICE_ENABLED", "true");
  mocks.status = {
    isLoaded: true,
    hasError: false,
    isKyced: false,
    verifiedAt: null,
    expiresAt: null,
  };
  mocks.registration.state = { name: "idle" };
  mocks.start.mockReset();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  vi.unstubAllEnvs();
});

describe("KycInfo", () => {
  it("offers Start KYC to a wallet without KYC", async () => {
    await render();

    expect(text()).toContain("Complete verification to unlock");
    await act(async () => startButton()!.click());
    expect(mocks.start).toHaveBeenCalledOnce();
  });

  it("hides Start KYC unless self-service is enabled", async () => {
    vi.stubEnv("KYC_SELF_SERVICE_ENABLED", "false");
    await render();

    expect(text()).toContain("Mavryk Pro");
    expect(startButton()).toBeUndefined();
  });

  it("shows the verification and renewal dates", async () => {
    mocks.status = {
      isLoaded: true,
      hasError: false,
      isKyced: true,
      verifiedAt: "2026-11-13T10:00:00Z",
      expiresAt: "2027-11-13T10:00:00Z",
    };
    await render();

    expect(text()).toContain(
      "You successfully completed KYC verification on 13.11.2026."
    );
    expect(text()).toContain("renewed on 13.11.2027.");
    expect(startButton()).toBeUndefined();
  });

  it("shows progress while verifying, then a retry after a failure", async () => {
    mocks.registration.state = { name: "confirming" };
    await render();
    expect(text()).toContain("Verifying your wallet");
    expect(startButton()).toBeUndefined();

    mocks.registration.state = { name: "failed", message: "Try later." };
    await render();
    expect(text()).toContain("Try later.");
    expect(startButton()!.textContent).toBe("Try again");
  });

  it("says when the status cannot be loaded", async () => {
    mocks.status = { ...mocks.status, isLoaded: false, hasError: true };
    await render();

    expect(text()).toContain("couldn't load your verification status");
    expect(startButton()).toBeUndefined();
  });

  it("says nothing about the status until it is known", async () => {
    mocks.status = { ...mocks.status, isLoaded: false };
    await render();

    expect(text()).toContain("Checking your verification status");
    expect(startButton()).toBeUndefined();
  });
});

describe("formatKycDate", () => {
  it("formats as dd.mm.yyyy and ignores missing or bad dates", () => {
    expect(formatKycDate("2026-01-05T12:00:00Z")).toBe("05.01.2026");
    expect(formatKycDate(null)).toBeNull();
    expect(formatKycDate("not a date")).toBeNull();
  });
});
