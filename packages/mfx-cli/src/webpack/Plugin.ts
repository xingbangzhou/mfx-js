import {mfxEnv} from '../core'
import {EnvironmentPlugin, container} from 'webpack'
import {CleanWebpackPlugin} from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpackbar from 'webpackbar'
import fs from 'fs'
import ESLintPlugin from 'eslint-webpack-plugin'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

class Plugin {
  async setup() {
    const {wpChain, isDev, root, src, options, cacheFiles} = mfxEnv

    const plugin: Record<string, any> = {
      env: this.env,
      clean: this.clean,
      html: this.html,
      mf: this.mf,
    }
    if (options?.progress) {
      plugin.progress = {
        plugin: webpackbar,
        args: [
          {
            color: 'green',
            profile: true,
          },
        ],
      }
    }
    // TS/ESLint
    const tsconfig = mfxEnv.resolve('tsconfig.json')
    if (fs.existsSync(tsconfig)) {
      plugin.ts = {
        plugin: require.resolve('fork-ts-checker-webpack-plugin'),
        args: [
          {
            async: isDev, // true dev环境下部分错误验证通过
            eslint: {
              enabled: true,
              files: `${src}/**/*.{ts,tsx,js,jsx}`,
            },
            typescript: {
              configFile: tsconfig,
              profile: false,
              typescriptPath: require.resolve('typescript'),
            },
          },
        ],
      }
    } else {
      plugin.eslint = {
        plugin: ESLintPlugin,
        args: [
          {
            extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
            context: root,
            files: ['src/**/*.{ts,tsx,js,jsx}'],
            cache: true,
            cacheLocation: cacheFiles.eslint,
            fix: true,
            threads: true,
            lintDirtyModulesOnly: false,
          },
        ],
      }
    }
    // Analyze
    if (options?.analyze) {
      plugin.analyzer = {
        plugin: BundleAnalyzerPlugin,
        args: [
          {
            reportFilename: 'report.html',
            openAnalyzer: true,
          },
        ],
      }
    }

    wpChain?.merge({
      plugin,
    })
  }

  private get env() {
    const {mode, options} = mfxEnv

    return {
      plugin: EnvironmentPlugin,
      args: [
        {
          MODE: mode,
          MCO_ENV: options?.env,
        },
      ],
    }
  }

  private get clean() {
    return {plugin: CleanWebpackPlugin, args: []}
  }

  private get html() {
    const {template, favicon, isDev} = mfxEnv

    return {
      plugin: HtmlWebpackPlugin,
      args: [
        {
          title: 'MCO',
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
                minifyURLs: true,
              }
            : false,
        },
      ],
    }
  }

  private get mf() {
    return {
      plugin: container.ModuleFederationPlugin,
      args: [{}],
    }
  }
}

export default Plugin
