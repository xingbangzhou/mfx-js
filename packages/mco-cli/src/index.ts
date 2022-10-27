import {mcoEnv} from 'src/base'
import {McoOptions, McoModeType} from 'src/types'
import McoWebpack from 'src/webpack'

const exec = async function (cmd: string, mode: McoModeType, options: McoOptions) {
  // 初始化
  await mcoEnv.init(mode, options)
  // Webpack配置
  await new McoWebpack().setup()
  // 项目自定义配置
  await mcoEnv.loadConf()
  // 执行cli脚本
  const {default: cli} = await import(`./cli/${cmd}`)
  await cli.start()
}

export default {
  exec,
}
