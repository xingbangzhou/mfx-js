import {mfxEnv} from './core'
import {MfxOptions, MfxModeType} from './types'
import MfxWebpack from './webpack'

const exec = async function (cmd: string, mode: MfxModeType, options: MfxOptions) {
  // 初始化
  await mfxEnv.init(mode, options)
  // Webpack配置
  await new MfxWebpack().setup()
  // 项目自定义配置
  await mfxEnv.loadConf()
  // 执行cli脚本
  const {default: cli} = await import(`./cmd/${cmd}`)
  await cli.start()
}

export default {
  exec,
}
