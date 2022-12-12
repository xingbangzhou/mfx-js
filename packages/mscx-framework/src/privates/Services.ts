import MscxService from '../Service'
import MscxFrameworkContext from './FrameworkContext'
import {EventEmitter} from '@mscx/utils'
import {MscxLinkFn, MscxSlotFn} from '../types'
import logger from './logger'
import MscxModuleContext from '../ModuleContext'

interface ServiceRegistration {
  ctx: MscxModuleContext
  service: MscxService
}

export default class MscxServices {
  constructor(fwCtx: MscxFrameworkContext) {
    fwCtx
  }

  private emitter = new EventEmitter()
  private regns?: Record<string, ServiceRegistration>
  private slots?: Record<string, [string, MscxSlotFn][]>

  getService(clazz: string) {
    return this.regns?.[clazz]?.service
  }

  register(ctx: MscxModuleContext, service: MscxService) {
    const clazz = service.clazz

    if (this.regns?.[clazz]) {
      logger.warn('MscxServices', 'register: ', 'service duplicated,', clazz, ctx.getId())
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

  unregister(ctx: MscxModuleContext, service: MscxService) {
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

  unregisterAll(ctx: MscxModuleContext) {
    const regns = {...this.regns}

    for (const clazz in regns) {
      if (regns[clazz].ctx === ctx) {
        const service = regns[clazz].service
        this.unregister(ctx, service)
      }
    }
  }

  link(clazz: string, connn: MscxLinkFn) {
    return this.emitter.on(clazz, connn)
  }

  unlink(clazz: string, connn: MscxLinkFn) {
    this.emitter.off(clazz, connn)
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    const service = this.getService(clazz)

    if (!service) {
      logger.error('MscxServices', 'invokeFunc: ', 'service is null,', clazz)
      return undefined
    }

    const result = await service.invoke(name, ...args)
    return result
  }

  connectSignal(clazz: string, signal: string, slot: MscxSlotFn) {
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
      logger.warn('MscxServices', 'connectSignal: ', 'service is null,', clazz)
    }

    return true
  }

  disconnectSignal(clazz: string, signal: string, slot: MscxSlotFn) {
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
