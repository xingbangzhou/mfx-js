import {MxFrameworkLauncher} from '@mfx0/framework'

class MainFramework {
  constructor() {
    this.launcher = new MxFrameworkLauncher()
    this.launcher.framework.init()
  }

  private launcher: MxFrameworkLauncher

  get instance() {
    return this.launcher.framework
  }
}

const mainFw = new MainFramework()

export default mainFw
