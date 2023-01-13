import {MfxLinkHandler, MfxSignalHandler, MfxEventListener, MfxContextExecutor} from './types'
import MfxService from './Service'

export default interface MfxModuleContextFuncs {
  /**
   * 注册服务
   * @param service 服务类对象
   */
  register(service: MfxService): void
  /**
   * @brief 反注册服务
   * @param service 服务类对象
   */
  unregister(service: MfxService): void
  /**
   * 建立服务连接
   * @param clazz 服务名
   * @param linker 处理函数
   */
  link(clazz: string, linker: MfxLinkHandler): void
  /**
   * 断开服务连接
   * @param clazz 服务名
   * @param linker 处理函数
   */
  unlink(clazz: string, linker: MfxLinkHandler): void
  /**
   * 调用服务注册函数
   * @param clazz 服务名
   * @param name 函数名
   * @param args 参数列表
   */
  invoke(clazz: string, name: string, ...args: any[]): Promise<any>
  /**
   * 连接服务信号
   * @param clazz 服务名
   * @param signal 信号
   * @param slot 处理函数
   */
  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler): void
  /**
   * 断开服务信号
   * @param clazz 服务名
   * @param signal 信号
   * @param slot 处理函数
   */
  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler): void
  /**
   * 添加事件监听
   * @param event 事件名
   * @param listener 监听函数
   */
  addEventListener(event: string, listener: MfxEventListener): void
  /**
   * 移除事件监听
   * @param event 事件名
   * @param listener 监听函数
   */
  removeEventListener(event: string, listener: MfxEventListener): void
  /**
   * 发送事件
   * @param event 事件名
   * @param args 参数列表
   */
  postEvent(event: string, ...args: any[]): void
  /**
   * 设置执行函数
   * @param name 函数名
   * @param handler 处理函数
   */
  setExecutor(name: string, executor?: MfxContextExecutor): void
  /**
   * 执行设置的函数
   * @param name 函数名
   * @param args 参数列表
   */
  execute(name: string, ...args: any[]): Promise<any>
}
