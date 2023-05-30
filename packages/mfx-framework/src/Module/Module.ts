import {MxDestructor} from '../types'
import MxModuleContext from '../ModuleContext'

export default class MxModule {
  constructor(ctx: MxModuleContext, destructor: MxDestructor) {
    this.ctx = ctx
    destructor.push(() => this.unload())
  }

  readonly ctx: MxModuleContext

  get id() {
    return this.ctx.moduleId
  }

  protected unload() {}
}
