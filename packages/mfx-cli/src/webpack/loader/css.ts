import {mfxConfig, mfxEnv} from 'src/core'
import {RuleSetRule, RuleSetUseItem} from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import wpChain from '../chain'

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/
const lessRegex = /\.less$/
const lessModuleRegex = /\.module\.less$/

export default class WpCSS {
  constructor() {}

  private localIdentName = ''

  async setup() {
    const {isDev} = mfxEnv
    const {assetsDir} = mfxConfig

    this.localIdentName = isDev ? '[path][name]-[local]-[hash:base64:5]' : '[local]-[hash:base64:5]'

    wpChain.merge({
      module: {
        rule: {
          css: this.css,
          cssModule: this.cssModule,
          sass: this.sass,
          sassModule: this.sassModule,
          less: this.less,
          lessModule: this.lessModule,
        },
      },
    })

    if (!isDev) {
      wpChain?.optimization.minimizer('CssMinimizerPlugin').use(CssMinimizerPlugin, [
        {
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: {removeAll: true},
              },
            ],
          },
        } as any,
      ])

      wpChain?.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [
        {
          ignoreOrder: true,
          filename: `${assetsDir}/css/[name].[contenthash:8].css`,
          chunkFilename: `${assetsDir}/css/[name].[contenthash:8].chunk.css`,
        },
      ])
    }
  }

  get css(): RuleSetRule {
    return {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: {
        ...this.getLoaders(),
      },
    }
  }

  get cssModule(): RuleSetRule {
    return {
      test: cssModuleRegex,
      use: {
        ...this.getLoaders(true),
      },
    }
  }

  get sass(): RuleSetRule {
    const {isDev} = mfxEnv

    return {
      test: sassRegex,
      exclude: sassModuleRegex,
      use: {
        ...this.getLoaders(false, {
          sass: {
            loader: require.resolve('sass-loader'),
            options: {
              implementation: require('sass'),
              sourceMap: isDev,
            },
          },
        }),
      },
    }
  }

  get sassModule(): RuleSetRule {
    const {isDev} = mfxEnv

    return {
      test: sassModuleRegex,
      use: {
        ...this.getLoaders(true, {
          sass: {
            loader: require.resolve('sass-loader'),
            options: {
              implementation: require('sass'),
              sourceMap: isDev,
            },
          },
        }),
      },
    }
  }

  get less(): RuleSetRule {
    return {
      test: lessRegex,
      exclude: lessModuleRegex,
      use: {
        ...this.getLoaders(false, {
          less: {
            loader: require.resolve('less-loader'),
            options: {
              lessOptions: {javascriptEnabled: true},
            },
          },
        }),
      },
    }
  }

  get lessModule(): RuleSetRule {
    return {
      test: lessModuleRegex,
      use: {
        ...this.getLoaders(true, {
          less: {
            loader: require.resolve('less-loader'),
          },
        }),
      },
    }
  }

  private getLoaders(modules = false, rules: Record<string, RuleSetUseItem> = {}): Record<string, RuleSetUseItem> {
    const {localIdentName} = this

    return {
      style: {
        loader: mfxEnv.isDev ? require.resolve('style-loader') : MiniCssExtractPlugin.loader,
        options: {},
      },
      css: {
        loader: require.resolve('css-loader'),
        options: {
          modules: modules ? {localIdentName} : modules,
        },
      },
      postcss: {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            hideNothingWarning: true,
          },
        },
      },
      ...rules,
    }
  }
}
