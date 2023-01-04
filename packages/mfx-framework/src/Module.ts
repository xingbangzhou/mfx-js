import MfxModuleContext from './ModuleContext'
import MfxFrameworkContext from './privates/FrameworkContext'
import MfxModuleCleaner from './privates/ModuleCleaner'

export default class MfxModule {
  constructor(fwCtx: MfxFrameworkContext, cleaner: MfxModuleCleaner, id: string) {
    this._id = id
    cleaner.bindUnloadFn(() => this.unload())
    this._ctx = new MfxModuleContext(this, fwCtx, cleaner)
  }

  private _id: string
  private _ctx: MfxModuleContext

  get id() {
    return this._id
  }

  get ctx() {
    return this._ctx
  }

  protected unload() {}
}
