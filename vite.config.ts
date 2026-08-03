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
    minify: "terser",
    terserOptions: {
      compress: {
        // Strip all console logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove dead code
        dead_code: true,
        // Inline small functions
        passes: 3,
      },
      mangle: {
        // Mangle all variable names to obfuscate
        toplevel: true,
        // Protect specific names
        reserved: ["Convex", "React"],
      },
      // Remove all comments
      format: {
        comments: false,
      },
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
