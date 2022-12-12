import MscxService from './Service'

export interface MscxLinkFn {
  (on: boolean, cl: string): void
}

export interface MscxInvokeFn {
  (...args: any[]): any
}

export interface MscxSlotFn {
  (clazz: string, signal: string, ...args: any[]): void
}

export interface MscxEventListener {
  (event: string, ...args: any[]): void
}

export interface MscxModuleContextFuncs {
  register(service: MscxService): void
  unregister(service: MscxService): void

  link(clazz: string, linker: MscxLinkFn): void
  unlink(clazz: string, linker: MscxLinkFn): void

  invoke(clazz: string, name: string, ...args: any[]): Promise<any>

  connectSignal(clazz: string, signal: string, slot: MscxSlotFn): void
  disconnectSignal(clazz: string, signal: string, slot: MscxSlotFn): void

  postEvent(event: string, ...args: any[]): void

  addEventListener(event: string, listener: MscxEventListener): void
  removeEventListener(event: string, listener: MscxEventListener): void
}
