// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userAddress: null as string | null,
  provider: undefined as "dynamic" | "mavryk_extension" | undefined,
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
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("ConnectWallet", () => {
  it("offers Connect Wallet when signed out", async () => {
    mocks.userAddress = null;
    mocks.provider = undefined;
    await render();

    expect(container.textContent).toContain("Connect Wallet");
  });

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
