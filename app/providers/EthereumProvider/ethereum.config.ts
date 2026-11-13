import {
  createConfig,
  createStorage,
  http,
  type CreateConnectorFn,
  type Transport,
} from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

import {
  INTENTS_SOURCE_CHAINS,
  INTENTS_SOURCE_RPC_URLS,
} from "~/consts/intents";
import { USDT_BRIDGE } from "~/consts/usdtBridge";

export const ETHEREUM_CHAIN = arbitrumSepolia;
export const ETHEREUM_RPC_URL =
  process.env.ETHEREUM_RPC_URL?.trim() ||
  "https://sepolia-rollup.arbitrum.io/rpc";
export const WALLETCONNECT_PROJECT_ID =
  process.env.WALLETCONNECT_PROJECT_ID?.trim() ||
  "a41a5ab5fcd42d5ce23e73f62de5beed";

export const ETHEREUM_DEPOSIT_TOKEN = USDT_BRIDGE.sourceToken;

export const ETHEREUM_DEPOSIT_ASSET_SLUG = `eip155:${arbitrumSepolia.id}:${ETHEREUM_DEPOSIT_TOKEN.address}`;

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

  // The direct bridge chain stays first (default); 1Click source chains follow.
  // Wrong-network checks for the direct bridge still compare to ETHEREUM_CHAIN.
  const intentChains = INTENTS_SOURCE_CHAINS.filter(
    (chain) => chain.id !== arbitrumSepolia.id
  );
  return createConfig({
    chains: [arbitrumSepolia, ...intentChains],
    connectors,
    ssr: true,
    storage: createStorage({
      key: "equiteez.ethereum",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    }),
    transports: {
      [arbitrumSepolia.id]: http(ETHEREUM_RPC_URL),
      ...(Object.fromEntries(
        intentChains.map((chain) => [
          chain.id,
          http(INTENTS_SOURCE_RPC_URLS[chain.id]),
        ])
      ) as Record<(typeof intentChains)[number]["id"], Transport>),
    },
  });
}
