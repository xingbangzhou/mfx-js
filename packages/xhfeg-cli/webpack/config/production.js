const TerserPlugin = require('terser-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { getPaths } = require('../../utils/paths')
const paths = getPaths()

module.exports = (env, config, args) => {
  const prodConfig = {
    mode: 'production',
    devtool: false,
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    plugin: {
      clean: {
        plugin: CleanWebpackPlugin,
        args: []
      },
      copy: {
        plugin: CopyWebpackPlugin,
        args: [
          {
            patterns: [
              {
                from: paths.public.replace(/\\/g, '/'),
                to: paths.dist.replace(/\\/g, '/'),
                globOptions: {
                  ignore: ['*.DS_Store', paths.template.replace(/\\/g, '/'), paths.favicon.replace(/\\/g, '/')],
                },
                noErrorOnMissing: true
              }
            ]
          }
        ]
      }
    }
  }

  config.merge(prodConfig)

  config.optimization.minimizer('TerserPlugin').use(TerserPlugin, [
    {
      parallel: true,
      extractComments: false,
      terserOptions: {
        format: {
          comments: false
        },
        compress: {
        }
      }
    }
  ])
}
