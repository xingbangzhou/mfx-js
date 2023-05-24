import {MxEventListener, MxLinkHandler, MxSlotFn, MxModuleContextFuncs} from '@mfx0/core/types'
import MxService from '@mfx0/core/Service'
import Logger from '@mfx0/core/Logger'
import MxModule from './Module'
import MxFrameworkContext from './privates/FrameworkContext'
import MxModuleDestructor from './privates/ModuleDestructor'

export default class MxModuleContext implements MxModuleContextFuncs {
  constructor(module: MxModule, fwCtx: MxFrameworkContext, destructor: MxModuleDestructor) {
    this._module = module
    this._fwCtx = fwCtx
    destructor.push(this.clearAll.bind(this))

    this.logger = new Logger(this._module.id)
  }

  readonly logger: Logger

  private _module: MxModule
  private _fwCtx: MxFrameworkContext
  private _linkers?: [string, MxLinkHandler][]
  private _slots?: [string, string, MxSlotFn][]
  private _listeners?: [string, MxEventListener][]

  // private _exFuncs?: Record<string, YoContextFunction | undefined>
  // private _thisEmitter?: EventEmitter

  get moduleId() {
    return this._module.id
  }

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

    if (!this._linkers) this._linkers = [[clazz, linker]]
    else if (!this._linkers.find(el => el[0] === clazz && el[1] === linker)) {
      this._linkers.push([clazz, linker])
    }

    _fwCtx.services.getService(clazz) && linker(true, clazz)
  }

  unlink(clazz: string, linker: MxLinkHandler) {
    this.logger.log('MxModuleContext', 'unlink: ', clazz)
    const {_fwCtx} = this

    _fwCtx.services.unlink(clazz, linker)

    this._linkers = this._linkers?.filter(el => !(el[0] === clazz && el[1] === linker))
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    this.logger.log('MxModuleContext', 'invoke: ', clazz, name, ...args)
    const {_fwCtx} = this

    return _fwCtx.services.invoke(clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: MxSlotFn) {
    this.logger.log('MxModuleContext', 'connectSignal: ', clazz, signal)
    const {_fwCtx} = this

    const l = _fwCtx.services.connectSignal(clazz, signal, slot)
    if (!l) return

    if (!this._slots) this._slots = [[clazz, signal, slot]]
    else if (!this._slots.find(el => el[0] === clazz && el[1] === signal && el[2] === slot)) {
      this._slots.push([clazz, signal, slot])
    }
  }

  disconnectSignal(clazz: string, signal: string, slot: MxSlotFn) {
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

  private clearAll() {
    this.logger.log('MxModuleContext', 'clearAll()')

    const {_fwCtx} = this

    this._listeners?.forEach(el => _fwCtx.events.removeListener(el[0], el[1]))
    this._listeners = undefined

    this._slots?.forEach(el => _fwCtx.services.disconnectSignal(el[0], el[1], el[2]))
    this._slots = undefined

    this._linkers?.forEach(el => _fwCtx.services.unlink(el[0], el[1]))
    this._linkers = undefined

    _fwCtx.services.unregisterAll(this)
  }
}
