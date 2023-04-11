import {MxModuleContextFuncs} from '@mfx0/core/types'
import YoExContext from './ExContext'
import FrameContext from './FrameContext'

export default class MxSDK {
  constructor() {
    // 主应用启动框架标志
    if ((window as any)['__MxFramework__']) return
    // Frame Module
    if (window.top !== window) {
      this.activeEx(FrameContext.instance())
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
    this._ctx = ctx
    ctx.log('MxSDK', 'active is successed!')

    this._ensureFns?.forEach(el => el(ctx))
    this._ensureFns = undefined
  }

  private activeEx(ctx: YoExContext) {
    ctx.ensure().then(() => {
      this._ctx = ctx
      ctx.log('MxSDK', 'activeEx is successed!')

      this._ensureFns?.forEach(el => el(ctx))
      this._ensureFns = undefined
    })
  }
}
