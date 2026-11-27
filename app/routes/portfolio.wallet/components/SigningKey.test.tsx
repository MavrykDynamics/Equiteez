// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WalletIdentity } from "~/providers/WalletProvider/wallet.types";

const mocks = vi.hoisted(() => ({
  identity: null as Partial<WalletIdentity> | null,
  isKyced: false,
  signOut: vi.fn(),
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ identity: mocks.identity }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({
    userAddress: mocks.identity?.address ?? null,
    signOut: mocks.signOut,
  }),
}));
vi.mock("~/lib/kyc/useKycStatus", () => ({
  useKycStatus: () => ({
    isLoaded: true,
    hasError: false,
    isKyced: mocks.isKyced,
    verifiedAt: null,
    expiresAt: null,
  }),
}));
vi.mock("~/lib/ui/useTippy", () => ({ default: () => ({ current: null }) }));
vi.mock("~/lib/atoms/RTooltip", () => ({
  RTooltip: ({ children }: { children: ReactNode }) => children,
}));

import { SigningKey } from "./SigningKey";

const ADDRESS = "mv1KSqiCzJvtQuWMq8EfXdv1TCbRcYoA9pSX";
const PUBLIC_KEY = "edpkMASi45ub7Qe4ZE36UT5G6cU4ud8Fhhe4deS4F3cw9KTAb8dLcu";

let container: HTMLDivElement;
let root: Root;

const render = () => act(async () => root.render(<SigningKey />));
const text = () => container.textContent ?? "";

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  mocks.identity = null;
  mocks.isKyced = false;
  mocks.signOut.mockReset();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("SigningKey", () => {
  it("shows the email wallet's address, public key, provider and email", async () => {
    mocks.identity = {
      provider: "dynamic",
      address: ADDRESS,
      publicKey: PUBLIC_KEY,
      email: "name@mail.com",
    };
    mocks.isKyced = true;
    await render();

    expect(text()).toContain(ADDRESS);
    expect(text()).toContain(PUBLIC_KEY);
    expect(text()).toContain("Dynamic (email sign-in)");
    expect(text()).toContain("name@mail.com");
    // The public key has no Nexus page: only the address links there
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("leaves out the login email for Mavryk Wallet", async () => {
    mocks.identity = {
      provider: "mavryk_extension",
      address: ADDRESS,
      publicKey: PUBLIC_KEY,
    };
    await render();

    expect(text()).toContain("Mavryk Wallet");
    expect(text()).not.toContain("Login email");
  });

  it("signs out", async () => {
    mocks.identity = {
      provider: "dynamic",
      address: ADDRESS,
      publicKey: PUBLIC_KEY,
    };
    await render();

    const button = Array.from(container.querySelectorAll("button")).find(
      (element) => element.textContent?.includes("Sign Out")
    );
    await act(async () => button!.click());

    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
});
