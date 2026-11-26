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
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

import { DynamicWrongPasswordError } from "~/providers/WalletProvider/dynamic/dynamic.errors";
import { GoogleDriveAccessError } from "~/providers/WalletProvider/dynamic/googleDriveToken";

import { GoogleDriveBackupModal } from "./GoogleDriveBackupModal";
import type { DriveAccessSource } from "./useGoogleDriveBackup";

let container: HTMLDivElement;
let root: Root;
const prepare = vi.fn<() => Promise<void>>();
const backUp = vi.fn<(options: { password?: string }) => Promise<void>>();
const onClose = vi.fn();

const render = ({
  accessSource = "popup" as DriveAccessSource | null,
  isAvailable = true,
  hasPassword = false,
} = {}) =>
  act(async () =>
    root.render(
      <GoogleDriveBackupModal
        accessSource={accessSource}
        backUp={backUp}
        hasPassword={hasPassword}
        isAvailable={isAvailable}
        isOpen
        onClose={onClose}
        prepare={prepare}
      />
    )
  );
const text = () => container.textContent ?? "";
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  )!;
const backUpClick = () => act(async () => button("Continue").click());

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  prepare.mockReset().mockResolvedValue(undefined);
  backUp.mockReset().mockResolvedValue(undefined);
  onClose.mockReset();
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("GoogleDriveBackupModal", () => {
  it("checks the Google access on open and backs up", async () => {
    await render();

    expect(prepare).toHaveBeenCalledOnce();
    expect(text()).toContain("enable both requested permissions");

    await backUpClick();

    expect(backUp).toHaveBeenCalledWith({ password: undefined });
    expect(text()).toContain("Backup Enabled");

    await act(async () => button("OK").click());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("uses the Google sign-in without a popup when it has Drive access", async () => {
    await render({ accessSource: "stored" });

    expect(text()).toContain("the Google account you signed in with");
  });

  it("waits for the access check before backing up", async () => {
    await render({ accessSource: null });

    expect(text()).toContain("Checking your Google access");
    expect(button("Continue").disabled).toBe(true);
  });

  it("says when backup isn't available for an email sign-in", async () => {
    await render({ isAvailable: false });

    expect(text()).toContain("isn't available for email sign-in yet");
    expect(button("Continue").disabled).toBe(true);
  });

  it("asks for the wallet password when the wallet has one", async () => {
    await render({ hasPassword: true });
    expect(button("Continue").disabled).toBe(true);

    await act(async () => {
      const input = container.querySelector<HTMLInputElement>(
        "input[type=password]"
      )!;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!.call(input, "long-enough");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await backUpClick();

    expect(backUp).toHaveBeenCalledWith({ password: "long-enough" });
  });

  it("stays open with the reason when the backup fails", async () => {
    backUp.mockRejectedValueOnce(
      new GoogleDriveAccessError(
        "Tick both Google Drive boxes, then try again."
      )
    );
    await render();
    await backUpClick();

    expect(text()).toContain("Tick both Google Drive boxes, then try again.");
    expect(onClose).not.toHaveBeenCalled();

    backUp.mockRejectedValueOnce(new DynamicWrongPasswordError());
    await backUpClick();
    expect(text()).toContain("That password didn't work");

    backUp.mockRejectedValueOnce(new Error("relay down"));
    await backUpClick();
    expect(text()).toContain("We couldn't back up your wallet");
  });
});
