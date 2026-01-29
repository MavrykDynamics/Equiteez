import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { RemixVitePWA } from "@vite-pwa/remix";

installGlobals();

const { RemixVitePWAPlugin, RemixPWAPreset } = RemixVitePWA();

export default defineConfig({
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
      devOptions: { enabled: true },
    }),
  ],
  define: { "process.env": process.env },
});
