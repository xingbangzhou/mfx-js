import {MfxLinkHandler, MfxSignalHandler, MfxEventListener} from './types'
import MfxService from './Service'

export default interface MfxModuleContextFuncs {
  register(service: MfxService): void
  unregister(service: MfxService): void

  link(clazz: string, linker: MfxLinkHandler): void
  unlink(clazz: string, linker: MfxLinkHandler): void

  invoke(clazz: string, name: string, ...args: any[]): Promise<any>

  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler): void
  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler): void

  addEventListener(event: string, listener: MfxEventListener): void
  removeEventListener(event: string, listener: MfxEventListener): void
  postEvent(event: string, ...args: any[]): void
}
