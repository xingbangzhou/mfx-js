import {mfxEnv} from '../core'
import TerserPlugin from 'terser-webpack-plugin'

class Production {
  async setup() {
    const {wpChain} = mfxEnv

    wpChain?.merge({
      mode: 'production',
      devtool: 'source-map',
      performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      },
    })

    wpChain?.optimization.minimizer('TerserPlugin').use(TerserPlugin, [
      {
        extractComments: false,
        terserOptions: {
          compress: {
            passes: 2,
          },
        },
      } as any,
    ])
  }
}

export default Production
