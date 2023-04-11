import MxFrameworkContext from './privates/FrameworkContext'

export default class YoFrameworkLauncher {
  constructor() {
    this._fwCtx = new MxFrameworkContext()
  }

  private _fwCtx: MxFrameworkContext

  get framework() {
    return this._fwCtx.framework
  }
}
