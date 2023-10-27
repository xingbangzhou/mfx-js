import EventEmitter, {EventObject} from './EventEmitter'
import {addHiddenProp, hasProp} from './shims'
import {MxInvokeHandler, MxService, MxSlotHandler} from './types'

const storedInvokableSymbol = Symbol('mxservice-invokable')

export class EventSignal<Type extends MxSlotHandler> extends EventObject<Type> {}

/**
 * 以事件为导向的服务类
 */
export default class EventService implements MxService {
  constructor(clazz?: string) {
    this._clazz = clazz
  }

  protected _clazz: string | undefined
  protected _emitter = new EventEmitter()

  private _invokes?: Record<string, MxInvokeHandler>

  /**
   * 服务ID
   */
  get clazz() {
    return this._clazz || ''
  }
  /**
   * 调用导出的方法
   * @param name 方法名
   * @param args 参数列表
   * @returns 返回值
   */
  async invoke(name: string, ...args: any[]) {
    const fn = this._invokes?.[name] || this[storedInvokableSymbol][name]
    if (!fn || typeof fn !== 'function') return undefined

    const result = await fn.call(this, ...args)
    return result
  }
  /**
   * 监听信号
   */
  connectSignal(signal: string, slot: MxSlotHandler) {
    if (!signal) return
    return this._emitter.on(signal, slot)
  }
  /**
   * 取消监听信号
   */
  disconnectSignal(signal: string, slot: MxSlotHandler) {
    this._emitter.off(signal, slot)
  }

  /**
   * 注册方法
   * @param name 方法名
   * @param func 方法对象
   */
  protected invokable(name: string, func: MxInvokeHandler) {
    if (!this._invokes) this._invokes = {}
    this._invokes[name] = func
  }
  /**
   * 分发信号
   * @param signal 信号名|信号事件对象
   * @param args 数据列表
   */
  protected emitSignal<Type extends MxSlotHandler>(signal: string | EventSignal<Type>, ...args: Parameters<Type>) {
    let signalName = ''
    if (signal instanceof EventSignal) {
      signalName = signal.name
    } else {
      signalName = signal
    }

    return this._emitter.emit(signalName, ...args, this.clazz, signalName)
  }
  /**
   * 创建信号对象1
   * @param name 信号名
   * @returns 分发单参数的信号对象
   */
  protected createSignal<P1>(name = '') {
    return new EventSignal<(p1: P1) => void>(this._emitter, name)
  }
  /**
   * 创建信号对象2
   * @param name 信号名
   * @returns 分发两个参数的信号对象
   */
  protected createSignal2<P1, P2>(name = '') {
    return new EventSignal<(p1: P1, p2: P2) => void>(this._emitter, name)
  }
  /**
   * 创建信号对象3
   * @param name 信号名
   * @returns 分发三个参数的信号对象
   */
  protected createSignal3<P1, P2, P3>(name = '') {
    return new EventSignal<(p1: P1, p2: P2, p3: P3) => void>(this._emitter, name)
  }
}

/**
 * 方式装饰器，声明导出方法
 */
export function invokable<T extends EventService>(prototype: T, propertyKey: string, descriptor: PropertyDescriptor) {
  if (!hasProp(prototype, storedInvokableSymbol)) {
    addHiddenProp(prototype, storedInvokableSymbol, {})
  }

  if (typeof descriptor.value === 'function') {
    prototype[storedInvokableSymbol][propertyKey] = descriptor.value
  }

  return descriptor
}
