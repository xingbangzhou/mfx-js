import path from 'path'
import fs from 'fs-extra'
import WebpackConfig from 'webpack-chain'
import type {MscxOptions, MscxModeType} from '../types'

class MscxEnv {
  // 项目根目录路径
  readonly root: string
  // 缓存路径
  readonly cacheFiles: Record<string, string>
  // webpack-chain实例
  readonly wpChain = new WebpackConfig()
  // 生产模式
  mode?: MscxModeType
  // 用户选项
  options?: MscxOptions
  // 源码目录
  src?: string
  // 打包路径
  dist?: string
  // 入口文件路径
  entry?: string
  // 静态文件路径
  public?: string
  // 图标文件路径
  favicon?: string
  // HTML模板文件路径
  template?: string
  // 项目pkg信息
  pkg?: Record<string, any>
  // 项目配置文件路径
  conf?: string

  constructor() {
    this.root = fs.realpathSync(process.cwd())
    this.cacheFiles = {
      eslint: this.resolve('node_modules/.cache/.eslintcache'),
      webpack: this.resolve('node_modules/.cache/webpack'),
      buildConfig: this.resolve('node_modules/.cache/.buildConfigCache.json'),
    }
  }

  resolve(relativePath: string) {
    return path.resolve(this.root, relativePath)
  }

  isFileExist(relativePath: string) {
    return fs.existsSync(this.resolve(relativePath))
  }

  get isDev() {
    return this.mode === 'development'
  }

  async init(mode: MscxModeType, options: MscxOptions) {
    this.mode = mode
    this.options = options
    this.src = this.resolve('src')
    this.dist = this.resolve('dist')
    this.entry = this.getEntry()
    this.public = this.resolve('public')
    const favicon = path.join(this.public, 'favicon.ico')
    const template = path.join(this.public, 'index.html')
    this.favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../../template/public/favicon.ico')
    this.template = fs.existsSync(template) ? template : path.join(__dirname, '../../template/public/index.html')
    const packageFile = this.resolve('package.json')
    this.pkg = fs.existsSync(packageFile) ? require(packageFile) : undefined
    const configFile = this.resolve('mscx-config.js')
    this.conf = fs.existsSync(configFile) ? configFile : undefined
  }

  async loadConf() {
    if (this.conf) {
      const configExport = require(this.conf)
      if (typeof configExport === 'function') {
        await configExport({wpChain: this.wpChain, mode: this.mode, options: this.options})
      }
    }
  }

  private getEntry() {
    if (this.isFileExist('src/index.ts')) return this.resolve('src/index.ts')
    if (this.isFileExist('src/index.tsx')) return this.resolve('src/index.tsx')
    return this.resolve('src/index.js')
  }
}

const mscxEnv = new MscxEnv()

export default mscxEnv
