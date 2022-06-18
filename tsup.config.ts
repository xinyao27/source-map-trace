import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: ['./src/index.ts'],
  clean: true,
  dts: true,
  format: ['cjs'],
  minify: !options.watch,
}))
