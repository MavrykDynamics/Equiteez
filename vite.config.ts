import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { RemixVitePWA } from "@vite-pwa/remix";

installGlobals();

const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA();

/**
 * The only variables inlined into the bundles as process.env. Everything else
 * in the build environment stays out, so a server secret that ends up there
 * (e.g. KYC_REGISTRAR_PRIVATE_KEY set as a Pages build variable) can never
 * reach the browser. Server-only secrets are read from the Cloudflare
 * context (context.cloudflare.env) at runtime instead.
 */
const PUBLIC_ENV_KEYS = [
  "NODE_ENV",
  "API_URL",
  "BASE_URL",
  "ETHEREUM_RPC_URL",
  "GA_TRACKING_ID",
  "GOOGLE_MAPS_API_KEY",
  "GRAPHQL_API",
  "GRAPHQL_WS_API",
  "INDEXER_ALLOWLIST_BYPASS_SECRET",
  "MAVRYK_WALLET_API_URL",
  "REACT_APP_ENV",
  "REACT_APP_MAINTANCE_MODE",
  "REACT_APP_NAME",
  "RWA_API",
  "RWA_SERVICES_API",
  "TOKENS_METADATA_API",
  "WALLETCONNECT_PROJECT_ID",
  "DYNAMIC_ENVIRONMENT_ID",
  "DYNAMIC_WALLET_ENABLED",
  "DYNAMIC_DIRECT_ENABLED",
  "WALLET_CHOICE_ENABLED",
  "KYC_CONTRACT",
  "KYC_SELF_SERVICE_ENABLED",
];

/** .env files, overridden by the real environment (CI, Pages build vars) */
const getPublicEnv = (mode: string) => {
  const env: Record<string, string | undefined> = {
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  };
  env.NODE_ENV ??= mode === "production" ? "production" : "development";

  return Object.fromEntries(
    PUBLIC_ENV_KEYS.flatMap((key) =>
      env[key] === undefined ? [] : [[key, env[key]]]
    )
  );
};

export default defineConfig(({ mode }) => ({
  plugins: [
    remixCloudflareDevProxy(),

    remix({
      ssr: true,
      presets: [RemixPWAPreset()],
    }),

    tsconfigPaths(),
    svgr(),
    nodePolyfills({ exclude: ["fs", "util"] }),

    RemixVitePWAPlugin({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "manifest.webmanifest",
        "icons/*.png",
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      manifest: {
        name: "Equiteez",
        short_name: "Equiteez",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0b1220",
        theme_color: "#0b1220",
        icons: [
          { src: "/icons/logo-96.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/logo-450.png", sizes: "450x450", type: "image/png" },
          {
            src: "/icons/logo-450-maskable.png",
            sizes: "450",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  define: { "process.env": getPublicEnv(mode) },
}));
