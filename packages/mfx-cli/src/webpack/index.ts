import WPCommon from './common'

class MfxWebpack {
  constructor() {}

  readonly common = new WPCommon()

  async setup() {
    await this.common.setup()
  }
}

const mfxWebpack = new MfxWebpack()

export default mfxWebpack
