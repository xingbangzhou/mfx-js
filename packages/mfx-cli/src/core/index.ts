export {default as mfxEnv} from './env'
export {default as mfxConfig} from './config'

import type {MfxOptions, WpMode} from '../types'
import mfxConfig from './config'
import mfxEnv from './env'

class MfxCore {
  constructor() {}

  async init(mode: WpMode, options: MfxOptions) {
    // 初始化环境
    await mfxEnv.init(mode, options)
    // 加载配置
    await mfxConfig.load()
  }
}

const mfxCore = new MfxCore()

export default mfxCore
