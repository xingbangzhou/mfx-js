import {YoLauncherOption} from '../types'
import YoFramework from '../Framework'
import YoEvents from './Events'
import YoModules from './Modules'
import YoServices from './Services'

export default class YoFrameworkContext {
  constructor(options?: YoLauncherOption) {
    this._options = options

    this.events = new YoEvents()
    this.modules = new YoModules(this)
    this.services = new YoServices(this)
    this.framework = new YoFramework(this)

    this.init()
  }

  private _options?: YoLauncherOption

  readonly events: YoEvents

  readonly modules: YoModules

  readonly services: YoServices

  readonly framework: YoFramework

  get options() {
    return this._options
  }

  get logger() {
    return this.framework.ctx.logger
  }

  private init() {
    this.logger.debug = this._options?.debug || false
  }
}
