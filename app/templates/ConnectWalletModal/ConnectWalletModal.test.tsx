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
    signInWithGoogle: vi.fn(),
    hasPendingGoogleSignIn: vi.fn(),
    finishGoogleSignIn: vi.fn(),
    unlockWallet: vi.fn(),
    passSecondFactor: vi.fn(),
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

/** "email": sign-in without the wallet choice, as in production */
const render = async (mode: "choice" | "email" = "choice") => {
  vi.stubEnv("WALLET_CHOICE_ENABLED", mode === "choice" ? "true" : "false");
  await act(async () => {
    root.render(<ConnectWalletModal isOpen onClose={mocks.onClose} />);
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
  mocks.dynamic.signInWithGoogle.mockReturnValue(new Promise(() => {}));
  mocks.dynamic.hasPendingGoogleSignIn.mockReturnValue(false);
  mocks.dynamic.finishGoogleSignIn.mockResolvedValue(undefined);
  mocks.dynamic.unlockWallet.mockResolvedValue(undefined);
  mocks.dynamic.passSecondFactor.mockResolvedValue(undefined);
  mocks.login.mockResolvedValue(undefined);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  vi.unstubAllEnvs();
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
    expect(text()).toContain(
      "New here? We’ll create your account automatically."
    );
    // No live session: no RWA sign-in yet
    expect(mocks.login).not.toHaveBeenCalled();

    await type("Email", "Name@Example.com");
    await submit();
    expect(mocks.dynamic.sendOtp).toHaveBeenCalledWith("Name@Example.com");
    expect(text()).toContain("We sent a 6-digit code to Name@Example.com");

    await type("Verification code", "123456");
    await submit();

    expect(mocks.dynamic.verifyOtp).toHaveBeenCalledWith(
      "123456",
      expect.any(Function)
    );
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
    expect(text()).toContain("Enter Your Code");
    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.onClose).not.toHaveBeenCalled();
  });

  it("does not ask for the used-up code again when a later step fails", async () => {
    // Dynamic accepted the code, then the wallet could not be opened
    mocks.dynamic.verifyOtp.mockImplementation(
      async (_code: string, onAccepted?: () => void) => {
        onAccepted?.();
        throw Object.assign(new Error("chain"), { name: "WrongNetworkError" });
      }
    );
    mocks.dynamic.start.mockResolvedValueOnce("needs-email");
    await render("email");
    await type("Email", "a@b.co");
    await submit();
    await type("Verification code", "123456");
    await submit();

    expect(text()).toContain("Couldn't sign in");
    expect(text()).toContain(CONNECT_ERROR_MESSAGES.network);
    expect(text()).not.toContain(CONNECT_ERROR_MESSAGES.invalidCode);

    // Try again reopens the wallet from the live session, without a code
    mocks.dynamic.start.mockResolvedValueOnce("connected");
    await click("Try again");

    expect(mocks.dynamic.verifyOtp).toHaveBeenCalledOnce();
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
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
    expect(text()).toContain(
      "New here? We’ll create your account automatically."
    );
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

  it("opens straight on the email wallet without the wallet choice", async () => {
    await render("email");

    expect(mocks.dynamic.start).toHaveBeenCalledOnce();
    expect(text()).toContain(
      "New here? We’ll create your account automatically."
    );
    expect(text()).not.toContain("Mavryk Wallet");
    // Nothing to go back to
    expect(container.querySelector('button[aria-label="Back"]')).toBeNull();
  });

  it("goes back from the email step to the wallet choice", async () => {
    await render();
    await click("Continue with email");

    await act(async () =>
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Back"]')!
        .click()
    );

    expect(text()).toContain("Mavryk Wallet");
  });

  it("keeps the digits of a pasted code and waits for all six", async () => {
    await render("email");
    await type("Email", "a@b.co");
    await submit();

    await type("Verification code", "12 3");
    expect(
      container.querySelector<HTMLInputElement>(
        'input[aria-label="Verification code"]'
      )!.value
    ).toBe("123");
    expect(button("Verify").disabled).toBe(true);

    await type("Verification code", "123-456");
    expect(button("Verify").disabled).toBe(false);
  });

  it("shows the resend countdown as minutes and seconds", async () => {
    await render("email");
    await type("Email", "a@b.co");
    await submit();

    expect(button("Resend code in").textContent).toBe("Resend code in 0:30");
  });
  it("sends the browser to Google from the email step", async () => {
    await render("email");

    await click("Continue With Google");

    expect(mocks.dynamic.signInWithGoogle).toHaveBeenCalledOnce();
    expect(text()).toContain("Opening Google…");
  });

  it("finishes the Google sign-in when the page comes back from Google", async () => {
    mocks.dynamic.hasPendingGoogleSignIn.mockReturnValue(true);
    await render("email");
    await flush();

    expect(mocks.dynamic.finishGoogleSignIn).toHaveBeenCalledOnce();
    expect(mocks.dynamic.start).not.toHaveBeenCalled();
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("returns to the email step with the reason when Google sign-in fails", async () => {
    mocks.dynamic.hasPendingGoogleSignIn.mockReturnValue(true);
    mocks.dynamic.finishGoogleSignIn.mockRejectedValue(
      Object.assign(
        new Error("Google sign-in was cancelled. Try again when you're ready."),
        { name: "GoogleSignInError" }
      )
    );
    await render("email");
    await flush();

    expect(text()).toContain("Continue With Google");
    expect(text()).toContain("Google sign-in was cancelled");
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("asks for the password of a locked wallet and restores it", async () => {
    mocks.dynamic.start.mockResolvedValue("connected");
    mocks.dynamic.start.mockRejectedValueOnce(
      Object.assign(new Error("locked"), {
        name: "DynamicWalletLockedError",
        wallet: {
          walletId: "w1",
          address: "mv1KSqAAAAAAAAAAAAAAAAAAAAAAAAAA9pSX",
          lastUsedAt: new Date(2026, 10, 9),
          email: "a@b.co",
        },
      })
    );
    await render("email");

    expect(text()).toContain("Unlock Your Account On This Device");
    expect(text()).toContain("mv1KSq");
    expect(text()).toContain("Last used 9 Nov 2026");
    expect(button("Restore Account").disabled).toBe(true);

    await act(async () => {
      const input = container.querySelector<HTMLInputElement>(
        "input[type=password]"
      )!;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!.call(input, "secret-pass");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await submit();

    expect(mocks.dynamic.unlockWallet).toHaveBeenCalledWith(
      "w1",
      "secret-pass"
    );
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("keeps the unlock step with the reason after a wrong password", async () => {
    mocks.dynamic.start.mockRejectedValue(
      Object.assign(new Error("locked"), {
        name: "DynamicWalletLockedError",
        wallet: {
          walletId: "w1",
          address: "mv1KSqAAAAAAAAAAAAAAAAAAAAAAAAAA9pSX",
          lastUsedAt: null,
          email: "a@b.co",
        },
      })
    );
    mocks.dynamic.unlockWallet.mockRejectedValue(
      Object.assign(
        new Error("That password didn't work. Check it and try again."),
        { name: "DynamicWrongPasswordError" }
      )
    );
    await render("email");
    // No last-used date: the email identifies the account
    expect(text()).toContain("a@b.co");

    await act(async () => {
      const input = container.querySelector<HTMLInputElement>(
        "input[type=password]"
      )!;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!.call(input, "wrong");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await submit();

    expect(text()).toContain("That password didn't work");
    expect(text()).toContain("Unlock Your Account On This Device");
    expect(mocks.login).not.toHaveBeenCalled();

    await click("Use a different email");
    expect(text()).toContain("Email Me A Code");
  });
  it("confirms the sign-in with the authenticator app, or a recovery code", async () => {
    mocks.dynamic.start.mockResolvedValue("connected");
    mocks.dynamic.start.mockRejectedValueOnce(
      Object.assign(new Error("second factor"), {
        name: "DynamicSecondFactorRequiredError",
        methods: { hasAuthenticator: true, hasPasskey: true },
      })
    );
    mocks.dynamic.passSecondFactor.mockRejectedValueOnce(
      Object.assign(
        new Error("That code didn't work. Check it and try again."),
        { name: "DynamicWrongCodeError" }
      )
    );
    await render("email");

    expect(text()).toContain("Confirm Your Sign-In");
    expect(text()).toContain("Use A Passkey");

    await type("Verification code", "000000");
    await submit();
    expect(mocks.dynamic.passSecondFactor).toHaveBeenCalledWith({
      kind: "authenticator",
      code: "000000",
    });
    expect(text()).toContain("That code didn't work");

    await click("Use a recovery code");
    await type("Recovery code", "aaaa-1111");
    await submit();

    expect(mocks.dynamic.passSecondFactor).toHaveBeenLastCalledWith({
      kind: "recovery-code",
      code: "aaaa-1111",
    });
    expect(mocks.login).toHaveBeenCalledOnce();
    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  it("offers only the passkey to an account without an authenticator", async () => {
    mocks.dynamic.start.mockRejectedValueOnce(
      Object.assign(new Error("second factor"), {
        name: "DynamicSecondFactorRequiredError",
        methods: { hasAuthenticator: false, hasPasskey: true },
      })
    );
    await render("email");

    expect(text()).toContain("Use the passkey saved for this account.");
    expect(container.querySelector("input")).toBeNull();

    await click("Use A Passkey");
    expect(mocks.dynamic.passSecondFactor).toHaveBeenCalledWith({
      kind: "passkey",
    });
  });
});
