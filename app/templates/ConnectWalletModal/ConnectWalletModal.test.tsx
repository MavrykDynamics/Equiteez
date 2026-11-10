// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONNECT_ERROR_MESSAGES } from "./connectWalletErrors";

const mocks = vi.hoisted(() => ({
  dynamic: {
    start: vi.fn(),
    sendOtp: vi.fn(),
    resendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    selectWallet: vi.fn(),
  },
  connect: vi.fn(),
  login: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({
    dynamic: mocks.dynamic,
    phase: "disconnected",
    identity: null,
  }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({
    connect: mocks.connect,
    // Same contract as UserProvider: no sign-in when the step returns false
    connectWithWallet: async (step: () => Promise<unknown>) => {
      if ((await step()) === false) return;
      await mocks.login();
    },
  }),
}));
vi.mock("~/lib/organisms/OrderBookPopup/OrderBookPopup", () => ({
  useIsMobileViewport: () => false,
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

import { ConnectWalletModal } from "./ConnectWalletModal";

let container: HTMLDivElement;
let root: Root;

const render = async (initialMethod?: "email") => {
  await act(async () => {
    root.render(
      <ConnectWalletModal
        initialMethod={initialMethod}
        isOpen
        onClose={mocks.onClose}
      />
    );
  });
};

const flush = () => act(async () => new Promise((r) => setTimeout(r, 0)));

const button = (text: string) => {
  const match = Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.includes(text)
  );
  if (!match)
    throw new Error(`No button "${text}" in: ${container.textContent}`);
  return match;
};

const click = async (text: string) => {
  await act(async () => button(text).click());
  await flush();
};

const type = async (label: string, value: string) => {
  const input = container.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`
  )!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const submit = async () => {
  await act(async () => {
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  await flush();
};

const text = () => container.textContent ?? "";

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.dynamic.start.mockResolvedValue("needs-email");
  mocks.dynamic.sendOtp.mockResolvedValue("sent");
  mocks.dynamic.verifyOtp.mockResolvedValue(undefined);
  mocks.dynamic.resendOtp.mockResolvedValue(undefined);
  mocks.dynamic.selectWallet.mockResolvedValue(undefined);
  mocks.login.mockResolvedValue(undefined);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("ConnectWalletModal", () => {
  it("connects Mavryk Wallet directly", async () => {
    await render();

    await click("Mavryk Wallet");

    expect(mocks.onClose).toHaveBeenCalled();
    expect(mocks.connect).toHaveBeenCalled();
    expect(mocks.dynamic.start).not.toHaveBeenCalled();
  });

  it("signs in with an email code", async () => {
    await render();

    await click("Continue with email");
    expect(text()).toContain("Sign in with email");
    // No live session: no RWA sign-in yet
    expect(mocks.login).not.toHaveBeenCalled();

    await type("Email", "Name@Example.com");
    await submit();
    expect(mocks.dynamic.sendOtp).toHaveBeenCalledWith("Name@Example.com");
    expect(text()).toContain("We sent a code to Name@Example.com.");

    await type("Verification code", "123456");
    await submit();

    expect(mocks.dynamic.verifyOtp).toHaveBeenCalledWith("123456");
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("signs in without a code while the email wallet session is alive", async () => {
    mocks.dynamic.start.mockResolvedValue("connected");
    await render();

    await click("Continue with email");

    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
    expect(mocks.dynamic.sendOtp).not.toHaveBeenCalled();
  });

  it("rejects an invalid email without calling Dynamic", async () => {
    await render("email");

    await type("Email", "not-an-email");
    await submit();

    expect(text()).toContain("Enter a valid email address.");
    expect(mocks.dynamic.sendOtp).not.toHaveBeenCalled();
  });

  it("keeps the code step with a clear message after a wrong code", async () => {
    mocks.dynamic.verifyOtp.mockRejectedValue(new Error("Invalid token"));
    await render("email");
    await type("Email", "a@b.co");
    await submit();

    await type("Verification code", "000000");
    await submit();

    expect(text()).toContain(CONNECT_ERROR_MESSAGES.invalidCode);
    expect(text()).toContain("Enter your code");
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.onClose).not.toHaveBeenCalled();
  });

  it("starts the resend countdown after sending a code", async () => {
    await render("email");
    await type("Email", "a@b.co");
    await submit();

    expect(button("Resend code in").disabled).toBe(true);
  });

  it("lets the user pick one of several wallets by address", async () => {
    mocks.dynamic.start.mockRejectedValue(
      Object.assign(new Error("several"), {
        name: "MultipleDynamicWalletsError",
        wallets: [
          { walletId: "w1", address: "mv1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1" },
          { walletId: "w2", address: "mv1BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB2" },
        ],
      })
    );
    await render();
    await click("Continue with email");

    expect(text()).toContain("Choose a wallet");
    const options = Array.from(container.querySelectorAll("button")).filter(
      (element) => element.textContent?.startsWith("mv1")
    );
    expect(options).toHaveLength(2);

    await act(async () => options[1].click());
    await flush();

    expect(mocks.dynamic.selectWallet).toHaveBeenCalledWith("w2");
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("explains an unavailable email service and retries", async () => {
    mocks.dynamic.start.mockRejectedValueOnce(
      Object.assign(new Error("frame blocked"), { name: "DynamicInitError" })
    );
    await render();
    await click("Continue with email");

    expect(text()).toContain(CONNECT_ERROR_MESSAGES.unavailable);

    await click("Try again");
    expect(mocks.dynamic.start).toHaveBeenCalledTimes(2);
    expect(text()).toContain("Sign in with email");
  });

  it("ignores a result that arrives after the modal was closed", async () => {
    let finish!: (value: string) => void;
    mocks.dynamic.start.mockImplementation(
      () => new Promise((resolve) => (finish = resolve))
    );
    await render();
    await click("Continue with email");

    await click("Cancel");
    expect(mocks.onClose).toHaveBeenCalledOnce();

    await act(async () => finish("connected"));
    await flush();

    // The cancelled step does not close twice or change what is shown
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("opens straight on the email wallet when asked", async () => {
    await render("email");

    expect(mocks.dynamic.start).toHaveBeenCalledOnce();
    expect(text()).toContain("Sign in with email");
  });
});
