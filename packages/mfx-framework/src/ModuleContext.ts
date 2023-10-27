import {
  MxEventListener,
  MxLinkHandler,
  MxSlotHandler,
  MxContextHandler,
  MxService,
  MxModuleContextFuncs,
} from '@mfx-js/core/types'
import Logger from '@mfx-js/core/Logger'
import MxFrameworkContext from './privates/FrameworkContext'
import EventEmitter from '@mfx-js/core/EventEmitter'
import {MxDestructor} from './types'

export default class MxModuleContext implements MxModuleContextFuncs {
  constructor(moduleId: string, fwCtx: MxFrameworkContext, destructor: MxDestructor) {
    this.moduleId = moduleId
    this._fwCtx = fwCtx
    destructor.push(this.clearAll.bind(this))

    this.logger = new Logger(this.moduleId)
    this.logger.debug = fwCtx.options?.debug || false
  }

  readonly moduleId: string
  readonly logger: Logger

  private _fwCtx: MxFrameworkContext
  private _links?: [string, MxLinkHandler][]
  private _slots?: [string, string, MxSlotHandler][]
  private _listeners?: [string, MxEventListener][]
  private _ctxHandlers?: Record<string, MxContextHandler | undefined>
  private _ctxEmitter?: EventEmitter

  register(service: MxService) {
    this.logger.log('MxModuleContext', 'register: ', service.clazz)
    const {_fwCtx} = this

    return _fwCtx.services.register(this, service)
  }

  unregister(service: MxService) {
    this.logger.log('MxModuleContext', 'unregister: ', service.clazz)
    const {_fwCtx} = this

    _fwCtx.services.unregister(this, service)
  }

  link(clazz: string, linker: MxLinkHandler) {
    this.logger.log('MxModuleContext', 'link: ', clazz)
    const {_fwCtx} = this

    const l = _fwCtx.services.link(clazz, linker)
    if (!l) return

    if (!this._links) this._links = [[clazz, linker]]
    else if (!this._links.find(el => el[0] === clazz && el[1] === linker)) {
      this._links.push([clazz, linker])
    }

    _fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: MxLinkHandler) {
    this.logger.log('MxModuleContext', 'unlink: ', clazz)
    const {_fwCtx} = this

    _fwCtx.services.unlink(clazz, linker)

    this._links = this._links?.filter(el => !(el[0] === clazz && el[1] === linker))
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    this.logger.log('MxModuleContext', 'invoke: ', clazz, name, ...args)
    const {_fwCtx} = this

    return _fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: MxSlotHandler) {
    this.logger.log('MxModuleContext', 'connectSignal: ', clazz, signal)
    const {_fwCtx} = this

    const l = _fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this._slots) this._slots = [[clazz, signal, slot]]
    else if (!this._slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this._slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: MxSlotHandler) {
    this.logger.log('MxModuleContext', 'disconnectSignal: ', clazz, signal)
    const {_fwCtx} = this

    _fwCtx.services.disconnectSignal(clazz, signal, slot)

    this._slots = this._slots?.filter(el => !(el[0] === clazz && el[1] === signal && el[2] === slot))
  }

  addEventListener(event: string, listener: MxEventListener) {
    this.logger.log('MxModuleContext', 'addEventListener: ', event)
    const {_fwCtx} = this

    _fwCtx.events.addListener(event, listener)

    if (!this._listeners) this._listeners = [[event, listener]]
    else if (!this._listeners.find(el => el[0] === event && el[1] === listener)) {
      this._listeners.push([event, listener])
    }
  }

  removeEventListener(event: string, listener: MxEventListener) {
    this.logger.log('MxModuleContext', 'removeEventListener: ', event)
    const {_fwCtx} = this

    _fwCtx.events.removeListener(event, listener)

    this._listeners = this._listeners?.filter(el => !(el[0] === event && el[1] === listener))
  }

  postEvent(event: string, ...args: any[]) {
    this.logger.log('MxModuleContext', 'postEvent: ', event, ...args)
    const {_fwCtx} = this

    _fwCtx.events.postEvent(event, ...args)
  }

  log(name: string, ...args: any) {
    this.logger.log(name, ...args)
  }

  setCtxHandler(name: string, handler: MxContextHandler): void {
    if (!this._ctxHandlers) this._ctxHandlers = {[name]: handler}
    else if (!this._ctxHandlers[name]) {
      this._ctxHandlers[name] = handler
    }
  }

  async invokeCtx(name: string, ...args: any[]) {
    this.logger.log('MxModuleContext', 'invokeCtx: ', name, ...args)

    const fn = this._ctxHandlers?.[name]
    if (!fn) return undefined

    const result = await fn.call(this, ...args)
    return result
  }

  onCtxEvent(event: string, listener: MxEventListener): void {
    this.logger.log('MxModuleContext', 'onCtxEvent: ', event)

    if (!this._ctxEmitter) this._ctxEmitter = new EventEmitter()

    this._ctxEmitter.on(event, listener)
  }

  offCtxEvent(event: string, listener: MxEventListener): void {
    this.logger.log('MxModuleContext', 'offCtxEvent: ', event)

    this._ctxEmitter?.off(event, listener)
  }

  emitCtxEvent(event: string, ...args: any[]): void {
    this.logger.log('MxModuleContext', 'emitCtxEvent: ', event, ...args)

    this._ctxEmitter?.emit(event, ...args, event)
  }

  private clearAll() {
    this.logger.log('MxModuleContext', 'clearAll()')

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
