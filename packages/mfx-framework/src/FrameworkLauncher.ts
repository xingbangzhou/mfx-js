import MxFrameworkContext from './privates/FrameworkContext'
import {MxLauncherOption} from './types'

export default class MxFrameworkLauncher {
  constructor(options?: MxLauncherOption) {
    this._fwCtx = new MxFrameworkContext(options)
  }

  private _fwCtx: MxFrameworkContext

  get framework() {
    return this._fwCtx.framework
  }
}
