import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
   plugins: [react(), tailwindcss()],
   resolve: {
      alias: {
         "@": path.resolve(import.meta.dirname, "./src"),
      },
   },
   server: {
      proxy: {
         "/api": {
            target: process.env.VITE_DEV_PROXY_TARGET ?? "http://localhost:5000",
            changeOrigin: false,
         },
      },
   },
   build: {
      target: "es2022",
      rollupOptions: {
         output: {
            manualChunks(id) {
               if (!id.includes("node_modules")) return;
               if (id.includes("framer-motion") || id.includes("/motion/")) return "motion";
               if (id.includes("lucide-react")) return "icons";
               if (id.includes("react") || id.includes("scheduler")) return "react";
               if (id.includes("@tanstack")) return "router";
               return "vendor";
            },
         },
      },
   },
});
