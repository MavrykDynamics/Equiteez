// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HubConnection } from "@microsoft/signalr";

import { DEFAULT_USER } from "../helpers/user.consts";
import { useUserApi } from "./useUserApi";

type Api = ReturnType<typeof useUserApi>;

const wallet = {
  connectMavrykWallet: vi.fn(async () => undefined),
  disconnect: vi.fn(async () => undefined),
  getIdentity: vi.fn(),
};
const setUserCtxState = vi.fn();
const setUserLoading = vi.fn();
const setTzktSocket = vi.fn();
const socket = { stop: vi.fn(async () => undefined) };

let root: Root;
let api: Api;

function Probe() {
  api = useUserApi({
    wallet: wallet as never,
    setUserLoading,
    setUserCtxState,
    tzktSocket: socket as unknown as HubConnection,
    setTzktSocket,
  });
  return null;
}

beforeEach(async () => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Probe />));
});

afterEach(() => {
  act(() => root.unmount());
});

describe("useUserApi", () => {
  it("signs out fully from the Sign out button", async () => {
    await act(() => api.signOut());

    expect(wallet.disconnect).toHaveBeenCalledWith({
      keepProviderSession: false,
    });
    expect(setUserCtxState).toHaveBeenCalledWith(DEFAULT_USER);
  });

  it("keeps the Dynamic session on automatic sign-outs", async () => {
    await act(() => api.signOut({ keepProviderSession: true }));

    expect(wallet.disconnect).toHaveBeenCalledWith({
      keepProviderSession: true,
    });
  });

  it("disconnects the wallet even when the socket fails to stop", async () => {
    socket.stop.mockRejectedValueOnce(new Error("socket already closed"));

    await act(() => api.signOut());

    expect(wallet.disconnect).toHaveBeenCalled();
    expect(setUserCtxState).toHaveBeenCalledWith(DEFAULT_USER);
  });

  it("changes the email wallet account without opening Mavryk Wallet", async () => {
    wallet.getIdentity.mockReturnValue({ provider: "dynamic" });

    await act(() => api.changeUser());

    expect(wallet.disconnect).toHaveBeenCalledWith({
      keepProviderSession: true,
    });
    expect(wallet.connectMavrykWallet).not.toHaveBeenCalled();
  });

  it("lets Mavryk Wallet users pick another account in the extension", async () => {
    wallet.getIdentity.mockReturnValue({ provider: "mavryk_extension" });

    await act(() => api.changeUser());

    expect(wallet.connectMavrykWallet).toHaveBeenCalled();
    expect(wallet.disconnect).not.toHaveBeenCalled();
  });
});
