import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import McoModuleCleaner from './privates/ModuleCleaner'
import McoService from './Service'
import {McoModuleContextFuncs, McoServiceLinker, McoServiceSlot, McoEventListener} from './types'

export default class McoModuleContext implements McoModuleContextFuncs {
  constructor(module: McoModule, fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClear(this.clearAll)
  }

  readonly module: McoModule
  private fwCtx: McoFrameworkContext
  private linkers?: [string, McoServiceLinker][]
  private slots?: [string, string, McoServiceSlot][]
  private listeners?: [string, McoEventListener][]

  getId() {
    return this.module.id
  }

  register(service: McoService) {
    logger.log('McoModuleContext.register', service, this.module.id)

    const {fwCtx} = this

    return fwCtx.services.register(this, service)
  }

  unregister(service: McoService) {
    logger.log('McoModuleContext.unregister', service, this.module.id)

    const {fwCtx} = this

    fwCtx.services.unregister(this, service)
  }

  link(clazz: string, linker: McoServiceLinker) {
    logger.log('McoModuleContext.link', clazz, linker, this.module.id)

    const {fwCtx} = this

    const l = fwCtx.services.link(clazz, linker)
    if (!l) return

    if (!this.linkers) this.linkers = [[clazz, linker]]
    else if (!this.linkers.find(el => el[0] === clazz && el[1] === linker)) {
      this.linkers.push([clazz, linker])
    }

    fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: McoServiceLinker) {
    logger.log('McoModuleContext.unlink', clazz, linker, this.module.id)

    const {fwCtx} = this

    fwCtx.services.unlink(clazz, linker)

    this.linkers = this.linkers?.filter(el => el[0] === clazz && el[1] === linker)
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    logger.log('McoModuleContext.invoke', clazz, name, ...args, this.module.id)

    const {fwCtx} = this

    return fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    logger.log('McoModuleContext.connectSignal', clazz, signal, slot, this.module.id)

    const {fwCtx} = this

    const l = fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this.slots) this.slots = [[clazz, signal, slot]]
    else if (!this.slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this.slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    logger.log('McoModuleContext.disconnectSignal', clazz, signal, slot, this.module.id)

    const {fwCtx} = this

    fwCtx.services.disconnectSignal(clazz, signal, slot)

    this.slots = this.slots?.filter(el => el[0] !== clazz || el[1] !== signal || el[2] !== slot)
  }

  postEvent(event: string, ...args: any[]) {
    logger.log('McoModuleContext.postEvent', event, ...args)

    const {fwCtx} = this

    fwCtx.events.postEvent(event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener) {
    logger.log('McoModuleContext.addEventListener', event, listener, this.module.id)

    const {fwCtx} = this

    const l = fwCtx.events.addListener(event, listener)
    if (!l) return

    if (!this.listeners) this.listeners = [[event, listener]]
    else if (!this.listeners.find(el => el[0] === event && el[1] === listener)) {
      this.listeners.push([event, listener])
    }
  }

  removeEventListener(event: string, listener: McoEventListener) {
    logger.log('McoModuleContext.removeEventListener', event, listener, this.module.id)

    const {fwCtx} = this

    fwCtx.events.removeListener(event, listener)

    this.listeners = this.listeners?.filter(el => el[0] === event && el[1] === listener)
  }

  private clearAll = () => {
    logger.log('McoModuleContext.clearAll', this.module.id)

    const {fwCtx} = this

    this.listeners?.forEach(el => fwCtx.events.removeListener(el[0], el[1]))
    this.listeners = undefined

    this.slots?.forEach(el => fwCtx.services.disconnectSignal(el[0], el[1], el[2]))
    this.slots = undefined

    this.linkers?.forEach(el => fwCtx.services.unlink(el[0], el[1]))
    this.linkers = undefined

    fwCtx.services.unregisterAll(this)
  }
}
