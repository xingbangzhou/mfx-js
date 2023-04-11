import EventEmitter from './EventEmitter'
import {MxInvokableFn, MxSlotFn} from './types'

export default class MxService {
  constructor(clazz: string) {
    this.clazz = clazz
  }

  readonly clazz: string
  private _invokes?: Record<string, MxInvokableFn>
  private _emitter = new EventEmitter()

  // Invoke
  invokable(name: string, func: MxInvokableFn) {
    if (!this._invokes) this._invokes = {}
    this._invokes[name] = func
  }

  async invoke(name: string, ...args: any[]) {
    const fn = this._invokes?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  // Signal
  connectSignal(signal: string, slot: MxSlotFn) {
    if (!signal) return
    return this._emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: MxSlotFn) {
    this._emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    return this._emitter.emit(signal, ...args, this.clazz, signal)
  }
}
