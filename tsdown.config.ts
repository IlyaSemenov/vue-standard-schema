import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  sourcemap: true,
  exports: true,
  dts: true,
  publint: true,
  attw: true,
})
