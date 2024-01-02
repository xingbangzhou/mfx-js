export interface MxLinkHandler {
  (on: boolean, cl: string): void
}

export interface MxInvokeHandler {
  (...args: any[]): any
}

export interface MxSlotHandler {
  (...args: any[]): void
}

export interface MxEventListener {
  (...args: any[]): void
}

export interface MxContextHandler {
  (...args: any[]): Promise<any>
}

export interface MxService {
  // 服务ID
  readonly clazz: string
  // 导出接口
  invoke(name: string, ...args: any[]): Promise<any>
  // 监听信号
  connectSignal(signal: string, slot: MxSlotHandler): unknown
  // 取消监听信号
  disconnectSignal(signal: string, slot: MxSlotHandler): unknown
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
  connectSignal(clazz: string, signal: string, slot: MxSlotHandler): void
  disconnectSignal(clazz: string, signal: string, slot: MxSlotHandler): void
  // 全局事件
  addEventListener(event: string, listener: MxEventListener): void
  removeEventListener(event: string, listener: MxEventListener): void
  postEvent(event: string, ...args: any[]): void
  // 日志函数
  log(name: string, ...args: any[]): void
  /** 模块上下文扩展 */
  // 设置上下文接口
  ctxSetHandler(name: string, extender: MxContextHandler): void
  // 调用上下文接口
  ctxInvoke(name: string, ...args: any[]): Promise<any>
  // 监听上下文事件
  ctxOnEvent(event: string, listener: MxEventListener): void
  // 取监上下文事件
  ctxOffEvent(event: string, listener: MxEventListener): void
  // 发出上下文事件
  ctxEmitEvent(event: string, ...args: any[]): void
}
