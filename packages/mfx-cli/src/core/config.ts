import fs from 'fs-extra'
import mfxEnv from './env'
import {ResolveAliasConfig, MfxConfigFunc, MfxConfigArgv, DevServerConfig, ChainExtender, BuildConfig} from 'src/types'

class MfxConfig {
  constructor() {}

  // 配置文件
  configFile?: string

  // 构建配置
  build?: BuildConfig
  // 全局变量
  define?: Record<string, any>
  // 本地服务配置
  devServer?: DevServerConfig
  // 别名配置
  alias?: ResolveAliasConfig
  // WebpackChain扩展
  chainExtender?: ChainExtender

  async load() {
    this.configFile = mfxEnv.resolve('mfx-config.js')
    this.configFile = fs.existsSync(this.configFile) ? this.configFile : undefined

    // 加载本地配置
    if (this.configFile) {
      const configExport = require(this.configFile)
      if (typeof configExport === 'function') {
        const configFn = configExport as MfxConfigFunc

        const configArgv: MfxConfigArgv = {
          mode: mfxEnv.mode,
          ...mfxEnv.options,
        }

        const {build, define, alias, devServer, chainExtender} = await configFn(configArgv)

        this.build = build
        this.define = define
        this.alias = alias
        this.devServer = devServer
        this.chainExtender = chainExtender

        // 加载build真实数据
        this.loadBuild()
      }
    }
  }

  private loadBuild() {
    if (!this.build) return
    if (this.build.dist) {
      this.build.dist = mfxEnv.resolve(this.build.dist)
    }
    if (this.build.entry) {
      this.build.entry = mfxEnv.resolve(this.build.entry)
    }
  }
}

const mfxConfig = new MfxConfig()

export default mfxConfig
