import MfxFrameworkContext from './FrameworkContext'
import {MfxLauncherOption} from '../types'

export default class MfxFrameworkLauncher {
  constructor(options?: MfxLauncherOption) {
    this._fwCtx = new MfxFrameworkContext(options)
  }

  private _fwCtx: MfxFrameworkContext

  get framework() {
    return this._fwCtx.framework
  }
}
