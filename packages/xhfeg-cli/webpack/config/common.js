const { resolveApp, getPaths, cachePaths } = require("../../utils/paths")
const { cmdSync } = require('../../utils/cli')
const { version } = require('../../package.json')

const gitVersion = 'noGit' // cmdSync('git rev-parse --abbrev-ref HEAD') || 'noGit'

module.exports = (env, config, args, xhConfigPath) => {
  const { entry, appSrc, dist } = getPaths()
  const isDev = env === 'development'
  const buildDependenciesConfigs = [__filename]
  if (xhConfigPath) {
    buildDependenciesConfigs.push(xhConfigPath)
  }
  const commonConfig = {
    cache: {
      version: `${version}-${gitVersion}${args.hot ? '-hot' : ''}${args.xhEnv ? '-' + args.xhEnv : ''}`,
      type: 'filesystem',
      cacheDirectory: cachePaths.webpack, //默认路径是 node_modules/.cache/webpack
      // 缓存依赖，当缓存依赖修改时，缓存失效
      buildDependencies: {
        // 将你的配置添加依赖，更改配置时，使得缓存失效
        config: buildDependenciesConfigs,
      },
    },
    optimization: {
      chunkIds: 'named',
      minimize: !isDev
    },
    entry: {
      index: entry
    },
    watchOptions: {
      ignored: ['**/.git/**', '**/node_modules/**', '**/dist/**']
    },
    output: {
      path: dist,
      filename: 'static/js/[name].[contenthash:8].js',
      assetModuleFilename: 'static/asset/[name].[contenthash:8][ext][query]',
      publicPath: 'auto',
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        forOf: false,
        dynamicImport: false,
        module: false
      }
    },
    resolve: {
      modules: [
        'node_modules',
        resolveApp('node_modules'),
        appSrc
      ],
      alias: {
        src: appSrc,
      },
      extensions: [
        '.js',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.css',
        '.less',
        '.scss',
        '.sass',
        '.json',
        '.wasm',
        '.vue',
        '.svg',
        '.svga'
      ]
    },
    stats: 'errors-warnings'
  }
  config.merge(commonConfig)

  require('./style')(env, config, args)
  require('./file')(env, config, args)
  require('./module')(env, config, args)
  require('./plugin')(env, config, args)
  require('./experiments')(env, config, args)
}
