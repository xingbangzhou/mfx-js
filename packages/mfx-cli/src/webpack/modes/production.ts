import TerserPlugin from 'terser-webpack-plugin'
import wpChain from '../chain'

export default class WpProduction {
  constructor() {}

  async setup() {
    wpChain.merge({
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
          format: {
            comments: false,
          },
        },
      },
    ] as any)
  }
}
