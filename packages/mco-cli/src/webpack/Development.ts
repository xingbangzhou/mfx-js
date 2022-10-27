import {mcoEnv} from 'src/base'

class Development {
  async setup() {
    const {wpChain} = mcoEnv
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
    const {options} = mcoEnv

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
          directory: mcoEnv.public,
          publicPath: '/',
        },
      ],
    }
  }
}

export default Development
