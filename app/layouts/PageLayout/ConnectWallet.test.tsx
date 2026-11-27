// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userAddress: null as string | null,
  provider: undefined as "dynamic" | "mavryk_extension" | undefined,
  isSigningIn: false,
  progress: null as "creating" | "restoring" | null,
}));

vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ isLoading: false, userAddress: mocks.userAddress }),
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    identity: mocks.provider ? { provider: mocks.provider } : null,
  }),
}));
vi.mock("~/templates/ConnectWalletModal/connectWalletModal.context", () => ({
  useConnectWallet: () => vi.fn(),
  useIsSigningIn: () => mocks.isSigningIn,
  useSignInProgress: () => mocks.progress,
}));
vi.mock("./WalletMenu/MavrykWalletMenu", () => ({
  MavrykWalletMenu: () => <p>Mavryk menu</p>,
}));
vi.mock("./WalletMenu/DynamicWalletMenu/DynamicWalletMenu", () => ({
  DynamicWalletMenu: () => <p>Email wallet panel</p>,
}));

import { ConnectWallet } from "./ConnectWallet";

let container: HTMLDivElement;
let root: Root;

const render = () => act(async () => root.render(<ConnectWallet />));

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  mocks.progress = null;
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("ConnectWallet", () => {
  it("offers Sign In when signed out", async () => {
    mocks.userAddress = null;
    mocks.provider = undefined;
    mocks.isSigningIn = false;
    await render();

    const visible = container.querySelector('[aria-hidden="false"]');
    expect(visible?.textContent).toBe("Sign In");
  });

  it("shows Signing in while the sign-in modal is open", async () => {
    mocks.userAddress = null;
    mocks.provider = undefined;
    mocks.isSigningIn = true;
    await render();

    const visible = container.querySelector('[aria-hidden="false"]');
    expect(visible?.textContent).toBe("Signing in");
  });

  it.each([
    ["creating", "Setting up account"],
    ["restoring", "Restoring account"],
  ] as const)(
    "shows a disabled status pill while %s the account",
    async (progress, label) => {
      mocks.userAddress = null;
      mocks.provider = undefined;
      mocks.isSigningIn = true;
      mocks.progress = progress;
      await render();

      const pill = container.querySelector('[role="status"]');
      expect(pill?.textContent).toBe(label);
      expect(container.querySelector("button")).toBeNull();
    }
  );

  it("opens the Mavryk Wallet menu for the extension", async () => {
    mocks.userAddress = "mv1Owner";
    mocks.provider = "mavryk_extension";
    await render();

    expect(container.textContent).toBe("Mavryk menu");
  });

  it("opens the wallet panel for an email wallet", async () => {
    mocks.userAddress = "mv1Owner";
    mocks.provider = "dynamic";
    await render();

    expect(container.textContent).toBe("Email wallet panel");
  });
});
