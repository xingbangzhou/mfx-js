import {MfxInvokableHandler, MfxSignalHandler} from './types'
import {EventEmitter} from '@mfx0/utils'

export default class MfxService {
  constructor(clazz: string) {
    this.clazz = clazz
  }

  readonly clazz: string

  private invokes?: Record<string, MfxInvokableHandler>
  private emitter = new EventEmitter()

  // Invoke
  invokable(name: string, func: MfxInvokableHandler) {
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
  connectSignal(signal: string, slot: MfxSignalHandler) {
    if (!signal) return

    return this.emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: MfxSignalHandler) {
    this.emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    return this.emitter.emit(signal, ...args, this.clazz, signal)
  }
}
