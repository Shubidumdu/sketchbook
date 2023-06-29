import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.hdr'],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./global.scss";`,
      },
    },
  },
});
