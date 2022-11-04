import McoFramework from '../Framework'
import McoEvents from './Events'
import McoModules from './Modules'
import McoServices from './Services'

export default class McoFrameworkContext {
  constructor() {
    // 事件
    this.events = new McoEvents()
    // 模块
    this.modules = new McoModules(this)
    // 服务
    this.services = new McoServices(this)
    // 框架实例
    this.framework = new McoFramework(this)
  }

  readonly events: McoEvents

  readonly modules: McoModules

  readonly services: McoServices

  readonly framework: McoFramework
}
