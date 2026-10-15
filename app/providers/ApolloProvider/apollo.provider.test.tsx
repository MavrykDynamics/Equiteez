// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ApolloProvider, useApolloContext } from "./apollo.provider";
const mocks = vi.hoisted(() => ({ bug: vi.fn() }));
vi.mock("@apollo/client/index", () => ({ ApolloClient: class { constructor(_: unknown) {} }, InMemoryCache: class {}, from: (x: unknown) => x, ApolloProvider: ({ children }: { children: ReactNode }) => children, ApolloError: class {} }));
vi.mock("@apollo/client/dev/index", () => ({ loadErrorMessages: vi.fn(), loadDevMessages: vi.fn() }));
vi.mock("@apollo/client/link/error", () => ({ onError: () => ({}) }));
vi.mock("@apollo/client/link/subscriptions", () => ({ GraphQLWsLink: class { constructor(_: unknown) {} } }));
vi.mock("graphql-ws", () => ({ createClient: () => ({}) }));
vi.mock("./apollo.config", () => ({ httpLink: {}, retryLink: {}, splitLink: () => ({}) }));
vi.mock("../AppProvider/AppProvider", () => ({ useAppContext: () => ({ IS_WEB: false }) }));
vi.mock("../ToasterProvider/toaster.provider", () => ({ useToasterContext: () => ({ bug: mocks.bug }) }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof useApolloContext>;
function Probe() { value = useApolloContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("provides an Apollo client and ignores abort errors in its error handler", async () => { await act(async () => root.render(createElement(ApolloProvider, null, createElement(Probe)))); expect(value.apolloClient).toBeDefined(); expect(() => value.handleApolloError({ networkError: { name: "AbortError" } } as never, "query")).not.toThrow(); });
