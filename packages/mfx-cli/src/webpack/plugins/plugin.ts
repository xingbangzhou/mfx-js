import {mfxConfig, mfxEnv} from 'src/core'
import Dotenv from 'dotenv-webpack'
import webpack, {container} from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import fs from 'fs-extra'
import wpChain from '../chain'

export default class WpPlugin {
  constructor() {}

  async setup() {
    const plugins: Record<string, any> = {
      dotenv: this.dotenv,
      define: this.define,
      html: this.html,
      mf: this.mf,
    }
    // 打包进度条
    if (mfxEnv.options?.progress !== false) {
      plugins.progress = {
        plugin: require.resolve('webpackbar'),
        args: [
          {
            name: '[Mfx]',
            color: 'green',
            profile: true,
          },
        ],
      }
    }
    // Analyze
    if (mfxEnv.options?.analyze) {
      plugins.analyzer = {
        plugin: require(require.resolve('webpack-bundle-analyzer')).BundleAnalyzerPlugin,
        args: [
          {
            reportFilename: 'report.html',
            openAnalyzer: true,
          },
        ],
      }
    }
    // TS/ESLint
    const tsconfigJsonPath = mfxEnv.resolve('tsconfig.json')
    const isTS = await fs.pathExists(tsconfigJsonPath)
    if (isTS) {
      plugins.ts = {
        plugin: require.resolve('fork-ts-checker-webpack-plugin'),
        args: [
          {
            async: mfxEnv.isDev, // true dev环境下部分错误验证通过
            eslint: {
              enabled: true,
              files: `${mfxEnv.src}/**/*.{ts,tsx,js,jsx}`,
            },
            typescript: {
              configFile: tsconfigJsonPath,
              profile: false,
              typescriptPath: require.resolve('typescript'),
            },
          },
        ],
      }
    } else {
      plugins.eslint = {
        plugin: require.resolve('eslint-webpack-plugin'),
        args: [
          {
            extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
            context: mfxEnv.root,
            files: ['src/**/*.{ts,tsx,js,jsx}'],
            cache: true,
            cacheLocation: path.resolve(mfxEnv.cacheDirRealPath, 'eslint'),
            fix: true,
            threads: true,
            lintDirtyModulesOnly: false,
          },
        ],
      }
    }

    wpChain.merge({
      plugin: plugins,
    })
  }

  get dotenv() {
    const buildEnv = mfxEnv.buildEnv
    const options = {
      path: mfxEnv.resolve(`.env${buildEnv ? '.' + buildEnv : ''}`),
      // path: './some.other.env', // load this now instead of the ones in '.env'
      safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
      allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
      systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
      silent: true, // hide any errors
      defaults: false, // load '.env.defaults' as the default values if empty.
    }
    return {
      plugin: Dotenv,
      args: [options],
    }
  }

  get define() {
    const options: Record<string, any> = mfxEnv.envVars
    for (const key in mfxConfig.define) {
      const val = mfxConfig.define[key]
      if (typeof val === 'string') {
        options[key] = JSON.stringify(val)
      } else if (typeof val !== 'object' && typeof val !== 'function') {
        options[key] = val
      }
    }

    return {
      plugin: webpack.DefinePlugin,
      args: [options],
    }
  }

  get html() {
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

  get mf() {
    return {
      plugin: container.ModuleFederationPlugin,
      args: [{}],
    }
  }
}
