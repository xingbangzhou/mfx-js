const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const FederatedStatsPlugin = require('webpack-federated-stats-plugin')
const webpackbar = require('webpackbar')
const ESLintPlugin = require('eslint-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')

const { resolveApp, cliEnv } = require('.')

const setup = function () {
  const { env, options, wpConfig } = cliEnv
  const isDev = env === 'development'
  const { appDir, srcDir, favicon, template, cacheFiles } = cliEnv
  const { livEnv, progress } = options

  const plugin = {
    env: {
      plugin: webpack.EnvironmentPlugin,
      args: [
        {
          MODE_ENV: env,
          LIV_ENV: livEnv
        }
      ]
    },
    clean: {plugin: CleanWebpackPlugin, args: []},
    html: {
      plugin: HtmlWebpackPlugin,
      args: [
        {
          title: 'EMP',
          template: template,
          favicon: favicon,
          files: {
            css: [],
            js: [],
          },
          minify: !isDev
            ? {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            : false
        }
      ]
    },
    mf: {
      plugin: ModuleFederationPlugin,
      args: [{}],
    }
  }

  // progress
  if (progress) {
    plugin.progress = {
      plugin: webpackbar,
      args: [
        {
          color: 'green',
          profile: true
        }
      ]
    }
  }
  // TS ForkTsCheckerWebpackPlugin
  const tsconfig = resolveApp('tsconfig.json')
  if (fs.existsSync(tsconfig)) {
    plugin.ts = {
      plugin: ForkTsCheckerWebpackPlugin,
      args: [
        {
          async: isDev, // true dev环境下部分错误验证通过
          eslint: {
            enabled: true,
            files: `${srcDir}/**/*.{ts,tsx,js,jsx}`,
          },
          typescript: {
            configFile: tsconfig,
            profile: false,
            typescriptPath: require.resolve('typescript'),
          }
        }
      ]
    }
  } else {
    plugin.eslint = {
      plugin: ESLintPlugin,
      args: [
        {
          extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
          context: appDir,
          // overrideConfigFile: resolveApp('.eslintrc.js'),
          files: ['src/**/*.{ts,tsx,js,jsx}'],
          // eslintPath: require.resolve('eslint'),
          cache: true,
          cacheLocation: cacheFiles.eslint,
          fix: true,
          threads: true,
          lintDirtyModulesOnly: false
        }
      ]
    }
  }

  wpConfig.merge({
    plugin
  })
}

module.exports = {
  setup
}
