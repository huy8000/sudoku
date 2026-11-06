import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "./",
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
      manifest: {
        name: "数独 · Sudoku",
        short_name: "数独",
        description: "500+ 精选数独题目，从入门到魔鬼难度。开源、完全免费、无广告追踪。",
        theme_color: "#faf8ef",
        background_color: "#faf8ef",
        display: "standalone",
        start_url: "./",
        scope: "./",
        icons: [
          {
            src: "./android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  // define:
  //   command === "build"
  //     ? {
  //         "global.": "({}).",
  //       }
  //     : {global: {}},
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
}));
