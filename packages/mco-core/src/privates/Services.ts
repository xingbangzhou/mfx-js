import McoService from '../Service'
import McoFrameworkContext from './FrameworkContext'
import {EventEmitter} from '@mco/utils'
import {McoServiceLinker, McoServiceSlot} from '../types'
import logger from './logger'
import McoModuleContext from '../ModuleContext'

interface ServiceRegistration {
  ctx: McoModuleContext
  service: McoService
}

export default class McoServices {
  constructor(fwCtx: McoFrameworkContext) {
    fwCtx
  }

  private emitter = new EventEmitter()
  private regns?: Record<string, ServiceRegistration>
  private slots?: Record<string, [string, McoServiceSlot][]>

  getService(clazz: string) {
    return this.regns?.[clazz]?.service
  }

  register(ctx: McoModuleContext, service: McoService) {
    const clazz = service.clazz

    if (this.regns?.[clazz]) {
      logger.warn('McoServices', 'register: ', 'service duplicated,', clazz, ctx.getId())
      return false
    }

    this.regns = this.regns || {}
    this.regns[clazz] = {ctx, service}

    // Signal
    const l = this.slots?.[clazz]
    l?.forEach(el => {
      service.connectSignal(el[0], el[1])
    })

    this.emitter.emit(clazz, true, clazz)

    return true
  }

  unregister(ctx: McoModuleContext, service: McoService) {
    const clazz = service.clazz
    const regn = this.regns?.[clazz]
    if (regn?.ctx !== ctx || regn?.service !== service) return

    // Signal
    const l = this.slots?.[clazz]
    l?.forEach(el => {
      service.disconnectSignal(el[0], el[1])
    })

    delete this.regns?.[clazz]
    this.emitter.emit(clazz, false, clazz)
  }

  unregisterAll(ctx: McoModuleContext) {
    const regns = {...this.regns}

    for (const clazz in regns) {
      if (regns[clazz].ctx === ctx) {
        const service = regns[clazz].service
        this.unregister(ctx, service)
      }
    }
  }

  link(clazz: string, connn: McoServiceLinker) {
    return this.emitter.on(clazz, connn)
  }

  unlink(clazz: string, connn: McoServiceLinker) {
    this.emitter.off(clazz, connn)
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    const service = this.getService(clazz)

    if (!service) {
      logger.error('McoServices', 'invokeFunc: ', 'service is null,', clazz)
      return undefined
    }

    const result = await service.invoke(name, ...args)
    return result
  }

  connectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    if (!this.slots) this.slots = {}
    const ss = this.slots[clazz] || []
    if (!ss.find(el => el[0] === signal && el[1] === slot)) {
      ss.push([signal, slot])
    }
    this.slots[clazz] = ss

    const service = this.getService(clazz)
    if (service) {
      service.connectSignal(signal, slot)
    } else {
      logger.warn('McoServices', 'connectSignal: ', 'service is null,', clazz)
    }

    return true
  }

  disconnectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    const ss = this.slots?.[clazz]
    if (!ss) return

    const idx = ss.findIndex(el => el[0] === signal && el[1] === slot)
    if (idx !== -1) {
      ss.splice(idx, 1)
      if (!ss.length) {
        delete this.slots?.[clazz]
      }
    }

    const service = this.getService(clazz)
    service?.disconnectSignal(signal, slot)
  }
}
