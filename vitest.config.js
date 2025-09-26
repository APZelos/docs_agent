import tsConfigPaths from "vite-tsconfig-paths"
import {defineConfig} from "vitest/config"

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    environment: "edge-runtime",
    server: {deps: {inline: ["convex-test"]}},
  },
  resolve: {
    alias: {
      "@lib": "/src/server",
      "@server": "/src/server",
    },
  },
})
