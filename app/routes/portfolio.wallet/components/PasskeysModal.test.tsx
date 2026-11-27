// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DynamicSessionExpiredError,
  IdentityCheckCancelledError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";
import type { DynamicPasskey } from "~/providers/WalletProvider/dynamic/dynamicClient.client";

const mocks = vi.hoisted(() => ({
  passkeys: [] as DynamicPasskey[],
  getPasskeys: vi.fn(),
  addPasskey: vi.fn(),
  removePasskey: vi.fn(),
}));

// One stable object, as the provider memoizes it: a new one every render
// would reload the list on each render
const wallet = vi.hoisted(() => ({ dynamic: {} as Record<string, unknown> }));

// vitest runs without svgr: stand-ins for the ?react icons
vi.mock("app/icons/checkbox-checked.svg?react", () => ({
  default: () => null,
}));
vi.mock("app/icons/checkbox-unchecked.svg?react", () => ({
  default: () => null,
}));
vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => wallet,
}));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

import { PasskeysModal } from "./PasskeysModal";
import { describePasskeys, usePasskeys } from "./usePasskeys";

const MAC: DynamicPasskey = {
  id: "pk-1",
  name: "iCloud Keychain",
  createdAt: new Date("2026-11-02T10:00:00Z"),
};
const PHONE: DynamicPasskey = {
  id: "pk-2",
  name: null,
  createdAt: new Date("2026-11-10T10:00:00Z"),
};

let container: HTMLDivElement;
let root: Root;

function Harness() {
  const passkeys = usePasskeys();

  return (
    <>
      <p>{describePasskeys(passkeys.passkeys, Boolean(passkeys.error))}</p>
      <PasskeysModal {...passkeys} isOpen onClose={vi.fn()} />
    </>
  );
}

const render = () => act(async () => root.render(<Harness />));
const text = () => container.textContent ?? "";
const buttons = (label: string) =>
  Array.from(container.querySelectorAll("button")).filter(
    (element) => element.textContent?.trim() === label
  );
const click = (label: string, index = 0) =>
  act(async () => buttons(label)[index].click());

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  wallet.dynamic = {
    getPasskeys: mocks.getPasskeys,
    addPasskey: mocks.addPasskey,
    removePasskey: mocks.removePasskey,
  };
  mocks.passkeys = [MAC];
  mocks.getPasskeys.mockReset().mockImplementation(async () => mocks.passkeys);
  mocks.addPasskey.mockReset().mockImplementation(async () => {
    mocks.passkeys = [...mocks.passkeys, PHONE];
  });
  mocks.removePasskey.mockReset().mockImplementation(async (id: string) => {
    mocks.passkeys = mocks.passkeys.filter((passkey) => passkey.id !== id);
  });
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("Passkeys", () => {
  it("lists the passkeys and sums them up for the Security row", async () => {
    await render();

    expect(text()).toContain("1 passkey: iCloud Keychain, added 2 Nov 2026");
    expect(text()).toContain("Added 2 Nov 2026");
  });

  it("adds a passkey and shows the new one on Passkey Added", async () => {
    await render();
    await click("Add Another Passkey");

    expect(mocks.addPasskey).toHaveBeenCalledOnce();
    expect(text()).toContain("2 passkeys, the latest added 10 Nov 2026");
    expect(text()).toContain("Passkey Added");
    // Only the new passkey, with its Remove
    expect(text()).toContain("Added 10 Nov 2026");
    expect(buttons("Remove")).toHaveLength(1);
  });

  it("removes a passkey after Remove Passkey?", async () => {
    await render();
    await click("Remove");

    expect(text()).toContain("Remove Passkey?");
    expect(mocks.removePasskey).not.toHaveBeenCalled();

    await click("Confirm And Remove");

    expect(mocks.removePasskey).toHaveBeenCalledWith("pk-1");
    expect(text()).toContain("No passkeys yet");
    expect(text()).toContain("Passkey Removed");
  });

  it("offers Set Up A Passkey when there is none", async () => {
    mocks.passkeys = [];
    await render();

    expect(text()).toContain("Set Up A Passkey");

    await click("Create Passkey");
    expect(mocks.addPasskey).toHaveBeenCalledOnce();
    expect(text()).toContain("Passkey Added");
  });

  it("stays quiet when the browser prompt is dismissed", async () => {
    mocks.addPasskey.mockRejectedValue(
      Object.assign(new Error("The operation was not allowed"), {
        name: "NotAllowedError",
      })
    );
    await render();
    await click("Add Another Passkey");

    expect(container.querySelector("[role=alert]")).toBeNull();
  });

  it("stays quiet when the user closes Confirm it's you", async () => {
    mocks.addPasskey.mockRejectedValue(new IdentityCheckCancelledError());
    mocks.removePasskey.mockRejectedValue(new IdentityCheckCancelledError());
    await render();
    await click("Add Another Passkey");
    await click("Remove");
    await click("Confirm And Remove");

    expect(container.querySelector("[role=alert]")).toBeNull();
  });

  it("says when passkeys are off in Dynamic", async () => {
    mocks.addPasskey.mockRejectedValue(
      new Error("Passkey authenticator is not enabled")
    );
    await render();
    await click("Add Another Passkey");

    expect(text()).toContain("Passkeys aren't turned on for Equiteez yet.");
  });

  it("asks to sign in again when the Dynamic session has expired", async () => {
    mocks.getPasskeys.mockRejectedValue(new DynamicSessionExpiredError());
    await render();

    expect(text()).toContain("Couldn't load your passkeys");
    expect(text()).toContain("Your email sign-in has expired");
  });
});
