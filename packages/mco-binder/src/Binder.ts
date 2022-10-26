import IFrameContext from './privates/FrameContext'
import {McoModuleContextFuncs} from './types'

export interface McoDoingFn {
  (): void
}

export default class McoBinder {
  constructor() {
    if (window['mco.framework']) return
    // Frame
    if (window.top !== window) {
      this.active(IFrameContext.instance())
    }
  }

  private _ctx?: McoModuleContextFuncs
  private dfns?: McoDoingFn[]

  get ctx() {
    return this._ctx
  }

  // 确保激活状态下执行
  doing(fn: McoDoingFn) {
    if (this._ctx) {
      fn()
      return
    }
    // Cache
    if (!this.dfns) this.dfns = [fn]
    else if (!this.dfns.includes(fn)) {
      this.dfns.push(fn)
    }
  }

  clearFn(fn: McoDoingFn) {
    this.dfns = this.dfns?.filter(el => el !== fn)
  }

  // Warning: 由框架来激活
  active(ctx: McoModuleContextFuncs) {
    this._ctx = ctx
    this.dfns?.forEach(el => el())
    this.dfns = undefined
  }
}
