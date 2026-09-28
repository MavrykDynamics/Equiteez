// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useNotifierSocket } from "../NotificationsProvider/hooks/useNotifierSocket/useNotifierSocket";

const mocks = vi.hoisted(() => ({ cleanup: vi.fn() }));
vi.mock("~/providers/AuthProvider/helpers/auth.service", () => ({
  AuthService: { refreshAccessToken: async () => "test-token" },
}));
vi.mock("~/providers/AuthProvider/helpers/storage", () => ({
  getAuthTokensFromStorage: async () => ({ accessToken: "test-token" }),
}));
vi.mock("~/providers/AuthProvider/helpers/auth-sync.helpers", () => ({
  AUTH_LOGOUT_EVENT: "LOGOUT",
  AUTH_TOKENS_UPDATED_EVENT: "TOKENS_UPDATED",
  subscribeToAuthSyncEvents: () => mocks.cleanup,
}));
vi.mock("~/providers/NotificationsProvider/helpers/notifier.jwt", () => ({
  getNotifierJwtWalletAddress: () => "wallet-a",
  isNotifierAccessTokenExpired: () => false,
}));
vi.mock("~/providers/NotificationsProvider/helpers/notifier.url", () => ({
  resolveNotifierUrl: () => "ws://notifier.test",
}));

class Socket {
  readyState = 1;
  onopen: WebSocket["onopen"] = null;
  onmessage: WebSocket["onmessage"] = null;
  onerror: WebSocket["onerror"] = null;
  onclose: WebSocket["onclose"] = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3;
  });
  frame(value: unknown) {
    this.onmessage?.call(
      this as unknown as WebSocket,
      new MessageEvent("message", { data: JSON.stringify(value) })
    );
  }
}
it("deduplicates event IDs per authenticated wallet, rejects obsolete sockets and cleans up in Strict Mode", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const element = document.createElement("div");
  const root = createRoot(element);
  const sockets: Socket[] = [];
  const factory = () => {
    const socket = new Socket();
    sockets.push(socket);
    return socket as unknown as WebSocket;
  };
  const onEvent = vi.fn();
  function Probe({ enabled }: { enabled: boolean }) {
    useNotifierSocket({ enabled, onEvent, webSocketFactory: factory });
    return null;
  }
  const render = async (enabled: boolean) => {
    await act(async () =>
      root.render(
        createElement(StrictMode, null, createElement(Probe, { enabled }))
      )
    );
  };
  const frame = {
    type: "event",
    channel: "wallet",
    event_type: "BRIDGE_DEPOSIT_UPDATED",
    occurred_at: "2026-09-24T00:00:00Z",
    event_id: "same",
    payload: { status: "COMPLETED" },
  };
  try {
    await render(true);
    const first = sockets.at(-1)!;
    await act(async () => {
      first.onopen?.call(first as unknown as WebSocket, new Event("open"));
      first.frame(frame); // No authenticated wallet yet.
      first.frame({ type: "auth_ok", wallet: "wallet-a" });
      first.frame(frame);
      first.frame(frame);
      first.frame({ ...frame, event_id: "distinct" });
    });
    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent.mock.calls.every((call) => call[1] === "wallet-a")).toBe(
      true
    );
    expect(
      first.send.mock.calls.map((call) => JSON.parse(call[0]).type)
    ).toEqual(["auth"]);
    await render(false);
    expect(first.close).toHaveBeenCalled();
    await render(true);
    const second = sockets.at(-1)!;
    await act(async () => {
      second.frame({ type: "auth_ok", wallet: "wallet-b" });
      second.frame(frame);
      first.frame({ ...frame, event_id: "obsolete" });
    });
    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent.mock.lastCall?.[1]).toBe("wallet-b");
    await act(async () => root.unmount());
    expect(second.close).toHaveBeenCalled();
    expect(mocks.cleanup).toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
