import process from 'node:process';

import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  const isVitest = process.env.VITEST === 'true';

  return {
    application: {},
    vite: {
      plugins: isVitest
        ? []
        : [
            ElementPlus({
              format: 'esm',
            }),
          ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            target: 'http://127.0.0.1:8080',
            ws: true,
          },
          '/uploads': {
            changeOrigin: true,
            target: 'http://127.0.0.1:8080',
          },
        },
      },
    },
  };
});
