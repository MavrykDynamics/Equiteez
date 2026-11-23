// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  password: {
    hasPassword: null as boolean | null,
    hasError: false,
    save: vi.fn(),
    markPasswordSet: vi.fn(),
    reload: vi.fn(),
  },
}));

vi.mock("~/providers/WalletProvider/wallet.provider", () => ({
  useWalletContext: () => ({ dynamic: { revealPrivateKey: vi.fn() } }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({ success: vi.fn() }),
}));
vi.mock("./useWalletPassword", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useWalletPassword")>()),
  useWalletPassword: () => mocks.password,
}));
vi.mock("./useAuthenticator", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useAuthenticator")>()),
  useAuthenticator: () => ({ authenticator: null, hasError: false }),
}));
vi.mock("./usePasskeys", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./usePasskeys")>()),
  usePasskeys: () => ({ passkeys: [], error: null }),
}));
vi.mock("./useGoogleDriveBackup", () => ({
  useGoogleDriveBackup: () => ({ isBackedUp: false, accessSource: null }),
}));
// The modals stay closed here
vi.mock("./AuthenticatorModal", () => ({ AuthenticatorModal: () => null }));
vi.mock("./ExportKeyModal", () => ({ ExportKeyModal: () => null }));
vi.mock("./GoogleDriveBackupModal", () => ({
  GoogleDriveBackupModal: () => null,
}));
vi.mock("./PasskeysModal", () => ({ PasskeysModal: () => null }));
vi.mock("./WalletPasswordModal", () => ({ WalletPasswordModal: () => null }));

import { EmailWalletSettings } from "./WalletSecurity";

let container: HTMLDivElement;
let root: Root;

const button = (label: string) =>
  Array.from(container.querySelectorAll("button")).find(
    (element) => element.textContent?.trim() === label
  )!;
const render = () => act(async () => root.render(<EmailWalletSettings />));

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  mocks.password.hasPassword = null;
  mocks.password.hasError = false;
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
});

describe("EmailWalletSettings", () => {
  it("keeps Export and Backup off until the password status is known", async () => {
    await render();

    expect(button("Export private key").disabled).toBe(true);
    expect(button("Back up to Google Drive").disabled).toBe(true);

    mocks.password.hasPassword = true;
    await render();

    expect(button("Export private key").disabled).toBe(false);
    expect(button("Back up to Google Drive").disabled).toBe(false);
  });
});
