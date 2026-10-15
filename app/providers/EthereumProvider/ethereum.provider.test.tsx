// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EthereumProvider, useEthereumContext } from "./ethereum.provider";
const mocks = vi.hoisted(() => ({ account: { address: "0xabc", chainId: 11155111, connector: null, isConnected: true, isReconnecting: false } }));
vi.mock("wagmi", () => ({ WagmiProvider: ({ children }: { children: ReactNode }) => children, useAccount: () => mocks.account, useConnectors: () => ["injected"] }));
vi.mock("./ethereum.config", () => ({ createEthereumConfig: () => ({}), ETHEREUM_CHAIN: { id: 11155111 } }));
vi.mock("./hooks/useEthereumWalletActions", () => ({ useEthereumWalletActions: () => ({ connect: vi.fn(), signOut: vi.fn(), switchNetwork: vi.fn(), handleConnectWallet: vi.fn(), handleClose: vi.fn(), isWalletModalOpen: false, isConnecting: false, error: null }) }));
vi.mock("./hooks/useEthereumDepositAsset", () => ({ useEthereumDepositAsset: () => ({ balance: "1", refreshBalance: vi.fn() }) }));
vi.mock("./hooks/useUsdtBridge", () => ({ useUsdtBridge: () => ({ status: "idle" }) }));
let root: ReturnType<typeof createRoot>; let value: ReturnType<typeof useEthereumContext>;
function Probe() { value = useEthereumContext(); return null; }
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); root = createRoot(document.createElement("div")); });
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
it("exposes connected wallet, deposit asset and bridge state", async () => { await act(async () => root.render(createElement(EthereumProvider, null, createElement(Probe)))); expect(value).toMatchObject({ userAddress: "0xabc", chainId: 11155111, isConnected: true, isWrongNetwork: false, balance: "1", bridge: { status: "idle" }, walletSelection: { connectors: ["injected"], isOpen: false } }); });
