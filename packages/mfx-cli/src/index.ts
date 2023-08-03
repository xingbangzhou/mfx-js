import mfxCore, {mfxConfig} from './core'
import {WpMode, MfxOptions} from './types'
import {logTitle} from './utils/logger'
import mfxWebpack from './webpack'

const mfx = async function (cmd: string, mode: WpMode, options: MfxOptions) {
  await mfxCore.init(mode, options)

  await mfxWebpack.setup()

  await mfxConfig.setupEx()

  logTitle(`begin with command: ${cmd}`)

  // 执行cli脚本
  const {default: cli} = await import(`./cli/${cmd}`)
  await cli.start()
}

export default {
  mfx,
}
