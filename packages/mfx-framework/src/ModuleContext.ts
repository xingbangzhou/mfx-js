import {
  MfxEventListener,
  MfxLinkHandler,
  MfxSlotHandler,
  MfxContextHandler,
  MfxService,
  MfxModuleContextFuncs,
} from '@mfx-js/core/types'
import Logger from '@mfx-js/core/Logger'
import MfxFrameworkContext from './privates/FrameworkContext'
import EventEmitter from '@mfx-js/core/EventEmitter'
import {MfxDestructor} from './types'

export default class MfxModuleContext implements MfxModuleContextFuncs {
  constructor(moduleId: string, fwCtx: MfxFrameworkContext, destructor: MfxDestructor) {
    this.moduleId = moduleId
    this._fwCtx = fwCtx
    destructor.push(this.clearAll.bind(this))

    this.logger = new Logger(this.moduleId)
    this.logger.debug = fwCtx.options?.debug || false
  }

  readonly moduleId: string
  readonly logger: Logger

  private _fwCtx: MfxFrameworkContext
  private _links?: [string, MfxLinkHandler][]
  private _slots?: [string, string, MfxSlotHandler][]
  private _listeners?: [string, MfxEventListener][]
  private _ctxHandlers?: Record<string, MfxContextHandler | undefined>
  private _ctxEmitter?: EventEmitter

  register(service: MfxService) {
    this.logger.log('MfxModuleContext', 'register: ', service.clazz)
    const {_fwCtx} = this

    return _fwCtx.services.register(this, service)
  }

  unregister(service: MfxService) {
    this.logger.log('MfxModuleContext', 'unregister: ', service.clazz)
    const {_fwCtx} = this

    _fwCtx.services.unregister(this, service)
  }

  link(clazz: string, linker: MfxLinkHandler) {
    this.logger.log('MfxModuleContext', 'link: ', clazz)
    const {_fwCtx} = this

    const l = _fwCtx.services.link(clazz, linker)
    if (!l) return

    if (!this._links) this._links = [[clazz, linker]]
    else if (!this._links.find(el => el[0] === clazz && el[1] === linker)) {
      this._links.push([clazz, linker])
    }

    _fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: MfxLinkHandler) {
    this.logger.log('MfxModuleContext', 'unlink: ', clazz)
    const {_fwCtx} = this

    _fwCtx.services.unlink(clazz, linker)

    this._links = this._links?.filter(el => !(el[0] === clazz && el[1] === linker))
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    this.logger.log('MfxModuleContext', 'invoke: ', clazz, name, ...args)
    const {_fwCtx} = this

    return _fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: MfxSlotHandler) {
    this.logger.log('MfxModuleContext', 'connectSignal: ', clazz, signal)
    const {_fwCtx} = this

    const l = _fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this._slots) this._slots = [[clazz, signal, slot]]
    else if (!this._slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this._slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSlotHandler) {
    this.logger.log('MfxModuleContext', 'disconnectSignal: ', clazz, signal)
    const {_fwCtx} = this

    _fwCtx.services.disconnectSignal(clazz, signal, slot)

    this._slots = this._slots?.filter(el => !(el[0] === clazz && el[1] === signal && el[2] === slot))
  }

  addEventListener(event: string, listener: MfxEventListener) {
    this.logger.log('MfxModuleContext', 'addEventListener: ', event)
    const {_fwCtx} = this

    _fwCtx.events.addListener(event, listener)

    if (!this._listeners) this._listeners = [[event, listener]]
    else if (!this._listeners.find(el => el[0] === event && el[1] === listener)) {
      this._listeners.push([event, listener])
    }
  }

  removeEventListener(event: string, listener: MfxEventListener) {
    this.logger.log('MfxModuleContext', 'removeEventListener: ', event)
    const {_fwCtx} = this

    _fwCtx.events.removeListener(event, listener)

    this._listeners = this._listeners?.filter(el => !(el[0] === event && el[1] === listener))
  }

  postEvent(event: string, ...args: any[]) {
    this.logger.log('MfxModuleContext', 'postEvent: ', event, ...args)
    const {_fwCtx} = this

    _fwCtx.events.postEvent(event, ...args)
  }

  log(name: string, ...args: any) {
    this.logger.log(name, ...args)
  }

  ctxSetHandler(name: string, handler: MfxContextHandler): void {
    if (!this._ctxHandlers) this._ctxHandlers = {[name]: handler}
    else if (!this._ctxHandlers[name]) {
      this._ctxHandlers[name] = handler
    }
  }

  async ctxInvoke(name: string, ...args: any[]) {
    this.logger.log('MfxModuleContext', 'ctxInvoke: ', name, ...args)

    const fn = this._ctxHandlers?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  ctxOnEvent(event: string, listener: MfxEventListener): void {
    this.logger.log('MfxModuleContext', 'ctxOnEvent: ', event)

    if (!this._ctxEmitter) this._ctxEmitter = new EventEmitter()

    this._ctxEmitter.on(event, listener)
  }

  ctxOffEvent(event: string, listener: MfxEventListener): void {
    this.logger.log('MfxModuleContext', 'ctxOffEvent: ', event)

    this._ctxEmitter?.off(event, listener)
  }

  ctxEmitEvent(event: string, ...args: any[]): void {
    this.logger.log('MfxModuleContext', 'ctxEmitEvent: ', event, ...args)

    this._ctxEmitter?.emit(event, ...args, event)
  }

  private clearAll() {
    this.logger.log('MfxModuleContext', 'clearAll()')

    const {_fwCtx} = this

    this._listeners?.forEach(el => _fwCtx.events.removeListener(el[0], el[1]))
    this._listeners = undefined

    this._slots?.forEach(el => _fwCtx.services.disconnectSignal(el[0], el[1], el[2]))
    this._slots = undefined

    this._links?.forEach(el => _fwCtx.services.unlink(el[0], el[1]))
    this._links = undefined

    _fwCtx.services.unregisterAll(this)

    this._ctxHandlers = undefined
    this._ctxEmitter = undefined
  }
}
