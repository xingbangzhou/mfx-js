import {MfxFrameworkLauncher} from '@mfx0/framework'

class MainFramework {
  constructor() {
    this.launcher = new MfxFrameworkLauncher()
    this.launcher.framework.init()
  }

  private launcher: MfxFrameworkLauncher

  get instance() {
    return this.launcher.framework
  }
}

const mainFw = new MainFramework()

export default mainFw
