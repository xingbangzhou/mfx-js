const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const FederatedStatsPlugin = require('webpack-federated-stats-plugin')

const { getPaths } = require('../../utils/paths')
const paths = getPaths()

module.exports = (env, config, { grupEnv }) => {
  const isDev = env === 'development'

  const plugins = {
    plugin: {
      env: {
        plugin: webpack.EnvironmentPlugin,
        args: [
          {
            MODE_ENV: env,
            GRUP_ENV: grupEnv
          }
        ]
      },
      html: {
        plugin: HtmlWebpackPlugin,
        args: [
          {
            title: 'GRUP',
            template: paths.template,
            favicon: paths.favicon,
            chunks: ['index'],
            files: {
              css: [],
              js: [],
            },
            minify: !isDev ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            } : false
          }
        ]
      },
      mf: {
        plugin: ModuleFederationPlugin,
        args: [{filename: 'grup.js'}]
      },
      mfStats: {
        plugin: FederatedStatsPlugin,
        args: [{filename: 'grup.json'}]
      },
      progress: {
        plugin: webpack.ProgressPlugin,
        args: []
      }
    }
  }

  config.merge(plugins)
}
