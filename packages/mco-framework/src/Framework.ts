import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import McoModuleCleaner from './privates/ModuleCleaner'

export default class McoFramework extends McoModule {
  constructor(fwCtx: McoFrameworkContext) {
    super(fwCtx, new McoModuleCleaner(), '')
  }

  private inited = false

  init() {
    if (this.inited) return
    this.inited = true
  }
}
