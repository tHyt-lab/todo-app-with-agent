/// <reference types="vitest" />

import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tanstackRouter()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.d.ts",
        "dist/",
        "build/",
        "coverage/",
      ],
    },
  },
});
