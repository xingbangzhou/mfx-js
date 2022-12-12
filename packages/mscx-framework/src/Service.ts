import {MscxInvokeFn, MscxSlotFn} from './types'
import {EventEmitter} from '@mscx/utils'

export default class MscxService {
  constructor(clazz: string) {
    this.clazz = clazz
  }

  readonly clazz: string

  private invokes?: Record<string, MscxInvokeFn>
  private emitter = new EventEmitter()

  // Invoke
  registerInvoke(name: string, func: MscxInvokeFn) {
    if (!this.invokes) this.invokes = {}
    this.invokes[name] = func
  }

  async invoke(name: string, ...args: any[]) {
    const fn = this.invokes?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  // Signal
  connectSignal(signal: string, slot: MscxSlotFn) {
    if (!signal) return

    this.emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: MscxSlotFn) {
    this.emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    return this.emitter.emit(signal, this.clazz, signal, ...args)
  }
}
