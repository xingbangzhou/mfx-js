import YoFramework from '../Framework'
import YoEvents from './Events'
import YoModules from './Modules'
import YoServices from './Services'

export default class YoFrameworkContext {
  constructor() {
    // 事件
    this.events = new YoEvents()
    // 模块
    this.modules = new YoModules(this)
    // 服务
    this.services = new YoServices(this)
    // 框架实例
    this.framework = new YoFramework(this)
  }

  readonly events: YoEvents

  readonly modules: YoModules

  readonly services: YoServices

  readonly framework: YoFramework

  get logger() {
    return this.framework.ctx.logger
  }
}
