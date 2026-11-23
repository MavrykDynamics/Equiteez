// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/lib/organisms/CustomPopup/CustomPopup", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

import { IdentityCheckCancelledError } from "~/providers/WalletProvider/dynamic/dynamic.errors";
import {
  askToConfirmIdentity,
  getPendingIdentityCheck,
  type IdentityMethod,
} from "~/providers/WalletProvider/dynamic/identityCheck";

import { ConfirmIdentityModal } from "./ConfirmIdentityModal";

let container: HTMLDivElement;
let root: Root;

const text = () => container.textContent ?? "";
const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  );
const typeCode = (code: string) =>
  act(async () => {
    const input = container.querySelector<HTMLInputElement>(
      "input[autocomplete=one-time-code]"
    )!;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!;
    setValue.call(input, code);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

const emailMethod = (verify = vi.fn(async () => undefined)) =>
  ({
    kind: "code",
    id: "email:a@b.co",
    label: "Email me a code",
    sentTo: "a@b.co",
    send: vi.fn(async () => "a@b.co"),
    verify,
  }) satisfies IdentityMethod;

const open = async (methods: IdentityMethod[]) => {
  let pending!: Promise<void>;
  await act(async () => {
    pending = askToConfirmIdentity(methods);
  });
  // Settled by the test; a rejection here is asserted where it matters
  pending.catch(() => undefined);
  // Wrapped: returning the promise itself would make `await open()` wait for it
  return { pending };
};

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  // Attached: a submit button submits only a form in the document
  container = document.body.appendChild(document.createElement("div"));
  root = createRoot(container);
  await act(async () => root.render(<ConfirmIdentityModal />));
});

afterEach(() => {
  act(() => getPendingIdentityCheck()?.cancel());
  act(() => root.unmount());
  container.remove();
});

describe("ConfirmIdentityModal", () => {
  it("stays closed until Dynamic asks for a check", () => {
    expect(text()).toBe("");
  });

  it("finishes the check with the emailed code", async () => {
    const method = emailMethod();
    const { pending } = await open([method]);

    expect(text()).toContain("We sent a 6-digit code to a@b.co");
    expect(button("Confirm")!.disabled).toBe(true);

    await typeCode("123456");
    await act(async () => button("Confirm")!.click());

    expect(method.verify).toHaveBeenCalledWith("123456");
    await expect(pending).resolves.toBeUndefined();
    expect(text()).toBe("");
  });

  it("keeps the dialog open with an error for a wrong code", async () => {
    const method = emailMethod(
      vi.fn(async () => {
        throw new Error("invalid");
      })
    );
    await open([method]);
    await typeCode("000000");
    await act(async () => button("Confirm")!.click());

    expect(text()).toContain("That code didn't work");
    expect(getPendingIdentityCheck()).not.toBeNull();
  });

  it("cancels the check when the user closes it", async () => {
    const { pending } = await open([emailMethod()]);

    await act(async () => button("Cancel")!.click());

    await expect(pending).rejects.toBeInstanceOf(IdentityCheckCancelledError);
  });

  it("switches to another way and emails its code only on request", async () => {
    const run = vi.fn(async () => undefined);
    const email = { ...emailMethod(), sentTo: null };
    await open([
      { kind: "passkey", id: "passkey", label: "Use a passkey", run },
      email,
    ]);

    expect(button("Use a passkey")).toBeDefined();
    await act(async () => button("Email me a code")!.click());
    expect(email.send).not.toHaveBeenCalled();

    await act(async () => button("Send code")!.click());
    expect(email.send).toHaveBeenCalledOnce();
    expect(text()).toContain("We sent a 6-digit code to a@b.co");
  });
  it("cancels an open check when the page goes away", async () => {
    const { pending } = await open([emailMethod()]);

    act(() => root.unmount());
    root = createRoot(container);

    await expect(pending).rejects.toBeInstanceOf(IdentityCheckCancelledError);
    expect(getPendingIdentityCheck()).toBeNull();
  });
});
