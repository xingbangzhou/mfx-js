import {
  MfxEventListener,
  MfxLinkHandler,
  MfxModuleContextFuncs,
  MfxService,
  MfxSignalHandler,
  MfxContextExecutor,
} from '@mfx0/base'
import {Logger} from '@mfx0/utils'
import MfxModule from './Module'
import MfxFrameworkContext from './privates/FrameworkContext'
import MfxModuleCleaner from './privates/ModuleCleaner'

export default class MfxModuleContext implements MfxModuleContextFuncs {
  constructor(module: MfxModule, fwCtx: MfxFrameworkContext, cleaner: MfxModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClearFn(this.clearAll)

    this.logger = new Logger('MfxModuleContext', this.module.id)
  }

  private module: MfxModule
  private fwCtx: MfxFrameworkContext
  private linkers?: [string, MfxLinkHandler][]
  private slots?: [string, string, MfxSignalHandler][]
  private listeners?: [string, MfxEventListener][]
  private executors?: Record<string, MfxContextExecutor | undefined>

  readonly logger: Logger

  get moduleId() {
    return this.module.id
  }

  register(service: MfxService) {
    this.logger.log('register: ', service)
    const {fwCtx} = this

    return fwCtx.services.register(this, service)
  }

  unregister(service: MfxService) {
    this.logger.log('unregister: ', service)
    const {fwCtx} = this

    fwCtx.services.unregister(this, service)
  }

  link(clazz: string, linker: MfxLinkHandler) {
    this.logger.log('link: ', clazz, linker)
    const {fwCtx} = this

    const l = fwCtx.services.link(clazz, linker)
    if (!l) return

    if (!this.linkers) this.linkers = [[clazz, linker]]
    else if (!this.linkers.find(el => el[0] === clazz && el[1] === linker)) {
      this.linkers.push([clazz, linker])
    }

    fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: MfxLinkHandler) {
    this.logger.log('unlink: ', clazz, linker)
    const {fwCtx} = this

    fwCtx.services.unlink(clazz, linker)

    this.linkers = this.linkers?.filter(el => !(el[0] === clazz && el[1] === linker))
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    this.logger.log('invoke: ', clazz, name, ...args)
    const {fwCtx} = this

    return fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    this.logger.log('connectSignal: ', clazz, signal, slot)
    const {fwCtx} = this

    const l = fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this.slots) this.slots = [[clazz, signal, slot]]
    else if (!this.slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this.slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    this.logger.log('disconnectSignal: ', clazz, signal, slot)
    const {fwCtx} = this

    fwCtx.services.disconnectSignal(clazz, signal, slot)

    this.slots = this.slots?.filter(el => !(el[0] === clazz && el[1] === signal && el[2] === slot))
  }

  addEventListener(event: string, listener: MfxEventListener) {
    this.logger.log('addEventListener: ', event, listener)
    const {fwCtx} = this

    fwCtx.events.addListener(event, listener)

    if (!this.listeners) this.listeners = [[event, listener]]
    else if (!this.listeners.find(el => el[0] === event && el[1] === listener)) {
      this.listeners.push([event, listener])
    }
  }

  removeEventListener(event: string, listener: MfxEventListener) {
    this.logger.log('removeEventListener: ', event, listener)
    const {fwCtx} = this

    fwCtx.events.removeListener(event, listener)

    this.listeners = this.listeners?.filter(el => !(el[0] === event && el[1] === listener))
  }

  postEvent(event: string, ...args: any[]) {
    this.logger.log('postEvent: ', event, ...args)
    const {fwCtx} = this

    fwCtx.events.postEvent(event, ...args)
  }

  setExecutor(name: string, executor?: MfxContextExecutor) {
    if (!this.executors) this.executors = {[name]: executor}
    else if (!this.executors[name]) {
      this.executors[name] = executor
    }
  }

  async execute(name: string, ...args: any[]) {
    const fn = this.executors?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  private clearAll = () => {
    this.logger.log('clearAll.')

    const {fwCtx} = this

    this.listeners?.forEach(el => fwCtx.events.removeListener(el[0], el[1]))
    this.listeners = undefined

    this.slots?.forEach(el => fwCtx.services.disconnectSignal(el[0], el[1], el[2]))
    this.slots = undefined

    this.linkers?.forEach(el => fwCtx.services.unlink(el[0], el[1]))
    this.linkers = undefined

    fwCtx.services.unregisterAll(this)

    this.executors = undefined
  }
}
