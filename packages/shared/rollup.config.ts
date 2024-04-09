import type { InputOptions, OutputOptions, RollupOptions } from 'rollup'

import typescriptPlugin from '@rollup/plugin-typescript'
import terserPlugin from '@rollup/plugin-terser'
import dtsPlugin from 'rollup-plugin-dts'

const outputPath = 'dist/entry'
const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  plugins: [typescriptPlugin()]
}
const iifeCommonOutputOptions: OutputOptions = {
  name: 'entry'
}

const config: RollupOptions[] = [
  {
    ...commonInputOptions,
    output: [
      {
        file: `${outputPath}.esm.js`,
        format: 'esm'
      }
    ]
  },
  {
    ...commonInputOptions,
    output: [
      {
        ...iifeCommonOutputOptions,
        file: `${outputPath}.js`,
        format: 'iife'
      },
      {
        ...iifeCommonOutputOptions,
        file: `${outputPath}.min.js`,
        format: 'iife',
        plugins: [terserPlugin()]
      }
    ]
  },
  {
    ...commonInputOptions,
    output: [
      {
        file: `${outputPath}.cjs.js`,
        format: 'cjs'
      }
    ]
  },
  {
    ...commonInputOptions,
    plugins: [commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        file: `${outputPath}.d.ts`,
        format: 'esm'
      }
    ]
  }
]

export default config