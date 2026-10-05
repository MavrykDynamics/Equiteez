import {
  createConfig,
  createStorage,
  http,
  type CreateConnectorFn,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

import { USDT_BRIDGE } from "~/consts/usdtBridge";

export const ETHEREUM_CHAIN = sepolia;
export const ETHEREUM_RPC_URL =
  process.env.ETHEREUM_RPC_URL?.trim() ||
  "https://ethereum-sepolia-rpc.publicnode.com";
export const WALLETCONNECT_PROJECT_ID =
  process.env.WALLETCONNECT_PROJECT_ID?.trim() ||
  "a41a5ab5fcd42d5ce23e73f62de5beed";

export const ETHEREUM_DEPOSIT_TOKEN = USDT_BRIDGE.sourceToken;

export const ETHEREUM_DEPOSIT_ASSET_SLUG = `eip155:${sepolia.id}:${ETHEREUM_DEPOSIT_TOKEN.address}`;

export function createEthereumConfig() {
  const connectors: CreateConnectorFn[] = [injected()];

  // WalletConnect initializes browser storage and its QR modal during setup.
  if (typeof window !== "undefined" && WALLETCONNECT_PROJECT_ID) {
    connectors.push(
      walletConnect({
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: "Equiteez",
          description: "Connect your Ethereum wallet to Equiteez",
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`],
        },
        qrModalOptions: {
          themeVariables: { "--wcm-z-index": "500" },
        },
      })
    );
  }

  return createConfig({
    chains: [sepolia],
    connectors,
    ssr: true,
    storage: createStorage({
      key: "equiteez.ethereum",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    }),
    transports: { [sepolia.id]: http(ETHEREUM_RPC_URL) },
  });
}
