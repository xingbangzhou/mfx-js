import {MscxFrameworkLauncher} from '@mscx/framework'

class MscxFw {
  constructor() {
    this.launcher = new MscxFrameworkLauncher()
    this.launcher.framework.init()
  }

  private launcher: MscxFrameworkLauncher

  get instance() {
    return this.launcher.framework
  }
}

const mscxFw = new MscxFw()

export default mscxFw
