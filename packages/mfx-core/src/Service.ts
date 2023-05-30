import EventEmitter from './EventEmitter'
import {MxInvoker, MxSlotHandler} from './types'

export default class MxService {
  constructor(clazz: string) {
    this.clazz = clazz
  }

  readonly clazz: string
  private _invokers?: Record<string, MxInvoker>
  private _emitter = new EventEmitter()

  // Set invokable fn
  setInvoker(name: string, invoker: MxInvoker) {
    if (!this._invokers) this._invokers = {}
    this._invokers[name] = invoker
  }

  // Execute invoker
  async invoke(name: string, ...args: any[]) {
    const fn = this._invokers?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  // Signal
  connectSignal(signal: string, slot: MxSlotHandler) {
    if (!signal) return
    return this._emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: MxSlotHandler) {
    this._emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    return this._emitter.emit(signal, ...args, this.clazz, signal)
  }
}
