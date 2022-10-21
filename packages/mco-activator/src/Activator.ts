import IFrameContext from './privates/FrameContext'
import {McoModuleContextFuncs} from './types'

export interface McoActivedFn {
  (): void
}

export default class McoActivator {
  constructor() {
    if (window['mco.framework']) return
    // Frame
    if (window.top !== window) {
      this.active(IFrameContext.instance())
    }
  }

  private _ctx?: McoModuleContextFuncs
  private afns?: McoActivedFn[]

  get ctx() {
    return this._ctx
  }

  // 确保激活状态下执行
  onActived(fn: McoActivedFn) {
    if (this._ctx) {
      fn()
      return
    }
    // Cache
    if (!this.afns) this.afns = [fn]
    else if (!this.afns.includes(fn)) {
      this.afns.push(fn)
    }
  }

  clearFn(fn: McoActivedFn) {
    this.afns = this.afns?.filter(el => el !== fn)
  }

  // Warning: 由框架来激活
  active(ctx: McoModuleContextFuncs) {
    this._ctx = ctx
    this.afns?.forEach(el => el())
    this.afns = undefined
  }
}
