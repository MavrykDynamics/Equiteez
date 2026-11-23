// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// vitest runs without svgr: stand-ins for the ?react icons
vi.mock("app/icons/checkbox-checked.svg?react", () => ({
  default: () => null,
}));
vi.mock("app/icons/checkbox-unchecked.svg?react", () => ({
  default: () => null,
}));
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

import {
  DynamicPasswordAlreadySetError,
  DynamicWrongPasswordError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import { describeWalletPassword } from "./useWalletPassword";
import { WalletPasswordModal } from "./WalletPasswordModal";

let container: HTMLDivElement;
let root: Root;
const save =
  vi.fn<
    (params: { currentPassword?: string; newPassword: string }) => Promise<void>
  >();
const markPasswordSet = vi.fn();
const onClose = vi.fn();

const render = (hasPassword: boolean) =>
  act(async () =>
    root.render(
      <WalletPasswordModal
        hasPassword={hasPassword}
        isOpen
        markPasswordSet={markPasswordSet}
        onClose={onClose}
        save={save}
      />
    )
  );
const text = () => container.textContent ?? "";
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  )!;
const fill = (label: string, value: string) =>
  act(async () => {
    const field = Array.from(container.querySelectorAll("label")).find(
      (element) => element.textContent === label
    )!;
    const input = document.getElementById(field.htmlFor) as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
const acknowledge = () =>
  act(async () =>
    container.querySelector<HTMLInputElement>("input[type=checkbox]")!.click()
  );
const submit = () => act(async () => button("Set Password").click());

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  save.mockReset().mockResolvedValue(undefined);
  markPasswordSet.mockReset();
  onClose.mockReset();
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("WalletPasswordModal", () => {
  it("sets a password only once it is long enough, confirmed and acknowledged", async () => {
    await render(false);

    expect(text()).toContain("Set Wallet Password");
    expect(text()).toContain("Nobody can reset this password");

    await fill("New Password", "short");
    expect(text()).toContain("Use at least 8 characters.");

    await fill("New Password", "long-enough");
    await fill("Confirm New Password", "long-enougH");
    expect(text()).toContain("The passwords don't match.");

    await fill("Confirm New Password", "long-enough");
    expect(button("Set Password").disabled).toBe(true);

    await acknowledge();
    await submit();

    expect(save).toHaveBeenCalledWith({
      currentPassword: undefined,
      newPassword: "long-enough",
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("asks for the current password to change it", async () => {
    await render(true);

    expect(text()).toContain("Change Wallet Password");
    expect(container.querySelector("input[type=checkbox]")).toBeNull();

    await fill("Current Password", "old-password");
    await fill("New Password", "new-password");
    await fill("Confirm New Password", "new-password");
    await act(async () => button("Change Password").click());

    expect(save).toHaveBeenCalledWith({
      currentPassword: "old-password",
      newPassword: "new-password",
    });
  });

  it("stays open with the reason for a wrong current password", async () => {
    save.mockRejectedValue(new DynamicWrongPasswordError());
    await render(true);
    await fill("Current Password", "wrong-one");
    await fill("New Password", "new-password");
    await fill("Confirm New Password", "new-password");
    await act(async () => button("Change Password").click());

    expect(text()).toContain("That password didn't work");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("switches to changing when Dynamic already has a password", async () => {
    save.mockRejectedValue(new DynamicPasswordAlreadySetError());
    await render(false);
    await fill("New Password", "long-enough");
    await fill("Confirm New Password", "long-enough");
    await acknowledge();
    await submit();

    expect(markPasswordSet).toHaveBeenCalledOnce();
    expect(text()).toContain("Enter the current one to change it");
  });
});

describe("describeWalletPassword", () => {
  it("sums up the password for the Security row", () => {
    expect(describeWalletPassword(null, false).status).toBe("Checking…");
    expect(describeWalletPassword(null, true).status).toContain(
      "Couldn't check"
    );
    expect(describeWalletPassword(true, false)).toMatchObject({
      tone: "success",
    });
    expect(describeWalletPassword(false, false)).toMatchObject({
      tone: "warning",
    });
  });
});
