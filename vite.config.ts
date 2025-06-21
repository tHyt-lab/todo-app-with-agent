/// <reference types="vitest" />

import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { readFileSync } from "fs";

// package.jsonからバージョンを読み取り
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// GitHub Pagesベースパス設定（保守性のため定数化）
const GITHUB_PAGES_BASE_PATH = '/todo-app-with-agent/';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? GITHUB_PAGES_BASE_PATH : '/',
    plugins: [react(), tanstackRouter()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      watch: false,
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
  };
});
