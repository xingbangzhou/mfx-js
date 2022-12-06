import McoService from './Service'

export interface McoServiceLinker {
  (on: boolean, cl: string): void
}

export interface McoServiceInvoke {
  (...args: any[]): any
}

export interface McoServiceSlot {
  (clazz: string, signal: string, ...args: any[]): void
}

export interface McoEventListener {
  (event: string, ...args: any[]): void
}

export interface McoModuleContextFuncs {
  register(service: McoService): void
  unregister(service: McoService): void

  link(clazz: string, linker: McoServiceLinker): void
  unlink(clazz: string, linker: McoServiceLinker): void

  invoke(clazz: string, name: string, ...args: any[]): Promise<any>

  connectSignal(clazz: string, signal: string, slot: McoServiceSlot): void
  disconnectSignal(clazz: string, signal: string, slot: McoServiceSlot): void

  postEvent(event: string, ...args: any[]): void

  addEventListener(event: string, listener: McoEventListener): void
  removeEventListener(event: string, listener: McoEventListener): void
}
