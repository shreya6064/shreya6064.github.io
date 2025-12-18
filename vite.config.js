import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // main site at https://username.github.io/
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        shaders: resolve(__dirname, 'shaders.html'),
        art: resolve(__dirname, 'art.html'),
        contact: resolve(__dirname, 'contact.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
