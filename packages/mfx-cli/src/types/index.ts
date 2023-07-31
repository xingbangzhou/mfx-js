import WpChain from 'webpack-chain'
import {Configuration} from 'webpack'
import {Configuration as DSConfiguration} from 'webpack-dev-server'

export type WpMode = 'development' | 'production'

export type BuildEnv = 'dev' | 'test' | 'prod'

export interface MfxOptions {
  env?: BuildEnv
  progress?: boolean
  analyze?: boolean
}

// mfx-config 配置类型

export interface BuildConfig {
  // 编译目标
  target?: Configuration['target']
  // 入口文件
  entry?: string
  // 出书目录
  dist?: string
  // 静态资源目录
  assets?: string
}

export interface ResolveAliasConfig {
  [index: string]: string
}

export interface DevServerConfig {
  /**
   * 访问 host
   * @default '0.0.0.0'
   */
  host?: string
  /**
   * 访问 端口
   * @default 3000
   */
  port?: number
  /**
   * 自动打开
   * @default false
   */
  open?: DSConfiguration['open']
  /**
   * 热重载
   * @default true
   */
  hot?: DSConfiguration['hot']
}

export type MfxConfigParams = {
  mode?: WpMode
} & MfxOptions

export interface ChainExtender {
  (chain: WpChain, argv: MfxConfigParams): Promise<void>
}

export interface MfxConfigResult {
  build?: BuildConfig

  define?: Record<string, any>

  alias?: ResolveAliasConfig

  devServer?: DevServerConfig

  chainExtender?: ChainExtender
}

export interface MfxConfigFn {
  (params: MfxConfigParams): Promise<MfxConfigResult>
}
