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
vi.mock("app/icons/export-key.svg?react", () => ({ default: () => null }));
vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

import {
  DynamicSessionExpiredError,
  IdentityCheckCancelledError,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

import { ExportKeyModal } from "./ExportKeyModal";

let container: HTMLDivElement;
let root: Root;
const onClose = vi.fn();
const onContinue =
  vi.fn<(displayContainer: HTMLElement, password?: string) => Promise<void>>();

const render = () =>
  act(async () =>
    root.render(
      <ExportKeyModal isOpen onClose={onClose} onContinue={onContinue} />
    )
  );
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  )!;
const confirm = () =>
  act(async () => container.querySelector<HTMLInputElement>("input")!.click());

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  onClose.mockReset();
  onContinue.mockReset().mockResolvedValue(undefined);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("ExportKeyModal", () => {
  it("shows the key in Dynamic's frame only after the user takes responsibility", async () => {
    await render();

    expect(container.textContent).toContain("Before You Export Your Key");
    expect(button("Continue").disabled).toBe(true);

    await confirm();
    await act(async () => button("Continue").click());

    // The key frame is a box inside this modal, shown once the key is there
    const keyFrame = onContinue.mock.calls[0][0];
    expect(container.contains(keyFrame)).toBe(true);
    expect(keyFrame.hidden).toBe(false);
    expect(button("Continue")).toBeUndefined();
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => button("Done").click());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("stays open with an error when the key cannot be shown", async () => {
    onContinue.mockRejectedValue(new Error("iframe"));
    await render();
    await confirm();
    await act(async () => button("Continue").click());

    expect(container.textContent).toContain("Couldn't show your key");
    expect(onClose).not.toHaveBeenCalled();
    expect(button("Continue").disabled).toBe(false);
  });

  it("asks to sign in again when the Dynamic session has expired", async () => {
    onContinue.mockRejectedValue(new DynamicSessionExpiredError());
    await render();
    await confirm();
    await act(async () => button("Continue").click());

    expect(container.textContent).toContain("Your email sign-in has expired");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays open without an error when the user cancels the check", async () => {
    onContinue.mockRejectedValue(new IdentityCheckCancelledError());
    await render();
    await confirm();
    await act(async () => button("Continue").click());

    expect(onClose).not.toHaveBeenCalled();
    expect(container.querySelector("[role=alert]")).toBeNull();
    expect(button("Continue").disabled).toBe(false);
  });

  it("cancels without opening anything", async () => {
    await render();
    await act(async () => button("Cancel").click());

    expect(onClose).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });
  it("asks for the wallet password when the wallet has one", async () => {
    await act(async () =>
      root.render(
        <ExportKeyModal
          hasPassword
          isOpen
          onClose={onClose}
          onContinue={onContinue}
        />
      )
    );
    await confirm();
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
    await act(async () => button("Continue").click());

    expect(onContinue).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "long-enough"
    );
  });
});
