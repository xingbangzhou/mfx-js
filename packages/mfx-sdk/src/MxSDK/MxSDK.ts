import {MxModuleContextFuncs} from '@mfx-js/core/types'
import MxExContext from './ExContext'
import FrameContext from './FrameContext'

export default class MxSDK {
  constructor() {
    // 主应用启动框架标志
    if ((window as any)['_MxFramework_']) return
    // Auto active IFrame
    if (window.top !== window) {
      this.activeEx(FrameContext)
    }
  }

  private _ctx?: MxModuleContextFuncs
  private _ensureFns?: Array<(ctx: MxModuleContextFuncs) => void>

  get ctx() {
    return this._ctx
  }

  async ensure() {
    return new Promise<MxModuleContextFuncs>(resolve => {
      if (this._ctx) {
        resolve(this._ctx)
        return
      }
      if (!this._ensureFns) this._ensureFns = []
      this._ensureFns.push(resolve)
    })
  }

  // 通过外部激活上下文，类如qiankun架构
  active(ctx: MxModuleContextFuncs) {
    ctx.log('MxSDK', 'active()')

    this._ctx = ctx

    this._ensureFns?.forEach(el => el(ctx))
    this._ensureFns = undefined
  }

  activeEx<T extends MxExContext>(className: {new (): T}) {
    const ctx = new className()
    ctx.ensure().then(() => {
      ctx.log('MxSDK', 'activeEx()')

      this._ctx = ctx

      this._ensureFns?.forEach(el => el(ctx))
      this._ensureFns = undefined
    })
  }
}
