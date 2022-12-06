import {McoServiceInvoke, McoServiceSlot} from './types'
import {EventEmitter} from '@mco/utils'

export default class McoService {
  constructor(clazz: string) {
    this.clazz = clazz
  }

  readonly clazz: string

  private invokes?: Record<string, McoServiceInvoke>
  private emitter = new EventEmitter()

  // Invoke
  registerInvoke(name: string, func: McoServiceInvoke) {
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
  connectSignal(signal: string, slot: McoServiceSlot) {
    if (!signal) return

    this.emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: McoServiceSlot) {
    this.emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    return this.emitter.emit(signal, this.clazz, signal, ...args)
  }
}
