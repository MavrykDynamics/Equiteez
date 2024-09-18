import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import { visualizer } from 'rollup-plugin-visualizer';

installGlobals();

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix({ ssr: true }),
    tsconfigPaths(),
    svgr(),
    nodePolyfills({ exclude: ['fs', 'util'] }),
    // visualizer({ open: false }),
  ],
  define: {
    'process.env': process.env,
  },
  build: {
    minify: 'esbuild',
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
