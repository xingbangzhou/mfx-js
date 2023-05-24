import MxFrameworkContext from './privates/FrameworkContext'
import {YoLauncherOption} from './types'

export default class YoFrameworkLauncher {
  constructor(options?: YoLauncherOption) {
    this._fwCtx = new MxFrameworkContext(options)
  }

  private _fwCtx: MxFrameworkContext

  get framework() {
    return this._fwCtx.framework
  }
}
