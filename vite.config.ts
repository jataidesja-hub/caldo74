import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Caldinho 74',
        short_name: 'Caldinho74',
        description: 'Painel do Cliente - Caldinho 74',
        theme_color: '#ffffff',
        icons: [
          { src: 'mx-logo-v2-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'mx-logo-v2-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'mx-logo-v2-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

