import MscxModule from './Module'
import MscxFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import MscxModuleCleaner from './privates/ModuleCleaner'
import MscxService from './Service'
import {MscxModuleContextFuncs, MscxLinkFn, MscxSlotFn, MscxEventListener} from './types'

export default class MscxModuleContext implements MscxModuleContextFuncs {
  constructor(module: MscxModule, fwCtx: MscxFrameworkContext, cleaner: MscxModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClearFn(this.clearAll)
  }

  readonly module: MscxModule
  private fwCtx: MscxFrameworkContext
  private linkers?: [string, MscxLinkFn][]
  private slots?: [string, string, MscxSlotFn][]
  private listeners?: [string, MscxEventListener][]

  getId() {
    return this.module.id
  }

  register(service: MscxService) {
    logger.log('MscxModuleContext', 'register: ', service, this.module.id)
    const {fwCtx} = this

    return fwCtx.services.register(this, service)
  }

  unregister(service: MscxService) {
    logger.log('MscxModuleContext', 'unregister: ', service, this.module.id)
    const {fwCtx} = this

    fwCtx.services.unregister(this, service)
  }

  link(clazz: string, linker: MscxLinkFn) {
    logger.log('MscxModuleContext', 'link: ', clazz, linker, this.module.id)
    const {fwCtx} = this

    const l = fwCtx.services.link(clazz, linker)
    if (!l) return

    if (!this.linkers) this.linkers = [[clazz, linker]]
    else if (!this.linkers.find(el => el[0] === clazz && el[1] === linker)) {
      this.linkers.push([clazz, linker])
    }

    fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: MscxLinkFn) {
    logger.log('MscxModuleContext', 'unlink: ', clazz, linker, this.module.id)
    const {fwCtx} = this

    fwCtx.services.unlink(clazz, linker)

    this.linkers = this.linkers?.filter(el => el[0] === clazz && el[1] === linker)
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    logger.log('MscxModuleContext', 'invoke: ', clazz, name, ...args, this.module.id)
    const {fwCtx} = this

    return fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: MscxSlotFn) {
    logger.log('MscxModuleContext', 'connectSignal: ', clazz, signal, slot, this.module.id)
    const {fwCtx} = this

    const l = fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this.slots) this.slots = [[clazz, signal, slot]]
    else if (!this.slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this.slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: MscxSlotFn) {
    logger.log('MscxModuleContext', 'disconnectSignal: ', clazz, signal, slot, this.module.id)
    const {fwCtx} = this

    fwCtx.services.disconnectSignal(clazz, signal, slot)

    this.slots = this.slots?.filter(el => el[0] !== clazz || el[1] !== signal || el[2] !== slot)
  }

  postEvent(event: string, ...args: any[]) {
    logger.log('MscxModuleContext', 'postEvent: ', event, ...args)
    const {fwCtx} = this

    fwCtx.events.postEvent(event, ...args)
  }

  addEventListener(event: string, listener: MscxEventListener) {
    logger.log('MscxModuleContext', 'addEventListener: ', event, listener, this.module.id)
    const {fwCtx} = this

    fwCtx.events.addListener(event, listener)

    if (!this.listeners) this.listeners = [[event, listener]]
    else if (!this.listeners.find(el => el[0] === event && el[1] === listener)) {
      this.listeners.push([event, listener])
    }
  }

  removeEventListener(event: string, listener: MscxEventListener) {
    logger.log('MscxModuleContext', 'removeEventListener: ', event, listener, this.module.id)
    const {fwCtx} = this

    fwCtx.events.removeListener(event, listener)

    this.listeners = this.listeners?.filter(el => el[0] === event && el[1] === listener)
  }

  private clearAll = () => {
    logger.log('MscxModuleContext', 'clearAll: ', this.module.id)

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
