import {defineConfig} from "tsup"

export default defineConfig({
  entry: [
    "src/server/index.ts",
    "src/helpers/server/filter.ts",
    "src/helpers/server/stream.ts",
    "src/model/index.ts",
  ],
  dts: true,
  sourcemap: true,
  clean: true,
  format: ["esm"],
  external: ["typescript", "effect", "convex", "convex-helpers"],
})
