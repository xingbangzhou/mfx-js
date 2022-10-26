import {McoServiceFunc, McoServiceSlot} from './types'
import {EventEmitter} from '@mco/utils'

export default class McoService {
  constructor(sId: string) {
    this._sId = sId
  }

  private _sId: string
  private regFuncs?: Record<string, McoServiceFunc>
  private emitter = new EventEmitter()

  get sId() {
    return this._sId
  }

  /**
   * @brief 注册服务方法
   * @param name 方法名
   * @param method 方法函数
   */
  registerFunc(name: string, method: McoServiceFunc) {
    if (!this.regFuncs) this.regFuncs = {}
    this.regFuncs[name] = method
  }

  /**
   * @brief 调用服务方法
   * @param name 方法名
   * @param args 参数列表
   * @returns Promise<any>
   */
  async invoke(name: string, ...args: any[]) {
    const method = this.regFuncs?.[name]
    if (method) return await method.call(this, ...args)

    return undefined
  }

  // Signal Functions
  connectSignal(signal: string, slot: McoServiceSlot) {
    if (!signal) return

    return this.emitter.on(signal, slot)
  }

  disconnectSignal(signal: string, slot: McoServiceSlot) {
    this.emitter.off(signal, slot)
  }

  protected emitSignal(signal: string, ...args: any[]) {
    this.emitter.emit(signal, `${this.sId}/${signal}`, ...args)
  }
}
