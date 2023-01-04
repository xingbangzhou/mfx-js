import MfxFrameworkContext from './FrameworkContext'
import MfxModuleContext from '../ModuleContext'
import {MfxLinkHandler, MfxService, MfxSignalHandler} from '@mfx0/base'
import {EventEmitter} from '@mfx0/utils'

interface ServiceRegistration {
  ctx: MfxModuleContext
  service: MfxService
}

export default class MfxServices {
  constructor(fwCtx: MfxFrameworkContext) {
    fwCtx
  }

  private emitter = new EventEmitter()
  private regns?: Record<string, ServiceRegistration>
  private slots?: Record<string, [string, MfxSignalHandler][]>

  getService(clazz: string) {
    return this.regns?.[clazz]?.service
  }

  register(ctx: MfxModuleContext, service: MfxService) {
    const clazz = service.clazz

    if (this.regns?.[clazz]) {
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

  unregister(ctx: MfxModuleContext, service: MfxService) {
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

  unregisterAll(ctx: MfxModuleContext) {
    const regns = {...this.regns}

    for (const clazz in regns) {
      if (regns[clazz].ctx === ctx) {
        const service = regns[clazz].service
        this.unregister(ctx, service)
      }
    }
  }

  link(clazz: string, connn: MfxLinkHandler) {
    return this.emitter.on(clazz, connn)
  }

  unlink(clazz: string, connn: MfxLinkHandler) {
    this.emitter.off(clazz, connn)
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    const service = this.getService(clazz)

    if (!service) {
      return undefined
    }

    const result = await service.invoke(name, ...args)
    return result
  }

  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    if (!this.slots) this.slots = {}
    const ss = this.slots[clazz] || []
    if (!ss.find(el => el[0] === signal && el[1] === slot)) {
      ss.push([signal, slot])
    }
    this.slots[clazz] = ss

    const service = this.getService(clazz)
    if (service) {
      service.connectSignal(signal, slot)
    }

    return true
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
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
