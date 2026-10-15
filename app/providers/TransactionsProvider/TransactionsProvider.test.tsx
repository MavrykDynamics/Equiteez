// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TransactionsProvider, useTransactionsContext } from "./TransactionsProvider";
const mocks = vi.hoisted(() => ({ invalidate: vi.fn() }));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({ useAuthContext: () => ({ isAuthenticated: false }) }));
vi.mock("~/providers/UserProvider/user.provider", () => ({ useUserContext: () => ({ userAddress: null }) }));
vi.mock("~/providers/NotificationsProvider/NotificationsProvider", () => ({ useNotificationsContext: () => ({ status: "idle", wallet: null }) }));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({ useToasterContext: () => ({ success: vi.fn(), warning: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: (...args: unknown[]) => mocks.invalidate(...args) }) }));
vi.mock("~/providers/NotificationsProvider/hooks/useNotifierEvent", () => ({ useNotifierEvent: vi.fn() }));
vi.mock("~/lib/apis/rwa/bridge/bridge", () => ({ fetchBridgeDeposits: vi.fn() }));
vi.mock("./bridgeWidgetRecovery", () => ({ recoverBridgeWidgets: vi.fn() }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof useTransactionsContext>;
function Probe() { value = useTransactionsContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("exposes an empty safe snapshot without an authenticated account", async () => { await act(async () => root.render(createElement(TransactionsProvider, null, createElement(Probe)))); expect(value).toMatchObject({ account: null, session: null, transactions: new Map(), storageError: null, reconciliationError: null }); expect(() => value.refresh()).not.toThrow(); expect(() => value.publish({ operationId: "op", account: "wallet", sourceHashes: [] } as never)).not.toThrow(); });
