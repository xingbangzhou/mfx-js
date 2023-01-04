import {mfxEnv} from '../base'
import Common from './Common'
import CSS from './CSS'
import File from './File'
import Module from './Module'
import Plugin from './Plugin'
import Development from './Development'
import Production from './Production'

export default class MfxWebpack {
  common = new Common()
  css = new CSS()
  file = new File()
  module = new Module()
  plugin = new Plugin()
  development = new Development()
  production = new Production()

  async setup() {
    await Promise.all([
      this.common.setup(),
      this.css.setup(),
      this.file.setup(),
      this.module.setup(),
      this.plugin.setup(),
    ])

    if (mfxEnv.mode === 'development' || mfxEnv.mode === 'serve') await this.development.setup()
    else if (mfxEnv.mode === 'production') await this.production.setup()
  }
}
