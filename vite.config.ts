import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.CONVEX_URL": JSON.stringify(process.env.VITE_CONVEX_URL),
  },
});
