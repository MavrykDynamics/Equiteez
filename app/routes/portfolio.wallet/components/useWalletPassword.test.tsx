// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  success: vi.fn(),
  dynamic: {
    hasWalletPassword: vi.fn(),
    setWalletPassword: vi.fn(),
    changeWalletPassword: vi.fn(),
  },
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dynamic: mocks.dynamic }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({ success: mocks.success }),
}));

import { useWalletPassword } from "./useWalletPassword";

let container: HTMLDivElement;
let root: Root;
let hook: ReturnType<typeof useWalletPassword>;

function Probe() {
  hook = useWalletPassword();
  return null;
}

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.dynamic.hasWalletPassword.mockResolvedValue(false);
  mocks.dynamic.setWalletPassword.mockResolvedValue(undefined);
  mocks.dynamic.changeWalletPassword.mockResolvedValue(undefined);
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => root.render(<Probe />));
});

afterEach(() => {
  act(() => root.unmount());
});

describe("useWalletPassword", () => {
  it("shows a toast once a password is set", async () => {
    expect(hook.hasPassword).toBe(false);

    await act(async () => hook.save({ newPassword: "long-enough" }));

    expect(mocks.dynamic.setWalletPassword).toHaveBeenCalledWith("long-enough");
    expect(mocks.success).toHaveBeenCalledWith(
      "Password set",
      expect.any(String)
    );
    expect(hook.hasPassword).toBe(true);
  });

  it("shows a toast once the password is changed", async () => {
    await act(async () =>
      hook.save({ currentPassword: "old-password", newPassword: "new-one!" })
    );

    expect(mocks.dynamic.changeWalletPassword).toHaveBeenCalledWith(
      "old-password",
      "new-one!"
    );
    expect(mocks.success).toHaveBeenCalledWith(
      "Password changed",
      expect.any(String)
    );
  });

  it("shows no toast when saving fails", async () => {
    mocks.dynamic.changeWalletPassword.mockRejectedValue(new Error("wrong"));

    await act(async () =>
      hook
        .save({ currentPassword: "bad", newPassword: "new-one!" })
        .catch(() => undefined)
    );

    expect(mocks.success).not.toHaveBeenCalled();
  });
});
