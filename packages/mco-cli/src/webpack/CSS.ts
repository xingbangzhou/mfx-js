import {mcoBase} from 'src/base'
import {RuleSetRule, RuleSetUseItem} from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/
const lessRegex = /\.less$/
const lessModuleRegex = /\.module\.less$/

class CSS {
  async setup() {
    const {isDev, wpChain} = mcoBase

    wpChain?.merge({
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
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        },
      ])
    }
  }

  private getLoaders(
    modules = false,
    preProcessor: Record<string, RuleSetUseItem> = {},
  ): Record<string, RuleSetUseItem> {
    const {isDev} = mcoBase
    const localIdentName = isDev ? '[path][name]-[local]-[hash:base64:5]' : '_[hash:base64:7]'

    return {
      style: {
        loader: isDev ? require.resolve('style-loader') : MiniCssExtractPlugin.loader,
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
      ...preProcessor,
    }
  }

  private get css(): RuleSetRule {
    return {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: {
        ...this.getLoaders(),
      },
    }
  }

  private get cssModule(): RuleSetRule {
    return {
      test: cssModuleRegex,
      use: {
        ...this.getLoaders(true),
      },
    }
  }

  private get sass(): RuleSetRule {
    const {isDev} = mcoBase

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

  private get sassModule(): RuleSetRule {
    const {isDev} = mcoBase

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

  private get less(): RuleSetRule {
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

  private get lessModule(): RuleSetRule {
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
}

export default CSS
