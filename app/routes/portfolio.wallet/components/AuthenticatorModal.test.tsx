// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The hook module imports the providers, which load Beacon: not needed here
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dynamic: null }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({ success: vi.fn() }),
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));
// The copy button pulls in tippy, which jsdom does not need here
vi.mock("~/lib/atoms/CopyButton", () => ({
  CopyButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

import {
  DynamicWrongCodeError,
  IdentityCheckCancelledError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type {
  AuthenticatorSetup,
  DynamicAuthenticator,
} from "~/providers/WalletProvider/dynamic/dynamicClient.client";

import { AuthenticatorModal } from "./AuthenticatorModal";
import { describeAuthenticator } from "./useAuthenticator";

const SETUP: AuthenticatorSetup = {
  deviceId: "totp-1",
  uri: "otpauth://totp/Equiteez:a@b.co?secret=JBSWY3DPEHPK3PXP",
  secret: "JBSWY3DPEHPK3PXP",
};

let container: HTMLDivElement;
let root: Root;
const startSetup = vi.fn<() => Promise<AuthenticatorSetup>>();
const verifySetup = vi.fn<(deviceId: string, code: string) => Promise<void>>();
const getRecoveryCodes = vi.fn<() => Promise<string[]>>();
const acknowledgeRecoveryCodes = vi.fn<() => Promise<void>>();
const remove = vi.fn<(code: string) => Promise<void>>();
const onClose = vi.fn();

const render = (authenticator: DynamicAuthenticator | null = null) =>
  act(async () =>
    root.render(
      <AuthenticatorModal
        acknowledgeRecoveryCodes={acknowledgeRecoveryCodes}
        authenticator={authenticator}
        getRecoveryCodes={getRecoveryCodes}
        isOpen
        onClose={onClose}
        remove={remove}
        startSetup={startSetup}
        verifySetup={verifySetup}
      />
    )
  );
const text = () => container.textContent ?? "";
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  )!;
const typeCode = (code: string) =>
  act(async () => {
    const input = container.querySelector<HTMLInputElement>(
      "input[autocomplete=one-time-code]"
    )!;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!.call(input, code);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  startSetup.mockReset().mockResolvedValue(SETUP);
  verifySetup.mockReset().mockResolvedValue(undefined);
  getRecoveryCodes.mockReset().mockResolvedValue(["aaaa-1111", "bbbb-2222"]);
  acknowledgeRecoveryCodes.mockReset().mockResolvedValue(undefined);
  remove.mockReset().mockResolvedValue(undefined);
  onClose.mockReset();
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AuthenticatorModal", () => {
  it("sets the app up: QR code, first code, then the recovery codes", async () => {
    await render();

    expect(startSetup).toHaveBeenCalledOnce();
    expect(container.querySelector("svg[role=img]")).not.toBeNull();
    expect(text()).toContain(SETUP.secret);

    await typeCode("123456");
    await act(async () => button("Turn On").click());

    expect(verifySetup).toHaveBeenCalledWith("totp-1", "123456");
    expect(text()).toContain("Save Your Recovery Codes");
    expect(text()).toContain("aaaa-1111");

    await act(async () => button("I've Saved These Codes").click());

    expect(acknowledgeRecoveryCodes).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the step with Try again when the recovery codes can't be loaded", async () => {
    getRecoveryCodes.mockRejectedValueOnce(new Error("network"));
    await render();
    await typeCode("123456");
    await act(async () => button("Turn On").click());

    expect(text()).toContain("couldn't load your recovery codes");
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => button("Try Again").click());

    expect(text()).toContain("aaaa-1111");
  });

  it("closes when the project has no recovery codes", async () => {
    getRecoveryCodes.mockResolvedValueOnce([]);
    await render();
    await typeCode("123456");
    await act(async () => button("Turn On").click());

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the QR code with the reason after a wrong code", async () => {
    verifySetup.mockRejectedValueOnce(new DynamicWrongCodeError());
    await render();
    await typeCode("000000");
    await act(async () => button("Turn On").click());

    expect(text()).toContain("That code didn't work");
    expect(text()).toContain(SETUP.secret);
  });

  it("closes when the user cancels Confirm it's you", async () => {
    startSetup.mockRejectedValueOnce(new IdentityCheckCancelledError());
    await render();

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("removes a set-up app with a current code", async () => {
    await render({ id: "totp-1", addedAt: null });

    expect(startSetup).not.toHaveBeenCalled();
    expect(button("Remove").disabled).toBe(true);

    await typeCode("123456");
    await act(async () => button("Remove").click());

    expect(remove).toHaveBeenCalledWith("123456");
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("describeAuthenticator", () => {
  it("sums up the app for the Security row", () => {
    expect(describeAuthenticator(undefined, false).status).toBe("Checking…");
    expect(describeAuthenticator(null, false)).toEqual({
      status: "Not set up",
      tone: "warning",
    });
    expect(
      describeAuthenticator({ id: "t", addedAt: new Date(2026, 10, 2) }, false)
    ).toEqual({ status: "Set up, added 2 Nov 2026", tone: "success" });
  });
});
