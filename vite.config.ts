import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EduBridge',
        short_name: 'EduBridge',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        description: 'A modern learning platform for video playlists and coding exercises',
        icons: [
          {
            src: '/icons/edulogo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/edulogo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
  base:process.env.VITE_BASE_PATH || "/watchtracker",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
