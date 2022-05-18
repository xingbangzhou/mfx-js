const { configure, resolveApp, getCacheFiles } = require('./configure')
const { version } = require('../package.json')

const setup = async () => {
  const { env, options, wpConfig, srcDir, distDir, entry, remoteConfigFile } = configure
  const { livEnv } = options
  const cacheFiles = getCacheFiles()

  const isDev = env === 'development'
  const buildDependenciesConfigs = [__filename]
  if (remoteConfigFile) {
    buildDependenciesConfigs.push(remoteConfigFile)
  }
  // 基础配置
  wpConfig.merge({
    cache: {
      version: `${version}-${livEnv}`,
      type: 'filesystem',
      cacheDirectory: cacheFiles.webpack, //默认路径是 node_modules/.cache/webpack
      // 缓存依赖，当缓存依赖修改时，缓存失效
      buildDependencies: {
        // 将你的配置添加依赖，更改配置时，使得缓存失效
        config: buildDependenciesConfigs
      }
    },
    optimization: {
      chunkIds: 'named',
      minimize: !isDev,
      emitOnErrors: true
    },
    entry: {
      index: entry
    },
    output: {
      path: distDir,
      publicPath: 'auto',
      filename: 'static/js/[name].[contenthash:8].js',
      assetModuleFilename: 'static/asset/[name].[contenthash:8][ext][query]',
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
        '.svg'
      ]
    },
    experiments: {
      backCompat: true,
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true
    }
  })
  // 扩展配置
  require('./css').setup()
  require('./file').setup()
  require('./module').setup()
  require('./plugin').setup()
}

module.exports = {
  setup
}
