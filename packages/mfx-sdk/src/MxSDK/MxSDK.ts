import {MfxModuleContextFuncs} from '@mfx-js/core/types'
import MfxExContext from './ExContext'
import FrameContext from './FrameContext'

export default class MfxSDK {
  constructor() {}

  private _ctx?: MfxModuleContextFuncs
  private _ensureFns?: Array<(ctx: MfxModuleContextFuncs) => void>

  /**
   * @brief 激活SDK
   * @param ctx 如果是iframe，传undefined参数；否则走的应该是本地模块
   */
  active(ctx?: MfxModuleContextFuncs) {
    if (!ctx) {
      if (window.top === window) {
        console.error('MfxSDK', 'warning: active native module need ctx!')
        return
      }
      this.activeEx(FrameContext)
    } else {
      this._ctx = ctx
      ctx.log('MfxSDK', 'active native module')

      this._ensureFns?.forEach(el => el(ctx))
      this._ensureFns = undefined
    }
  }

  get ctx() {
    return this._ctx
  }

  async ensure() {
    return new Promise<MfxModuleContextFuncs>(resolve => {
      if (this._ctx) {
        resolve(this._ctx)
        return
      }
      if (!this._ensureFns) this._ensureFns = []
      this._ensureFns.push(resolve)
    })
  }

  /**
   * @brief 实现扩展，比如Electron弹窗和住主窗口通信
   * @param className 上下文实现
   */
  activeEx<T extends MfxExContext>(className: {new (): T}) {
    const ctx = new className()
    ctx.ensure().then(() => {
      ctx.log('MfxSDK', 'activeEx.')

      this._ctx = ctx

      this._ensureFns?.forEach(el => el(ctx))
      this._ensureFns = undefined
    })
  }
}
