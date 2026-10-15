// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  NotificationsProvider,
  useNotificationsContext,
} from "./NotificationsProvider";
import type { NotificationsContextType } from "./notifications.provider.types";
import { NotifierChannel, NotifierConnectionStatus } from "./notifications.const";

const mocks = vi.hoisted(() => ({
  wallet: "wallet-a" as string | null,
  authenticated: true,
  invalidate: vi.fn(),
  read: vi.fn(),
  send: vi.fn(),
  connected: null as (() => void) | null,
  subscribed: null as ((frame: { channels?: string[] }) => void) | null,
  event: null as ((frame: never, wallet: string) => void) | null,
}));

vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({
    authenticatedWalletAddress: mocks.wallet,
    isAuthenticated: mocks.authenticated,
  }),
}));
vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: Symbol("keepPreviousData"),
  useQuery: () => ({ data: { items: [], unread_count: 3 }, isFetching: false }),
  useQueryClient: () => ({
    invalidateQueries: (...args: unknown[]) => mocks.invalidate(...args),
  }),
}));
vi.mock("~/lib/apis/rwa", () => ({
  fetchWalletNotifications: vi.fn(),
  fetchWalletNotificationsSummary: vi.fn(),
  readWalletNotifications: (...args: unknown[]) => mocks.read(...args),
}));
vi.mock("./hooks/useNotifierSocket", () => ({
  useNotifierSocket: (params: {
    onConnected?: () => void;
    onSubscribed?: (frame: { channels?: string[] }) => void;
    onEvent: (frame: never, wallet: string) => void;
  }) => {
    mocks.connected = params.onConnected ?? null;
    mocks.subscribed = params.onSubscribed ?? null;
    mocks.event = params.onEvent;
    return {
      status: NotifierConnectionStatus.Connected,
      wallet: mocks.wallet,
      sendFrame: (...args: unknown[]) => mocks.send(...args),
    };
  },
}));

let root: Root;
let element: HTMLDivElement;
let context: NotificationsContextType;
function Probe() {
  context = useNotificationsContext();
  return null;
}
async function render() {
  await act(async () => root.render(createElement(NotificationsProvider, null, createElement(Probe))));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.wallet = "wallet-a";
  mocks.authenticated = true;
  mocks.connected = null;
  mocks.subscribed = null;
  mocks.event = null;
  mocks.invalidate.mockReset().mockResolvedValue(undefined);
  mocks.read.mockReset().mockResolvedValue(undefined);
  mocks.send.mockReset().mockReturnValue(true);
  element = document.createElement("div");
  root = createRoot(element);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

it("exposes authenticated notification data and refetches all notification caches", async () => {
  await render();
  expect(context).toMatchObject({
    unreadNotificationsCount: 3,
    isNotificationsEnabled: true,
    isNotificationsLoading: false,
    status: NotifierConnectionStatus.Connected,
    wallet: "wallet-a",
  });
  await act(async () => context.refetchNotifications());
  expect(mocks.invalidate).toHaveBeenCalledTimes(3);
});

it("marks notifications read for the authenticated wallet and refreshes caches", async () => {
  await render();
  await act(async () => context.readAllNotification("cursor"));
  expect(mocks.read).toHaveBeenCalledWith({ before: "cursor", walletAddress: "wallet-a" });
  expect(mocks.invalidate).toHaveBeenCalledTimes(3);
});

it("subscribes once per desired channel and unsubscribes after the final handler", async () => {
  await render();
  const first = vi.fn();
  const second = vi.fn();
  let removeFirst!: () => void;
  let removeSecond!: () => void;
  await act(async () => {
    removeFirst = context.registerChannelHandler("launch:KT1", first);
    removeSecond = context.registerChannelHandler("launch:KT1", second);
  });
  expect(mocks.send).toHaveBeenCalledTimes(1);
  expect(mocks.send).toHaveBeenLastCalledWith({ type: "subscribe", channels: ["launch:KT1"] });
  await act(async () => removeFirst());
  expect(mocks.send).toHaveBeenCalledTimes(1);
  await act(async () => removeSecond());
  expect(mocks.send).toHaveBeenLastCalledWith({ type: "unsubscribe", channels: ["launch:KT1"] });
});

it("resubscribes all desired channels after socket reconnection", async () => {
  await render();
  await act(async () => context.subscribe("launch:KT1"));
  mocks.send.mockClear();
  await act(async () => mocks.connected?.());
  expect(mocks.send).toHaveBeenCalledWith({ type: "subscribe", channels: ["launch:KT1"] });
});

it("does not send socket frames for the implicit wallet channel", async () => {
  await render();
  await act(async () => context.subscribe(NotifierChannel.Wallet));
  await act(async () => context.unsubscribe(NotifierChannel.Wallet));
  expect(mocks.send).not.toHaveBeenCalled();
});

it("invalidates notification caches when the authenticated identity changes", async () => {
  await render();
  mocks.invalidate.mockClear();
  mocks.wallet = "wallet-b";
  await render();
  expect(mocks.invalidate).toHaveBeenCalledTimes(3);
});
