import McoService from '../Service'
import McoFrameworkContext from './FrameworkContext'
import {EventEmitter} from '@mco/utils'
import {McoServiceLinker, McoServiceSlot} from '../types'
import logger from './logger'

export default class McoServices {
  constructor(_fwCtx: McoFrameworkContext) {}

  private services?: Record<string, McoService>
  private emitter = new EventEmitter()

  getService(sId: string) {
    return this.services?.[sId]
  }

  register(service: McoService) {
    const sId = service.sId

    if (this.services?.[sId]) {
      logger.error('McoServices.register', 'Error: service exist!', sId)
      return false
    }

    this.services = this.services || {}
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

  link(sId: string, connn: McoServiceLinker) {
    if (!sId || typeof sId !== 'string') {
      logger.error('McoServices.connect', 'Error: sId invalid!', sId)
      return
    }

    return this.emitter.on(sId, connn)
  }

  unlink(sId: string, connn: McoServiceLinker) {
    this.emitter.off(sId, connn)
  }

  async invoke(uri: string, ...args: any[]) {
    const [sId, name] = uri.split('/')
    const service = this.getService(sId)

    if (!service) {
      logger.error('McoServices.invokeFunc', 'Error: service is null!', sId)
      return undefined
    }

    const result = await service.invoke(name, ...args)
    return result
  }

  connectSignal(uri: string, slot: McoServiceSlot) {
    const [sId, signal] = uri.split('/')
    const service = this.getService(sId)

    if (!service) {
      logger.error('McoServices.connectSignal', 'Error: service is null!', sId)
      return undefined
    }

    return service.connectSignal(signal, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const [sId, signal] = uri.split('/')

    const service = this.getService(sId)

    service?.disconnectSignal(signal, slot)
  }
}
