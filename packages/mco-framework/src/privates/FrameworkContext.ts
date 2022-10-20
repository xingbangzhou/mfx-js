import McoFramework from 'src/Framework'
import McoModules from './Modules'
import McoServices from './Services'

export default class McoFrameworkContext {
  constructor() {
    this.services = new McoServices(this)
    this.modules = new McoModules(this)
    this.framework = new McoFramework(this)
  }

  readonly services: McoServices
  readonly modules: McoModules
  readonly framework: McoFramework
}
