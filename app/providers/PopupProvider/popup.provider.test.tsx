// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PopupProvider, usePopupContext } from "./popup.provider";
const mocks = vi.hoisted(() => ({ sleep: vi.fn(), open: false }));
vi.mock("~/lib/utils/sleep", () => ({ sleep: () => mocks.sleep() }));
vi.mock("./popups/TransactionOperationPopup/TransactionOperationPopup", () => ({ TransactionOperationPopup: ({ isOpen }: { isOpen: boolean }) => { mocks.open = isOpen; return null; } }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof usePopupContext>;
function Probe() { value = usePopupContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.open = false; mocks.sleep.mockReset().mockResolvedValue(undefined); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("shows and hides the transaction popup", async () => { await act(async () => root.render(createElement(PopupProvider, null, createElement(Probe)))); await act(async () => value.showPopup(value.popupKeys.inProgressRwaAd, {})); expect(mocks.open).toBe(true); await act(async () => value.hidePopup(value.popupKeys.inProgressRwaAd)); expect(mocks.open).toBe(false); expect(mocks.sleep).toHaveBeenCalledOnce(); });
