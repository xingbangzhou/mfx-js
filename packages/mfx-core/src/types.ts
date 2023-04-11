import type MxService from './Service'

export interface MxLinkHandler {
  (on: boolean, cl: string): void
}

export interface MxInvokableFn {
  (...args: any[]): any
}

export interface MxSlotFn {
  (...args: any[]): void
}

export interface MxEventListener {
  (...args: any[]): void
}

export interface MxModuleCtxFn {
  (...args: any[]): Promise<any>
}

export interface MxModuleContextFuncs {
  /**
   * 服务注册与反注册
   * @param service 服务类对象
   */
  register(service: MxService): void
  unregister(service: MxService): void
  /**
   * 服务监听与反监听
   * @param clazz 服务名
   * @param linker 处理函数
   */
  link(clazz: string, linker: MxLinkHandler): void
  unlink(clazz: string, linker: MxLinkHandler): void
  /**
   * 服务调用
   * @param clazz 服务名
   * @param name 函数名
   * @param args 参数列表
   */
  invoke(clazz: string, name: string, ...args: any[]): Promise<any>
  /**
   * 服务信号连接与反连接
   * @param clazz 服务名
   * @param signal 信号
   * @param slot 处理函数
   */
  connectSignal(clazz: string, signal: string, slot: MxSlotFn): void
  disconnectSignal(clazz: string, signal: string, slot: MxSlotFn): void
  // 全局事件
  addEventListener(event: string, listener: MxEventListener): void
  removeEventListener(event: string, listener: MxEventListener): void
  postEvent(event: string, ...args: any[]): void
  // 日志函数
  log(name: string, ...args: any[]): void

  // 上下文扩展
  // setCtxFn(name: string, fn?: MxModuleCtxFn): void
  // callCtxFn(name: string, ...args: any[]): Promise<any>
  // // 监听上下文事件
  // listenCtxEvent(event: string, listener: MxEventListener): void
  // // 反监听上下文事件
  // unlistenCtxEvent(event: string, listener: MxEventListener): void
  // // 发出上下文事件
  // emitCtxEvent(event: string, ...args: any[]): void
}
