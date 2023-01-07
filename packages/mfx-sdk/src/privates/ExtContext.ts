import {MfxEventListener, MfxLinkHandler, MfxModuleContextFuncs, MfxService, MfxSignalHandler} from '@mfx0/base'
import InvokePool from './InvokePool'

enum SdkCommand {
  Ready = 'mfx-sdk:ready',
  Link = 'mfx-sdk:link',
  Unlink = 'mfx-sdk:unlink',
  ConnectSignal = 'mfx-sdk:connect_signal',
  DisconnectSignal = 'mfx-sdk:disconnect_signal',
  Invoke = 'mfx-sdk:invoke',
  InvokeSelf = 'mfx-sdk:invoke_self',
  PostEvent = 'mfx-sdk:post_event',
  AddEventListener = 'mfx-sdk:add_event_listener',
  RemoveEventListener = 'mfx-sdk:remove_event_listener',
}

enum FrameworkCommand {
  Ready = 'mfx-framework:::ready',
  LinkStatus = 'mfx-framework:::link_status',
  InvokeResult = 'mfx-framework:::call_result',
  Signal = 'mfx-framework:::signal',
  Event = 'mfx-framework:::event',
}

export default abstract class ExtContext implements MfxModuleContextFuncs {
  constructor() {}

  private fwReady = false
  private blockCmds?: [string, any[]][]
  private linkers?: Record<string, MfxLinkHandler[]>
  private slots: [string, string, MfxSignalHandler[]][] = []
  private listeners?: Record<string, MfxEventListener[]>

  private invokePool = new InvokePool()

  register(service: MfxService): void {
    service
    console.error("[ContextProxy]: don't realize registerService")
  }

  unregister(service: MfxService): void {
    service
    console.error("[ContextProxy]: don't realize unregisterService")
  }

  link(clazz: string, linker: MfxLinkHandler) {
    if (!this.linkers) this.linkers = {}
    const l = this.linkers[clazz] || []
    if (l.includes(linker)) return
    l.push(linker)
    this.linkers[clazz] = l

    this.command(SdkCommand.Link, clazz)
  }

  unlink(clazz: string, linker: MfxLinkHandler) {
    const l = this.linkers?.[clazz]
    if (!l) return
    const idx = l.indexOf(linker)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.linkers?.[clazz]
        this.command(SdkCommand.Unlink, clazz)
      }
    }
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    const result = await this.invoke0(SdkCommand.Invoke, clazz, name, ...args)
    return result
  }

  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    const sl = this.slots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    if (sl?.includes(slot)) return
    if (!sl) {
      this.slots.push([clazz, signal, [slot]])
    } else {
      sl.push(slot)
    }

    this.command(SdkCommand.ConnectSignal, clazz, signal)
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    const ss: [string, string, MfxSignalHandler[]][] = []

    for (let i = 0, l = this.slots.length; i < l; i++) {
      const si = this.slots[i]
      if (si[0] === clazz && si[1] === signal) {
        const sl = si[2]
        const idx = sl.indexOf(slot)
        if (idx !== -1) {
          sl.splice(idx, 1)
          if (!sl.length) {
            this.command(SdkCommand.DisconnectSignal, clazz, signal)
            continue
          }
        }
      }
      ss.push(si)
    }

    this.slots = ss
  }

  postEvent(event: string, ...args: any[]) {
    this.command(SdkCommand.PostEvent, event, ...args)
  }

  addEventListener(event: string, listener: MfxEventListener) {
    if (!this.listeners) this.listeners = {}
    const l = this.listeners[event] || []
    if (l.includes(listener)) return
    l.push(listener)
    this.listeners[event] = l

    this.command(SdkCommand.AddEventListener, event)
  }

  removeEventListener(event: string, listener: MfxEventListener) {
    const l = this.listeners?.[event]
    if (!l) return
    const idx = l.indexOf(listener)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.listeners?.[event]
        this.command(SdkCommand.RemoveEventListener, event)
      }
    }
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  protected imReady() {
    this.postMessage(SdkCommand.Ready)
  }

  protected onCommand = (cmd: string, ...args: any[]) => {
    switch (cmd) {
      case FrameworkCommand.Ready:
        this.onFwReady()
        break
      case FrameworkCommand.LinkStatus:
        const [on, clazz] = args
        this.onLinkStatus(on, clazz)
        break
      case FrameworkCommand.InvokeResult:
        const [id, result] = args
        this.onInvokeResult(id, result)
        break
      case FrameworkCommand.Signal:
        this.onSignal(...args)
        break
      case FrameworkCommand.Event:
        this.onEvent(...args)
        break
      default:
        break
    }
  }

  private command(cmd: string, ...args: any[]) {
    if (this.fwReady) {
      this.postMessage(cmd, ...args)
      return
    }
    if (!this.blockCmds) this.blockCmds = [[cmd, args]]
    else this.blockCmds.push([cmd, args])
  }

  private onFwReady() {
    if (this.fwReady) return
    this.fwReady = true

    this.blockCmds?.forEach(([cmd, args]) => this.postMessage(cmd, ...args))
    this.blockCmds = undefined
  }

  private onLinkStatus(on: boolean, clazz: string) {
    const lks = this.linkers?.[clazz]
    lks?.forEach(el => el(on, clazz))
  }

  private onInvokeResult(id: string, result: any) {
    this.invokePool.resolve(id, result)
  }

  private onSignal(...args: any[]) {
    const [clazz, signal] = args.slice(-2)
    const sl = this.slots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    sl?.forEach(el => el(...args))
  }

  private onEvent(...args: any[]) {
    const [event] = args.slice(-1)
    const list = this.listeners?.[event]
    list?.forEach(el => el(...args))
  }

  private async invoke0(cmd: string, ...args: any[]) {
    const {id, result} = this.invokePool.invoke()
    this.command(cmd, id, ...args)

    return result
  }
}
