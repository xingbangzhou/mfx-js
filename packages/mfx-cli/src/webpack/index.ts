export {default as wpChain} from './chain'

import {mfxEnv} from '../core'
import WpCommon from './common'
import WpCSS from './loader/css'
import WpFile from './loader/file'
import WpJS from './loader/js'
import WpPlugin from './plugins/plugin'
import WpDevelopment from './modes/development'
import WpProduction from './modes/production'

class MfxWebpack {
  constructor() {}

  readonly common = new WpCommon()
  readonly css = new WpCSS()
  readonly file = new WpFile()
  readonly js = new WpJS()
  readonly plugin = new WpPlugin()

  async setup() {
    await this.common.setup()
    await this.css.setup()
    await this.file.setup()
    await this.js.setup()
    await this.plugin.setup()

    if (mfxEnv.isDev) {
      await new WpDevelopment().setup()
    } else {
      await new WpProduction().setup()
    }
  }
}

const mfxWebpack = new MfxWebpack()

export default mfxWebpack
