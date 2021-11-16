const { resolveApp, getPaths, getCachePaths } = require("../../utils/paths")
const { version } = require('../../package.json')
const runtime = require('../../utils/runtime')

const gitVersion = 'noGit' // cmdSync('git rev-parse --abbrev-ref HEAD') || 'noGit'

module.exports = () => {
  const {env, config, args, grupConfigPath} = runtime.parameters
  const {entry, srcDir, dist} = getPaths()
  const isDev = env === 'development'
  const buildDependenciesConfigs = [__filename]
  if (grupConfigPath) {
    buildDependenciesConfigs.push(grupConfigPath)
  }
  const cachePaths = getCachePaths()
  const common = {
    cache: {
      version: `${version}-${gitVersion}${args.hot ? '-hot' : ''}${args.grupEnv ? '-' + args.grupEnv : ''}`,
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
        srcDir
      ],
      alias: {
        src: srcDir,
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
    infrastructureLogging: {
      level: args.progress ? 'info' : 'warn'
    },
    stats: {
      colors: true,
      preset: 'minimal',
      moduleTrace: true,
      errorDetails: true
    }
  }
  config.merge(common)

  require('./style')(env, config, args)
  require('./file')(env, config, args)
  require('./module')(env, config, args)
  require('./plugin')(env, config, args)
  require('./experiments')(env, config, args)
}
