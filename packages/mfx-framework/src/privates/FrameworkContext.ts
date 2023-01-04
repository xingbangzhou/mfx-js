import MfxFramework from '../Framework'
import MfxEvents from './Events'
import MfxModules from './Modules'
import MfxServices from './Services'

export default class MfxFrameworkContext {
  constructor() {
    // 事件
    this.events = new MfxEvents()
    // 模块
    this.modules = new MfxModules(this)
    // 服务
    this.services = new MfxServices(this)
    // 框架实例
    this.framework = new MfxFramework(this)
  }

  readonly events: MfxEvents

  readonly modules: MfxModules

  readonly services: MfxServices

  readonly framework: MfxFramework
}
