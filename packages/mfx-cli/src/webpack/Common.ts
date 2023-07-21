import {mfxConfig, mfxEnv} from 'src/core'
import {Configuration} from 'webpack'
import wpChain from './chain'

export default class WPCommon {
  constructor() {}

  async setup() {
    const {target, cache, entry, output, resolve, experiments, stats} = this

    wpChain.merge({
      target,
      cache,
      entry,
      output,
      resolve,
      experiments,
      stats,
    })
  }

  get target(): Configuration['target'] {
    const cfg = mfxConfig.build?.target || 'es5'
    return ['web'].concat(cfg)
  }

  get cache(): Configuration['cache'] {
    const buildDependenciesConfigs = [__filename]
    if (mfxConfig.configFile) {
      buildDependenciesConfigs.push(mfxConfig.configFile)
    }

    const name = `${mfxEnv.mode}-${mfxEnv.appPackage?.version}-${mfxEnv.options?.env}`

    return {
      name: name,
      type: 'filesystem',
      cacheDirectory: mfxEnv.cacheDirRealPath,
      buildDependencies: {
        config: buildDependenciesConfigs,
      },
    }
  }

  get entry(): Configuration['entry'] {
    return {
      index: mfxConfig.build?.entry || mfxEnv.defaultEntry,
    }
  }

  get output(): Configuration['output'] {
    const environment = {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      forOf: false,
      dynamicImport: false,
      module: false,
    }

    return {
      clean: true,
      path: mfxConfig.build?.dist || mfxEnv.defultDist,
      publicPath: 'auto',
      filename: 'static/js/[name].[contenthash:8].js',
      assetModuleFilename: 'static/asset/[name].[contenthash:8][ext][query]',
      environment,
    }
  }

  get resolve(): Configuration['resolve'] {
    return {
      modules: ['node_modules', mfxEnv.resolve('node_modules'), mfxEnv.src],
      alias: {
        src: mfxEnv.src,
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

  get experiments(): Configuration['experiments'] {
    return {
      topLevelAwait: true,
      backCompat: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    }
  }

  get stats(): Configuration['stats'] {
    return {
      preset: 'errors-warnings',
    }
  }
}
