import FrameContext from './privates/FrameContext'
import {McoModuleContextFuncs} from './types'

interface EnsureFn {
  (ctx: McoModuleContextFuncs): void
}

export default class McoBinder {
  constructor() {
    if (window['mco.framework']) return
    // Frame
    if (window.top !== window) {
      this.active(FrameContext.instance())
    }
  }

  private _ctx?: McoModuleContextFuncs
  private fns?: EnsureFn[]

  get ctx() {
    return this._ctx
  }

  // 执行
  ensure(fn: EnsureFn) {
    if (!this.ctx) {
      if (!this.fns) this.fns = [fn]
      else if (!this.fns.includes(fn)) {
        this.fns.push(fn)
      }
      return
    }

    fn(this.ctx)
  }

  remove(fn: EnsureFn) {
    this.fns = this.fns?.filter(el => el !== fn)
  }

  // Warning: 由框架来激活
  active(ctx: McoModuleContextFuncs | undefined) {
    if (!ctx) return

    this._ctx = ctx

    this.fns?.forEach(el => el(ctx))
    this.fns = undefined
  }
}
