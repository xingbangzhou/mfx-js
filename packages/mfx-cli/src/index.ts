import mfxCore from './core'
import {WpMode, MfxOptions} from './types'
import mfxWebpack from './webpack'

const mfx = async function (cmd: string, mode: WpMode, options: MfxOptions) {
  await mfxCore.init(mode, options)

  await mfxWebpack.setup()

  // 执行cli脚本
  const {default: cli} = await import(`./cli/${cmd}`)
  await cli.start()
}

export default {
  mfx,
}
