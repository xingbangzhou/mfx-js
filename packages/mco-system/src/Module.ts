import McoModuleContext from './ModuleContext'
import McoFrameworkContext from './privates/FrameworkContext'
import McoModuleCleaner from './privates/ModuleCleaner'

export default class McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, mId: string) {
    this._mId = mId
    cleaner.bindUnload(() => this.unload())
    this._ctx = new McoModuleContext(this, fwCtx, cleaner)
  }

  private _mId: string
  private _ctx: McoModuleContext

  get mId() {
    return this._mId
  }

  get ctx() {
    return this._ctx
  }

  protected unload() {}
}
