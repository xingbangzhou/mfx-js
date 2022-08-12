import {mcoBase} from 'src/base'
import {RuleSetRule} from 'webpack'

class File {
  async setup() {
    const {wpChain} = mcoBase

    wpChain?.merge({
      module: {
        rule: {
          svg: this.svg,
          image: this.image,
          fonts: this.fonts,
          inline: this.inline,
          svga: this.svga,
        },
      },
    })
  }

  private get svg(): RuleSetRule {
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

  private get image(): RuleSetRule {
    return {
      test: /\.(a?png|jpe?g|gif|webp|ico|bmp|avif)$/i,
      type: 'asset/resource',
    }
  }

  private get fonts(): RuleSetRule {
    return {
      test: /\.(|otf|ttf|eot|woff|woff2)$/i,
      type: 'asset/resource',
    }
  }

  private get inline(): RuleSetRule {
    return {
      resourceQuery: /inline/,
      type: 'asset/inline',
    }
  }

  private get svga(): RuleSetRule {
    return {
      test: /\.(svga)$/i,
      type: 'asset/resource',
    }
  }
}

export default File
