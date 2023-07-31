import { resolve } from 'path';
import { BuildOptions, defineConfig } from 'vite';
import { readdir } from 'fs/promises';

type RollupOptions = BuildOptions['rollupOptions'];
type PageMap = { [key: string]: string };

const getPageNames = async () => {
  const files = await readdir('pages', { withFileTypes: true });
  return files.filter((file) => file.isDirectory()).map((file) => file.name);
};

const pageMap: PageMap = {};

export default defineConfig(async () => {
  const pages = await getPageNames();
  const rollupOptions: RollupOptions = {
    input: {
      main: resolve(__dirname, 'index.html'),
      ...pages.reduce((acc, page) => {
        acc[page] = resolve(__dirname, `pages/${page}/index.html`);
        return acc;
      }, pageMap),
    },
  };

  return {
    define: {
      pageNames: pages,
    },
    build: {
      rollupOptions,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./global.scss";`,
        },
      },
    },
  };
});
