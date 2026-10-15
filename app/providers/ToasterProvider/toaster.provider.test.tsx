// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ToasterProvider, { useToasterContext } from "./toaster.provider";

vi.mock("uuid", () => ({ v4: vi.fn(() => "toast-id") }));
vi.mock("~/templates/ErrorPageTemp/ErrorPageTemp", () => ({ ErrorPageTemp: () => null }));
vi.mock("~/templates/MaintancePageTemp", () => ({ MaintancePageTemp: () => null }));
vi.mock("../UserProvider/user.provider", () => ({ UserProvider: ({ children }: { children: unknown }) => children }));
vi.mock("../WalletProvider/wallet.provider", () => ({ WalletProvider: ({ children }: { children: unknown }) => children }));
vi.mock("../AppProvider/AppProvider", () => ({ AppProvider: ({ children }: { children: unknown }) => children }));
vi.mock("../TokensProvider/tokens.provider", () => ({ TokensProvider: ({ children }: { children: unknown }) => children }));
vi.mock("../ApolloProvider/apollo.provider", () => ({ ApolloProvider: ({ children }: { children: unknown }) => children }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof useToasterContext>;
function Probe() { value = useToasterContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("adds, hides and removes toast messages through context", async () => {
  await act(async () => root.render(createElement(ToasterProvider, null, createElement(Probe))));
  await act(async () => value.success("Saved", "Changes saved"));
  expect(value.messages).toMatchObject([{ unique: "toast-id", type: "success", title: "Saved", message: "Changes saved", hide: false }]);
  await act(async () => value.hideToasterMessage("toast-id"));
  expect(value.messages[0].hide).toBe(true);
  await act(async () => value.deleteToasterFromArray("toast-id"));
  expect(value.messages).toEqual([]);
});
