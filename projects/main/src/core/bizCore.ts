import {MxFrameworkLauncher} from '@mfx0/framework'

class BizCore extends MxFrameworkLauncher {
  constructor() {
    super()
  }

  private _inited = false

  init() {
    if (this._inited) return
    this._inited = true

    this.framework.init()
  }

  get ctx() {
    return this.framework.ctx
  }
}

const bizCore = new BizCore()

export default bizCore
