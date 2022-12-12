import MscxFramework from '../Framework'
import MscxEvents from './Events'
import MscxModules from './Modules'
import MscxServices from './Services'

export default class MscxFrameworkContext {
  constructor() {
    // 事件
    this.events = new MscxEvents()
    // 模块
    this.modules = new MscxModules(this)
    // 服务
    this.services = new MscxServices(this)
    // 框架实例
    this.framework = new MscxFramework(this)
  }

  readonly events: MscxEvents

  readonly modules: MscxModules

  readonly services: MscxServices

  readonly framework: MscxFramework
}
