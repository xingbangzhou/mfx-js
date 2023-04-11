import {mfxEnv} from '../core'

class Development {
  async setup() {
    const {wpChain} = mfxEnv
    wpChain?.merge({
      mode: 'development',
      optimization: {
        usedExports: true,
      },
      devtool: 'eval',
      devServer: this.devServer,
    })
  }
  /**
   * dev server
   */
  private get devServer() {
    const {options} = mfxEnv

    return {
      port: 8000,
      historyApiFallback: true,
      hot: options?.hot,
      open: options?.open,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      static: [
        {
          directory: mfxEnv.public,
          publicPath: '/',
        },
      ],
    }
  }
}

export default Development
