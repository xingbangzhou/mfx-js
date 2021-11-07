const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const { resolveApp, getPaths, cachePaths } = require('../../utils/paths')
const paths = getPaths()
const fs = require('fs')

module.exports = (env, config, { afegEnv }) => {
  const isDev = env === 'development'
  const pluginConfig = {
    plugin: {
      env: {
        plugin: webpack.EnvironmentPlugin,
        args: [
          {
            MODE_ENV: env,
            AFEG_ENV: afegEnv
          }
        ]
      },
      html: {
        plugin: HtmlWebpackPlugin,
        args: [
          {
            title: 'AFEG',
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
      friendly: {
        plugin: FriendlyErrorsWebpackPlugin,
        args: [{}]
      },
      progress: {
        plugin: webpack.ProgressPlugin,
        args: []
      }
    }
  }

  const tsconfig = resolveApp('tsconfig.json')
  if (fs.existsSync(tsconfig)) {
    pluginConfig.plugin.ts = {
      plugin: ForkTsCheckerWebpackPlugin,
      args: [
        {
          async: isDev, // true dev环境下部分错误验证通过
          eslint: {
            enabled: true,
            files: `${paths.appSrc}/**/*.{ts,tsx,js,jsx}`
          },
          typescript: {
            configFile: tsconfig,
            profile: false,
            typescriptPath: require.resolve('typescript')
          }
        }
      ]
    }
  } else {
    pluginConfig.plugin.eslint = {
      plugin: ESLintPlugin,
      args: [
        {
          extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
          context: paths.appRoot,
          files: ['src/**/*.{ts,tsx,js,jsx}'],
          cache: true,
          cacheLocation: cachePaths.eslint,
          fix: true,
          threads: true,
          lintDirtyModulesOnly: false
        }
      ]
    }
  }

  config.merge(pluginConfig)
}
