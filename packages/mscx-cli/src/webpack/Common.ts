import {mscxEnv} from '../base'
import {Configuration} from 'webpack'

const {version} = require('../../package.json')

class Common {
  async setup() {
    const {wpChain} = mscxEnv

    wpChain?.merge({
      cache: this.cache,
      optimization: this.optimization,
      entry: this.entry,
      output: this.output,
      resolve: this.resolve,
      experiments: this.experiments,
    })
  }

  private get cache(): Configuration['cache'] {
    const {options, cacheFiles, conf} = mscxEnv

    const buildDependenciesConfigs = [__filename]
    if (conf) {
      buildDependenciesConfigs.push(conf)
    }

    return {
      version: `${version}-${options?.env}`,
      type: 'filesystem',
      cacheDirectory: cacheFiles.webpack, //默认路径是 node_modules/.cache/webpack
      // 缓存依赖，当缓存依赖修改时，缓存失效
      buildDependencies: {
        // 将你的配置添加依赖，更改配置时，使得缓存失效
        config: buildDependenciesConfigs,
      },
    }
  }

  private get optimization(): Configuration['optimization'] {
    const {isDev} = mscxEnv

    return {
      chunkIds: 'named',
      minimize: !isDev,
      emitOnErrors: true,
    }
  }

  private get entry(): Configuration['entry'] {
    const {entry} = mscxEnv

    return (
      entry && {
        index: entry,
      }
    )
  }

  private get output(): Configuration['output'] {
    const {dist} = mscxEnv

    return {
      path: dist,
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
        module: false,
      },
    }
  }

  private get resolve(): Configuration['resolve'] {
    const {src = ''} = mscxEnv

    return {
      modules: ['node_modules', mscxEnv.resolve('node_modules'), src],
      alias: {
        src: src,
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
      ],
    }
  }

  private get experiments(): Configuration['experiments'] {
    return {
      backCompat: true,
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    }
  }
}

export default Common
