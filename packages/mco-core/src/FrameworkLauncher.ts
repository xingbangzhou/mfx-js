import McoFrameworkContext from './privates/FrameworkContext'

export default class McoFrameworkLauncher {
  constructor() {
    this.fwCtx = new McoFrameworkContext()
  }

  private fwCtx: McoFrameworkContext

  get framework() {
    return this.fwCtx.framework
  }
}
