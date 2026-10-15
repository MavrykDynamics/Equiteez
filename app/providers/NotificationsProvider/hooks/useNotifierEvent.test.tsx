// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useNotifierEvent } from "./useNotifierEvent";
const mocks = vi.hoisted(() => ({ handler: null as ((frame: { event_type: string }, wallet: string) => unknown) | null }));
vi.mock("./useNotifierChannel", () => ({ useNotifierChannel: (_: unknown, handler: typeof mocks.handler) => { mocks.handler = handler; } }));
let root: ReturnType<typeof createRoot>;
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.handler = null; root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("forwards only matching notifier events", async () => { const received = vi.fn(); function Probe() { useNotifierEvent("wallet", "UPDATE" as never, received); return null; } await act(async () => root.render(createElement(Probe))); mocks.handler?.({ event_type: "OTHER" }, "wallet-a"); mocks.handler?.({ event_type: "UPDATE" }, "wallet-a"); expect(received).toHaveBeenCalledOnce(); });
