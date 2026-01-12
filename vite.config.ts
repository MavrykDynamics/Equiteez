import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";
// import { visualizer } from 'rollup-plugin-visualizer';

installGlobals();

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({ ssr: true }),
    tsconfigPaths(),
    svgr(),
    nodePolyfills({ exclude: ["fs", "util"] }),
    VitePWA({
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
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // caches your built client assets
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
      },
      devOptions: {
        enabled: true,
      },
    }),
    // visualizer({ open: false }),
  ],
  // DO NOT PUT SECRETS HERE !
  define: {
    "process.env": process.env,
  },
  build: {
    minify: "esbuild",
    cssMinify: true,
    ssr: true,
    rollupOptions: {
      plugins: [
        // visualizer({
        //   filename: 'stats.html',
        //   template: 'treemap', // or 'sunburst', 'network'
        // }),
      ],
    },
  },
});
