import McoService from '../Service'
import McoFrameworkContext from './FrameworkContext'
import {EventEmitter} from '@mco/utils'
import {McoServiceConnn, McoServiceSlot} from '../types'

export default class McoServices {
  constructor(fwCtx: McoFrameworkContext) {
    this.fwCtx = fwCtx
  }

  private fwCtx: McoFrameworkContext
  private services?: Record<string, McoService>
  private emitter = new EventEmitter()

  getService(sId: string) {
    return this.services?.[sId]
  }

  register(service: McoService) {
    if (!this.services) this.services = {}

    const sId = service.sId
    if (this.services[sId]) return false

    this.services[sId] = service

    this.emitter.emit(sId, true, sId)

    return true
  }

  unregister(service: McoService) {
    const sId = service.sId
    if (this.services?.[sId] !== service) return

    delete this.services[sId]

    this.emitter.emit(sId, false, sId)
  }

  connect(sId: string, connn: McoServiceConnn) {
    return this.emitter.on(sId, connn)
  }

  disconnect(sId: string, connn: McoServiceConnn) {
    this.emitter.off(sId, connn)
  }

  connectSignal(uri: string, slot: McoServiceSlot) {
    const [sId, signal] = uri.split('/')

    const service = this.getService(sId)

    return service?.connectSignal(signal, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const [sId, signal] = uri.split('/')

    const service = this.getService(sId)

    service?.disconnectSignal(signal, slot)
  }
}
