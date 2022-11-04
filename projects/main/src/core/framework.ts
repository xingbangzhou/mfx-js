import {McoFrameworkLauncher} from '@mco/core'

class Framework {
  constructor() {
    this.launcher = new McoFrameworkLauncher()
    this.launcher.framework.init()
  }

  private launcher: McoFrameworkLauncher

  get mcoFw() {
    return this.launcher.framework
  }
}

const framework = new Framework()

export default framework
