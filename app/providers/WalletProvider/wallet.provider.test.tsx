// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WalletProvider, useWalletContext } from "./wallet.provider";
const mocks = vi.hoisted(() => ({ dapp: { id: "dapp" }, create: vi.fn() }));
vi.mock("./WalletCore.client", () => ({ dappClient: () => mocks.create() }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof useWalletContext>;
function Probe() { value = useWalletContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.create.mockReset().mockReturnValue(mocks.dapp); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("creates the dapp client after mount and clears loading", async () => { await act(async () => root.render(createElement(WalletProvider, null, createElement(Probe)))); expect(mocks.create).toHaveBeenCalledOnce(); expect(value).toEqual({ dapp: mocks.dapp, isLoading: false }); });
