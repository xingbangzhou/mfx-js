import {RuleSetRule} from 'webpack'
import wpChain from '../chain'
import {mfxEnv} from 'src/core'

export default class WpFile {
  constructor() {}

  async setup() {
    const rules = {
      img: this.img,
      fonts: this.fonts,
      inline: this.inline,
      svga: this.svga,
    }

    if (mfxEnv.reactVersion) {
      Object.assign(rules, {svg: this.svg})
    }

    wpChain.merge({
      module: {
        rule: rules,
      },
    })
  }

  get svg(): RuleSetRule {
    return {
      test: /\.svg$/,
      use: {
        svgr: {
          loader: require.resolve('@svgr/webpack'),
          options: {
            babel: false,
          },
        },
        url: {
          loader: 'url-loader', // 解决 ReactComponent 无法获取问题
          options: {
            esModule: false,
          },
        },
      },
    } as any
  }

  get img(): RuleSetRule {
    return {
      test: /\.(a?png|jpe?g|gif|webp|ico|bmp|avif)$/i,
      type: 'asset/resource',
    }
  }

  get fonts(): RuleSetRule {
    return {
      test: /\.(|otf|ttf|eot|woff|woff2)$/i,
      type: 'asset/resource',
    }
  }

  get inline(): RuleSetRule {
    return {
      resourceQuery: /inline/,
      type: 'asset/inline',
    }
  }

  get svga(): RuleSetRule {
    return {
      test: /\.(svga)$/i,
      type: 'asset/resource',
    }
  }
}
