import {MxLauncherOption} from '../types'
import MxFramework from '../Framework'
import MxEvents from './Events'
import MxModules from './Modules'
import MxServices from './Services'

export default class MxFrameworkContext {
  constructor(options?: MxLauncherOption) {
    this.options = options

    this.events = new MxEvents()
    this.modules = new MxModules(this)
    this.services = new MxServices(this)
    this.framework = new MxFramework(this)

    this.init()
  }

  readonly options?: MxLauncherOption

  readonly events: MxEvents

  readonly modules: MxModules

  readonly services: MxServices

  readonly framework: MxFramework

  get logger() {
    return this.framework.ctx.logger
  }

  private init() {
    this.logger.debug = this.options?.debug || false
  }
}
