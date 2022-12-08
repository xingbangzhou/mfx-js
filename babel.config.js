const path = require('path')

// function resolveAliasPath(relativeToBabelConf) {
//   const resolvedPath = path.relative(process.cwd(), path.resolve(__dirname, relativeToBabelConf))
//   return `./${resolvedPath.replace('\\', '/')}`
// }

// const defaultAlias = {
//   '@mco/utils': resolveAliasPath('./packages/mco-utils/src'),
// }

module.exports = function (api) {
  const useESModules = api.env(['legacy', 'modern', 'stable', 'rollup'])

  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        browserslistEnv: process.env.BABEL_ENV || process.env.NODE_ENV,
        debug: process.env.MCO_BUILD_VERBOSE === 'true',
        modules: useESModules ? false : 'commonjs',
        shippedProposals: api.env('modern'),
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ]

  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules,
        version: '^7.16.4',
      },
    ],
  ]

  if (process.env.NODE_ENV === 'production') {
  }

  return {
    assumptions: {
      noDocumentAll: true,
    },
    presets,
    plugins,
    ignore: [/@babel[\\|/]runtime/], // Fix a Windows issue.
    overrides: [],
  }
}
