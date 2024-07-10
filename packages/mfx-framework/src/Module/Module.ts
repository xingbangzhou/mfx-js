import MfxDestructor from '../Destructor'
import MfxModuleContext from './ModuleContext'

export default class MfxModule {
  constructor(ctx: MfxModuleContext, destructor: MfxDestructor) {
    this.ctx = ctx
    destructor.push(() => this.unload())
  }

  readonly ctx: MfxModuleContext

  get id() {
    return this.ctx.moduleId
  }

  protected unload() {}
}
