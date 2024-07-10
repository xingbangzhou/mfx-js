import {MfxLauncherOption} from '../../types'
import MfxFramework from '../Framework'
import MfxEvents from './Events'
import MfxModules from './Modules'
import MfxServices from './Services'

export default class MfxFrameworkContext {
  constructor(options?: MfxLauncherOption) {
    this.options = options

    this.events = new MfxEvents()
    this.modules = new MfxModules(this)
    this.services = new MfxServices(this)
    this.framework = new MfxFramework(this)

    this.init()
  }

  readonly options?: MfxLauncherOption

  readonly events: MfxEvents

  readonly modules: MfxModules

  readonly services: MfxServices

  readonly framework: MfxFramework

  get logger() {
    return this.framework.ctx.logger
  }

  private init() {
    this.logger.debug = this.options?.debug || false
  }
}
