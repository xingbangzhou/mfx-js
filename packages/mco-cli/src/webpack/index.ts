import {mcoEnv} from 'src/base'
import Common from './Common'
import CSS from './CSS'
import File from './File'
import Module from './Module'
import Plugin from './Plugin'
import Development from './Development'
import Production from './Production'

export default class McoWebpack {
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

    if (mcoEnv.mode === 'development' || mcoEnv.mode === 'serve') await this.development.setup()
    else if (mcoEnv.mode === 'production') await this.production.setup()
  }
}
