import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import nodeGlobals from 'rollup-plugin-node-globals'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

const input = './src/index.ts'
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
}

const commonjsOptions = {
  ignoreGlobal: true,
  include: /node_modules/,
}

const resolveOptions = {
  extensions: ['.js', '.tsx', '.ts'],
}

function onwarn(msg) {
  if (
    msg.code === 'UNUSED_EXTERNAL_IMPORT' &&
    msg.source === 'react' &&
    msg.names.filter(identifier => identifier !== 'useDebugValue').length === 0
  ) {
    // only warn for
    // import * as React from 'react'
    // if (__DEV__) React.useDebugValue()
    // React.useDebug not fully dce'd from prod bundle
    // in the sense that it's still imported but unused. Downgrading
    // it to a warning as a reminder to fix at some point
    console.warn(msg.message)
  } else {
    throw Error(msg.message)
  }
}

export default name => [
  {
    input,
    onwarn,
    ouput: {
      file: 'dist/index.js',
      format: 'es',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [nodeResolve(resolveOptions), commonjs(commonjsOptions), nodeGlobals(), terser()],
  },
]
