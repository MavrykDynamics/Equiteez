import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

installGlobals();

export default defineConfig({
  plugins: [remixCloudflareDevProxy(), remix(), tsconfigPaths(), svgr()],
  resolve: {
    alias: {},
  },
});
