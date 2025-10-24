import {defineConfig} from "tsup"

export default defineConfig({
  entry: [
    "src/server/index.ts",
    "src/helpers/server/filter.ts",
    "src/helpers/server/stream.ts",
    "src/model/index.ts",
  ],
  dts: {
    resolve: true,
    only: true,
  },
  sourcemap: true,
  clean: true,
  format: ["esm"],
  external: ["effect", "convex", "convex-helpers"],
})
