import McoService from '../Service'
import McoFrameworkContext from './FrameworkContext'
import {EventEmitter} from '@mco/utils'
import {McoServiceLinker, McoServiceSlot} from '../types'
import logger from './logger'

export default class McoServices {
  constructor(_fwCtx: McoFrameworkContext) {}

  private services?: Record<string, McoService>
  private emitter = new EventEmitter()
  private slots?: Record<string, [string, McoServiceSlot][]>

  getService(sId: string) {
    return this.services?.[sId]
  }

  register(service: McoService) {
    const sId = service.sId

    if (this.services?.[sId]) {
      logger.warn('McoServices.register', 'Error: service duplicated!', sId)
      return false
    }

    this.services = this.services || {}
    this.services[sId] = service

    // Signal
    const l = this.slots?.[sId]
    l?.forEach(el => {
      service.connectSignal(el[0], el[1])
    })

    this.emitter.emit(sId, true, sId)

    return true
  }

  unregister(service: McoService) {
    const sId = service.sId
    if (this.services?.[sId] !== service) return

    // Signal
    const l = this.slots?.[sId]
    l?.forEach(el => {
      service.disconnectSignal(el[0], el[1])
    })

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
    if (!sId || !signal) {
      logger.error('McoServices.connectSignal', 'Error: uri is invalid!', uri)
      return
    }

    if (!this.slots) this.slots = {}
    const l = this.slots[sId] || []
    if (!l.find(el => el[0] === signal && el[1] === slot)) {
      l.push([signal, slot])
    }
    this.slots[sId] = l

    const service = this.getService(sId)
    if (service) {
      service.connectSignal(signal, slot)
    } else {
      logger.warn('McoServices.connectSignal', 'Warn: service is null!', sId)
    }

    return true
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const [sId, signal] = uri.split('/')

    const l = this.slots?.[sId]
    if (!l) return
    const idx = l.findIndex(el => el[0] === signal && el[1] === slot)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.slots?.[sId]
      }
    }

    const service = this.getService(sId)
    service?.disconnectSignal(signal, slot)
  }
}
