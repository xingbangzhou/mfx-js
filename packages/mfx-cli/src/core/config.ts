import fs from 'fs-extra'
import mfxEnv from './env'
import {ResolveAliasConfig, MfxConfigFn, MfxConfigParams, DevServerConfig, ChainExtender, BuildConfig} from '../types'
import {wpChain} from 'src/webpack'

class MfxConfig {
  constructor() {}

  // 配置文件
  configFile?: string
  // 构建配置
  build?: BuildConfig
  // 全局变量
  define?: Record<string, any>
  // 本地服务配置
  devServer: DevServerConfig = {
    host: '0.0.0.0',
    port: 3000,
    // https: false,
    open: false,
    // proxy: false,
    hot: true,
  }
  // 别名配置
  alias?: ResolveAliasConfig
  // WebpackChain扩展
  chainExtender?: ChainExtender

  private _defaultEntry = ''
  private _defaultDist = ''

  get target() {
    return this.build?.target || 'es5'
  }

  get entry() {
    return this.build?.entry || this._defaultEntry
  }

  get dist() {
    return this.build?.dist || this._defaultDist
  }

  get assetsDir() {
    return this.build?.assets || 'assets'
  }

  async setup() {
    this.initEntry()
    this._defaultDist = mfxEnv.resolve('dist')

    this.configFile = mfxEnv.resolve('mfx-config.js')
    this.configFile = fs.existsSync(this.configFile) ? this.configFile : undefined

    // 加载本地配置
    if (this.configFile) {
      const configExport = require(this.configFile)
      if (typeof configExport === 'function') {
        const configFn = configExport as MfxConfigFn

        const configArgv: MfxConfigParams = {
          mode: mfxEnv.mode,
          ...mfxEnv.options,
        }

        const {build, define, alias, devServer, chainExtender} = await configFn(configArgv)

        // 加载build真实数据
        this.build = build
        this.loadBuild()

        this.define = define
        this.alias = alias
        Object.assign(this.devServer, devServer)
        this.chainExtender = chainExtender
      }
    }
  }

  async setupEx() {
    await this.chainExtender?.(wpChain, {
      mode: mfxEnv.mode,
      ...mfxEnv.options,
    })
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

  private initEntry() {
    if (mfxEnv.isFileExist('src/index.ts')) {
      this._defaultEntry = mfxEnv.resolve('src/index.ts')
    } else if (mfxEnv.isFileExist('src/index.tsx')) {
      this._defaultEntry = mfxEnv.resolve('src/index.tsx')
    } else this._defaultEntry = mfxEnv.resolve('src/index.js')
  }
}

const mfxConfig = new MfxConfig()

export default mfxConfig
