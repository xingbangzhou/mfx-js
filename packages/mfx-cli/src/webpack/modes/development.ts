import {mfxConfig, mfxEnv} from 'src/core'
import {Configuration} from 'webpack'
import wpChain from '../chain'

export default class WpDevelopment {
  constructor() {}

  async setup() {
    const {devServer} = this
    const config: Configuration = {
      mode: 'development',
      devtool: 'inline-source-map',
      devServer,
      optimization: {
        chunkIds: 'deterministic',
      },
    }

    wpChain.merge(config)
  }

  get devServer(): Configuration['devServer'] {
    const config = {
      host: '0.0.0.0',
      allowedHosts: ['all'],
      historyApiFallback: true,
      // compress: true,
      static: [
        // 输出静态文件
        {
          directory: mfxEnv.public,
          publicPath: '/',
        },
      ],
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      client: {
        overlay: {
          errors: true,
          warnings: true,
        },
      },
      open: true,
      ...mfxConfig.devServer,
    }

    return config
  }
}
