import {McoServiceInvoke, McoServiceSlot} from './types'
import {EventEmitter} from '@mco/utils'

export default class McoService {
  constructor(sId: string) {
    this.sId = sId
  }

  private invs?: Record<string, McoServiceInvoke>
  private emitter = new EventEmitter()

  readonly sId: string

  // Invoke
  registerInvoke(name: string, method: McoServiceInvoke) {
    if (!this.invs) this.invs = {}
    this.invs[name] = method
  }

  async invoke(name: string, ...args: any[]) {
    const method = this.invs?.[name]
    if (!method) return undefined

    const result = await method.call(this, ...args)

    return result
  }

  // Signal
  connectSignal(signal: string, slot: McoServiceSlot) {
    if (!signal) return

    return this.emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: McoServiceSlot) {
    this.emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    this.emitter.emit(signal, `${this.sId}/${signal}`, ...args)
  }
}
