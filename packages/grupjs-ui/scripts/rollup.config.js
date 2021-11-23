import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import nodeGlobals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM'
}

const babelOptions = {
  exclude: /node_modules/,
  runtimeHelpers: true,
  extensions: ['.js', '.ts', '.tsx'],
  configFile: path.resolve(__dirname, '../../../babel.config.js'),
}

const commonjsOptions = {
  ignoreGlobal: true,
  include: /node_modules/
}

const nodeOptions = {
  extensions: ['.js', '.tsx', '.ts']
}

function onwarn(warning) {
  if (
    warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
    warning.source === 'react' &&
    warning.names.filter((identifier) => identifier !== 'useDebugValue').length === 0
  ) {
    // only warn for
    // import * as React from 'react'
    // if (__DEV__) React.useDebugValue()
    // React.useDebug not fully dce'd from prod bundle
    // in the sense that it's still imported but unused. Downgrading
    // it to a warning as a reminder to fix at some point
    console.warn(warning.message)
  } else {
    throw Error(warning.message)
  }
}

const input = './src/index.ts'

export default [
  {
    input,
    onwarn,
    output: {
      file: 'build/umd/grupjs-ui.development.js',
      format: 'umd',
      name: 'GrupJsUI',
      globals
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(nodeOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      nodeGlobals(), // Wait for https://github.com/cssinjs/jss/pull/893
      replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify('development') }),
    ]
  },
  {
    input,
    onwarn,
    output: {
      file: 'build/umd/grupjs-ui.production.min.js',
      format: 'umd',
      name: 'GrupJsUI',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(nodeOptions),
      babel(babelOptions),
      commonjs(commonjsOptions),
      nodeGlobals(), // Wait for https://github.com/cssinjs/jss/pull/893
      replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser()
    ]
  }
]
