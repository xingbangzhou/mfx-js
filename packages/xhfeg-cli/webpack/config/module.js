module.exports = (env, config, { hot }) => {
  const isDev = env === 'development'

  const moduleConfig = {
    module: {
      generator: {
        'asset/resource': {
          publicPath: '/'
        }
      },
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
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'entry',
                      debug: false,
                      corejs: 3,
                      exclude: ['transform-typeof-symbol'],
                      loose: true
                    }
                  ],
                  '@babel/preset-typescript'
                ],
                plugins: [
                  [
                    '@babel/plugin-transform-runtime',
                    {
                      corejs: false,
                      helpers: true,
                      version: require('@babel/runtime/package.json').version,
                      regenerator: true,
                      useESModules: false,
                      absoluteRuntime: false
                    }
                  ],
                  ['@babel/plugin-proposal-decorators', {legacy: true}],
                  ['@babel/plugin-proposal-class-properties', {loose: true}]
                ]
              }
            }
          }
        }
      }
    }
  }

  config.merge(moduleConfig)
}
