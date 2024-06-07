import {mfxConfig, mfxEnv} from '../core'
import {Configuration} from 'webpack'
import wpChain from './chain'

export default class WpCommon {
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
    const cfg = mfxConfig.target
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
      index: mfxConfig.entry,
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
    const {assetsDir} = mfxConfig

    return {
      clean: true,
      path: mfxConfig.dist,
      publicPath: 'auto',
      filename: `${assetsDir}/js/[name].[contenthash:8].js`,
      assetModuleFilename: `${assetsDir}/[name].[contenthash:8][ext][query]`,
      environment,
    }
  }

  get resolve(): Configuration['resolve'] {
    return {
      modules: ['node_modules', mfxEnv.resolve('node_modules'), mfxEnv.src],
      alias: {
        src: mfxEnv.src,
        ...mfxConfig.alias,
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
        '.svga',
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
