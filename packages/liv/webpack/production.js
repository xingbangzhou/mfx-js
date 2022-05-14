const TerserPlugin = require('terser-webpack-plugin')
const { cliEnv } = require('.')

const setup = function () {
  const { wpConfig } = cliEnv

  wpConfig.merge({
    mode: 'production',
    devtool: 'source-map',
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  })

  wpConfig.optimization.minimizer('TerserPlugin').use(TerserPlugin, [
    {
      extractComments: false,
      terserOptions: {
        compress: {
          passes: 2
        }
      }
    }
  ])
}

module.exports = {
  setup
}
