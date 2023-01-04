import MfxFrameworkContext from './privates/FrameworkContext'

export default class MfxFrameworkLauncher {
  constructor() {
    this.fwCtx = new MfxFrameworkContext()
  }

  private fwCtx: MfxFrameworkContext

  get framework() {
    return this.fwCtx.framework
  }
}
