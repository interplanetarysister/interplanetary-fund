import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/interplanetary-fund-backend/",
  define: {
    "process.env.CONVEX_URL": JSON.stringify(process.env.VITE_CONVEX_URL),
  },
  build: {
    // Disable source maps — prevents code recovery from production build
    sourcemap: false,
    // Aggressive minification
    minify: "esbuild",
    esbuildOptions: {
      drop: ["console", "debugger"],
      minify: true,
      // Keep banner for copyright watermark
      legalComments: "none",
    },
    // Remove all HTML comments and whitespace
    rollupOptions: {
      output: {
        // Add copyright watermark in bundle (proves ownership if stolen)
        banner: "/* Interplanetary Fund © 2026 Michelle Rogers. All Rights Reserved. PROPRIETARY. */",
      },
    },
  },
});
