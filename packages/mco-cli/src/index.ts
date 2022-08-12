import {mcoBase} from 'src/base'
import {MCOOptions, MCOModeType} from 'src/types'
import wpConfig from 'src/webpack'

const exec = async function (cmd: string, mode: MCOModeType, options: MCOOptions) {
  // 初始化
  await mcoBase.init(mode, options)
  // Webpack配置
  await wpConfig.setup()
  // 项目自定义配置
  await mcoBase.loadConf()
  // 执行cli脚本
  const {default: cli} = await import(`./cli/${cmd}`)
  await cli.start()
}

export default {
  exec,
}
