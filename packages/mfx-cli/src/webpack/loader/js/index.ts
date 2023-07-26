import wpChain from 'src/webpack/chain'
import babelLoader from './babelLoader'
import {mfxConfig, mfxEnv} from 'src/core'

export default class WpJS {
  constructor() {}

  async setup() {
    wpChain.merge({
      module: {
        rule: {
          mjs: {
            test: /\.mjs$/,
            exclude: /(node_modules|bower_components)/,
            resolve: {
              fullySpecified: false,
            },
            use: {
              ...babelLoader(),
            },
          },
          scripts: {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              ...babelLoader(),
            },
          },
        },
      },
    })

    if (mfxEnv.isDev && mfxConfig.devServer?.host && mfxEnv.reactVersion) {
      wpChain.plugin('reactRefresh').use(require(require.resolve('@pmmmwh/react-refresh-webpack-plugin')))
    }
  }
}
