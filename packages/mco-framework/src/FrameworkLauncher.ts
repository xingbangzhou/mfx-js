import McoFrameworkContext from './privates/FrameworkContext'

export default class McoFrameworkLauncher {
  constructor() {
    this.fwCtx = new McoFrameworkContext()
  }

  readonly fwCtx: McoFrameworkContext
}
