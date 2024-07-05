import {MfxFrameworkLauncher} from '@mfx-js/framework'

class BizCore extends MfxFrameworkLauncher {
  constructor() {
    super()
  }

  private _inited = false

  init() {
    if (this._inited) return
    this._inited = true
  }

  get ctx() {
    return this.framework.ctx
  }
}

const bizCore = new BizCore()

export default bizCore
