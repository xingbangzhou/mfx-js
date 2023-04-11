import MxModuleContext from '../ModuleContext'
import MxFrameworkContext from '../privates/FrameworkContext'
import MxModuleDestructor from '../privates/ModuleDestructor'

export default class YoModule {
  constructor(fwCtx: MxFrameworkContext, destructor: MxModuleDestructor, id: string) {
    this._id = id
    destructor.bindUnloader(() => this.unload())
    this._ctx = new MxModuleContext(this, fwCtx, destructor)
  }

  private _id: string
  private _ctx: MxModuleContext

  get id() {
    return this._id
  }

  get ctx() {
    return this._ctx
  }

  protected unload() {}
}
