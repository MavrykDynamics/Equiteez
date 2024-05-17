import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

installGlobals();

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy(),
    remix(),
    tsconfigPaths(),
    svgr(),
    nodePolyfills({ exclude: ['fs', 'util'] }),
  ],
  resolve: {
    alias: {},
  },
});
