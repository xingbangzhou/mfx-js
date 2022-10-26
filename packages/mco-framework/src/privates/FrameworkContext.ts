import McoFramework from '../Framework'
import McoModules from './Modules'
import McoServices from './Services'

export default class McoFrameworkContext {
  constructor() {
    this.modules = new McoModules(this)
    this.services = new McoServices(this)
    this.framework = new McoFramework(this)
  }

  readonly modules: McoModules

  readonly services: McoServices

  readonly framework: McoFramework
}
