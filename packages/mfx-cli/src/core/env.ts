import path from 'path'
import fs from 'fs-extra'
import type {MfxOptions, WpMode} from '../types'

class MfxEnv {
  constructor() {}

  // 项目目录
  root = fs.realpathSync(process.cwd())
  // 缓存目录
  cacheDir = 'node_modules/.mfx-cache'
  // 模式
  mode?: WpMode
  // 命令行选项
  options?: MfxOptions
  // 源码目录
  src = ''
  // 静态文件目录
  public = ''
  // 默认入口文件
  defaultEntry = ''
  // 默认输出目录
  defultDist = ''
  // 图标文件路径
  favicon?: string
  // HTML模板文件路径
  template?: string
  // 项目pkg信息
  appPackage?: Record<string, any>

  // 环境变量
  envVars: Record<string, any> = {}

  async init(mode: WpMode, options: MfxOptions) {
    this.mode = mode
    this.options = options
    this.src = this.resolve('src')
    this.public = this.resolve('public')
    this.defultDist = this.resolve('dist')

    const favicon = path.join(this.public, 'favicon.ico')
    const template = path.join(this.public, 'index.html')
    this.favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../../template/public/favicon.ico')
    this.template = fs.existsSync(template) ? template : path.join(__dirname, '../../template/public/index.html')

    const packageFile = this.resolve('package.json')
    this.appPackage = fs.existsSync(packageFile) ? require(packageFile) : undefined

    this.initEntry()
    this.initEnvVars()
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

  get cacheDirRealPath() {
    return this.resolve(this.cacheDir)
  }

  get reactVersion() {
    return this.appPackage?.dependencies?.react
  }

  get buildEnv() {
    return this.options?.env
  }

  private initEntry() {
    if (this.isFileExist('src/index.ts')) return this.resolve('src/index.ts')
    if (this.isFileExist('src/index.tsx')) return this.resolve('src/index.tsx')
    this.defaultEntry = this.resolve('src/index.js')
  }

  private initEnvVars() {
    this.envVars.__PROD__ = false
    this.envVars.env.__TEST__ = false
    this.envVars.env.__DEV__ = false

    switch (this.buildEnv) {
      case 'prod':
        this.envVars.__PROD__ = true
        break
      case 'test':
        this.envVars.__TEST__ = true
        break
      case 'dev':
        this.envVars.__DEV__ = true
        break
      default:
        break
    }
  }
}

const mfxEnv = new MfxEnv()

export default mfxEnv
