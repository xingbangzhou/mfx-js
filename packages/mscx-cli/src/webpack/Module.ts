import {mscxEnv} from '../base'
import {RuleSetRule} from 'webpack'

class Module {
  async setup() {
    const {wpChain, options, isDev, pkg} = mscxEnv

    wpChain?.merge({
      module: {
        rule: {
          mjs: this.mjs,
          scripts: this.scripts,
        },
      },
    })

    if (pkg?.dependencies.react) {
      wpChain?.module
        .rule('scripts')
        .use('babel')
        .tap(o => {
          // react
          o.presets.push([
            require.resolve('@babel/preset-react'),
            {
              runtime: 'automatic',
            },
          ])
          // fast refresh
          isDev && options?.hot && o.plugins.unshift(require.resolve('react-refresh/babel'))
          return o
        })

      wpChain?.module
        .rule('svg')
        .use('svgr')
        .before('url')
        .loader('@svgr/webpack')
        .options({babel: false})
        .end()
        .use('babel')
        .before('svgr')
        .loader('babel-loader')
        .options({presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react']})

      if (options?.hot && isDev) {
        wpChain?.plugin('reacthotloader').use(require('@pmmmwh/react-refresh-webpack-plugin'))
      }
    }
  }

  private get mjs(): RuleSetRule {
    return {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    }
  }

  private get scripts(): RuleSetRule {
    return {
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
                  loose: true,
                },
              ],
              require.resolve('@babel/preset-typescript'),
            ],
            plugins: [
              [
                require.resolve('@babel/plugin-transform-runtime'),
                {
                  corejs: false,
                  helpers: true,
                  version: require('@babel/runtime/package.json').version,
                  regenerator: true,
                  useESModules: false,
                },
              ],
              [require.resolve('@babel/plugin-proposal-decorators'), {legacy: true}],
              [require.resolve('@babel/plugin-proposal-class-properties'), {loose: true}],
            ],
          },
        },
      },
    } as any
  }
}

export default Module
