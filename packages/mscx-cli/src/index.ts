import {mscxEnv} from './base'
import {MscxOptions, MscxModeType} from './types'
import MscxWebpack from './webpack'

const exec = async function (cmd: string, mode: MscxModeType, options: MscxOptions) {
  // 初始化
  await mscxEnv.init(mode, options)
  // Webpack配置
  await new MscxWebpack().setup()
  // 项目自定义配置
  await mscxEnv.loadConf()
  // 执行cli脚本
  const {default: cli} = await import(`./cli/${cmd}`)
  await cli.start()
}

export default {
  exec,
}
