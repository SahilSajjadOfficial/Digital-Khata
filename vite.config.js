import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include the exact names of your favicons and apple touch icon fallback
      includeAssets: ['Digital Khata (1).ico', 'Digital Khata.png'], 
      manifest: {
        name: 'Digital Khata',
        short_name: 'Khata',
        description: 'Your personal digital ledger for shop management.',
        theme_color: '#121212', 
        background_color: '#f0f2f5', 
        display: 'standalone', 
        icons: [
          {
            // Matching your 192 icon
            src: 'Digital Khata192.ico',
            sizes: '192x192',
            type: 'image/x-icon' 
          },
          {
            // Matching your main PNG for the 512 size
            src: 'Digital Khata.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});