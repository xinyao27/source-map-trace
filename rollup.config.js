import path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

const name = 'source-map-trace'
const globalName = 'SourceMapTrace'
const packageFormats = ['esm', 'cjs', 'umd']
const configs = {
  esm: {
    format: `es`
  },
  cjs: {
    format: `cjs`
  },
  umd: {
    format: `umd`
  }
}
const tsPlugin = ts({
  check: process.env.NODE_ENV === 'production',
  tsconfig: path.resolve(__dirname, 'tsconfig.json')
})
const extensions = ['.js', '.ts']
const commonjsOptions = {
  ignoreGlobal: true,
  include: /node_modules/
}

function createConfig(isProduction = false) {
  const input = path.resolve(__dirname, 'src/index.ts')

  const output = packageFormats.map(format => {
    const target = {
      file: path.resolve(
        `dist/${name}.${format}${isProduction ? '.min' : ''}.js`
      ),
      format: configs[format].format
    }
    if (format === 'umd') {
      target.name = globalName
    }
    return target
  })

  const plugins = [commonjs(commonjsOptions), tsPlugin, resolve({ extensions })]
  if (isProduction) {
    plugins.push(terser())
  }

  const external = ['source-map', 'fs']

  return {
    input,
    output,
    plugins,
    external
  }
}

const NODE_ENV = process.env.NODE_ENV

const packageConfigs = [createConfig()]
if (NODE_ENV === 'production') packageConfigs.push(createConfig(true))

export default packageConfigs
