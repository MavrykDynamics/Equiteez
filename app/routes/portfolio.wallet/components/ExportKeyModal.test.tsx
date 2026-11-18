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

import { DynamicSessionExpiredError } from "~/providers/WalletProvider/dynamic/dynamic.errors";

import { ExportKeyModal } from "./ExportKeyModal";

let container: HTMLDivElement;
let root: Root;
const onClose = vi.fn();
const onContinue = vi.fn<() => Promise<boolean>>();

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
  onContinue.mockReset().mockResolvedValue(true);
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("ExportKeyModal", () => {
  it("opens Dynamic's key window only after the user takes responsibility", async () => {
    await render();

    expect(container.textContent).toContain("Before You Export Your Key");
    expect(button("Continue").disabled).toBe(true);

    await confirm();
    await act(async () => button("Continue").click());

    expect(onContinue).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("stays open with an error when the window cannot open", async () => {
    onContinue.mockRejectedValue(new Error("iframe"));
    await render();
    await confirm();
    await act(async () => button("Continue").click());

    expect(container.textContent).toContain("Couldn't open the secure window");
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

  it("stays open when the user cancels Dynamic's check", async () => {
    onContinue.mockResolvedValue(false);
    await render();
    await confirm();
    await act(async () => button("Continue").click());

    expect(onClose).not.toHaveBeenCalled();
    expect(button("Continue").disabled).toBe(false);
  });

  it("cancels without opening anything", async () => {
    await render();
    await act(async () => button("Cancel").click());

    expect(onClose).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });
});
