const {configure} = require('./configure')

const setup = function () {
  const { wpConfig } = configure

  wpConfig.merge({
    module: {
      rule: {
        mjs: {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          }
        },
        scripts: {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            babel: {
              loader: require.resolve('babel-loader'),
              options: {
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      useBuiltIns: 'entry',
                      corejs: 3,
                      exclude: ['transform-typeof-symbol'],
                      loose: true
                    }
                  ],
                  require.resolve('@babel/preset-typescript')
                ],
                plugins: [
                  [
                    require.resolve('@babel/plugin-transform-runtime'),
                    {
                      corejs: false,
                      helpers: true,
                      version: require('@babel/runtime/package.json').version,
                      regenerator: true,
                      useESModules: false
                    }
                  ],
                  [require.resolve('@babel/plugin-proposal-decorators'), {legacy: true}],
                  [require.resolve('@babel/plugin-proposal-class-properties'), {loose: true}]
                ]
              }
            }
          }
        }
      }
    }
  })
}

module.exports = {
  setup
}
