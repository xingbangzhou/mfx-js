const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { wpEnv } = require('./wpEnv')

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/
const lessRegex = /\.less$/
const lessModuleRegex = /\.module\.less$/

const setup = function () {
  const {env, wpConfig } = wpEnv
  const isDev = env === 'development'
  const localIdentName = isDev ? '[path][name]-[local]-[hash:base64:5]' : '_[hash:base64:7]'

  const getLoaders = (modules = false, preProcessor = {}) => {
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
          }
        }
      },
      ...preProcessor,
    }
  }

  wpConfig.merge({
    module: {
      rule: {
        css: {
          test: cssRegex,
          exclude: cssModuleRegex,
          use: {
            ...getLoaders()
          }
        },
        cssModule: {
          test: cssModuleRegex,
          use: {
            ...getLoaders(true)
          }
        },
        sassModule: {
          test: sassModuleRegex,
          use: {
            ...getLoaders(true, {
              sass: {
                loader: require.resolve('sass-loader'),
                options: {
                  implementation: require('sass'),
                  sourceMap: isDev
                }
              }
            })
          }
        },
        sass: {
          test: sassRegex,
          exclude: sassModuleRegex,
          use: {
            ...getLoaders(false, {
              sass: {
                loader: require.resolve('sass-loader'),
                options: {
                  implementation: require('sass'),
                  sourceMap: isDev
                }
              }
            })
          }
        },
        less: {
          test: lessRegex,
          exclude: lessModuleRegex,
          use: {
            ...getLoaders(false, {
              less: {
                loader: require.resolve('less-loader'),
                options: {
                  lessOptions: {javascriptEnabled: true},
                }
              }
            })
          }
        },
        lessModule: {
          test: lessModuleRegex,
          use: {
            ...getLoaders(true, {
              less: {
                loader: require.resolve('less-loader')
              }
            })
          }
        }
      }
    }
  })

  if (!isDev) {
    wpConfig.optimization.minimizer('CssMinimizerPlugin').use(CssMinimizerPlugin, [
      {
        parallel: true,
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: {removeAll: true},
            }
          ]
        }
      }
    ])
    wpConfig.plugin('MiniCssExtractPlugin').use(MiniCssExtractPlugin, [
      {
        ignoreOrder: true,
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      }
    ])
  }
}

module.exports = {
  setup
}
