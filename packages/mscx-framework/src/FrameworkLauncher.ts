import MscxFrameworkContext from './privates/FrameworkContext'

export default class MscxFrameworkLauncher {
  constructor() {
    this.fwCtx = new MscxFrameworkContext()
  }

  private fwCtx: MscxFrameworkContext

  get framework() {
    return this.fwCtx.framework
  }
}
