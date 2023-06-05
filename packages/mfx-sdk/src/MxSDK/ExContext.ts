import {
  MxEventListener,
  MxLinkHandler,
  MxSlotHandler,
  MxModuleContextFuncs,
  MxContextExtender,
} from '@mfx-js/core/types'
import MxService from '@mfx-js/core/Service'
import InvokePool from './InvokePool'

enum SdkCommand {
  Ready = 'mx-sdk:ready',
  Link = 'mx-sdk:link',
  Unlink = 'mx-sdk:unlink',
  ConnectSignal = 'mx-sdk:connect_signal',
  DisconnectSignal = 'mx-sdk:disconnect_signal',
  Invoke = 'mx-sdk:invoke',
  AddEventListener = 'mx-sdk:add_event_listener',
  RemoveEventListener = 'mx-sdk:remove_event_listener',
  PostEvent = 'mx-sdk:post_event',
  Log = 'mx-sdk:log',
  InvokeEx = 'mx-sdk:invoke_ex',
  OnExEvent = 'mx-sdk:on_ex_event',
  OffExEvent = 'mx-sdk:off_ex_event',
  EmitExEvent = 'mx-sdk:emit_ex_event',
}

enum FrameworkCommand {
  Ready = 'mx-framework:ready',
  LinkStatus = 'mx-framework:link_status',
  InvokeResult = 'mx-framework:invole_result',
  Signal = 'mx-framework:signal',
  Event = 'mx-framework:event',
  ExEvent = 'mx-framework:ex_event',
}

export default abstract class MxExContext implements MxModuleContextFuncs {
  constructor() {}

  private _fwReady = false
  private _ensureFns?: Array<() => void>

  private _clazzLinks: Record<string, MxLinkHandler[]> = {}
  private _clazzSlots: [string, string, MxSlotHandler[]][] = []
  private _eventListeners: Record<string, MxEventListener[]> = {}
  private _exeventListeners: Record<string, MxEventListener[]> = {}
  private _invokePool = new InvokePool()

  async ensure() {
    return new Promise<void>(resolve => {
      if (this._fwReady) {
        resolve()
        return
      }
      if (!this._ensureFns) this._ensureFns = []
      this._ensureFns.push(resolve)
    })
  }

  register(service: MxService): void {
    service
    console.error("[MxExContext]: don't realize registerService")
  }

  unregister(service: MxService): void {
    service
    console.error("[MxExContext]: don't realize unregisterService")
  }

  link(clazz: string, linker: MxLinkHandler) {
    const links = this._clazzLinks[clazz]
    if (links?.length) {
      links.includes(linker) || links.push(linker)
      return
    }

    this._clazzLinks[clazz] = [linker]
    this.command(SdkCommand.Link, clazz)
  }

  unlink(clazz: string, linker: MxLinkHandler) {
    const links = this._clazzLinks[clazz]
    if (!links) return
    const idx = links.indexOf(linker)
    if (idx !== -1) {
      links.splice(idx, 1)
      if (!links.length) {
        delete this._clazzLinks[clazz]
        this.command(SdkCommand.Unlink, clazz)
      }
    }
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    const result = await this.invoke0(SdkCommand.Invoke, clazz, name, ...args)
    return result
  }

  connectSignal(clazz: string, signal: string, slot: MxSlotHandler) {
    const slots = this._clazzSlots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    if (slots?.length) {
      slots.push(slot)
      return
    }

    this._clazzSlots.push([clazz, signal, [slot]])
    this.command(SdkCommand.ConnectSignal, clazz, signal)
  }

  disconnectSignal(clazz: string, signal: string, slot: MxSlotHandler) {
    const clazzSlots: [string, string, MxSlotHandler[]][] = []

    for (let i = 0, l = this._clazzSlots.length; i < l; i++) {
      const si = this._clazzSlots[i]
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
      clazzSlots.push(si)
    }

    this._clazzSlots = clazzSlots
  }

  addEventListener(event: string, listener: MxEventListener) {
    const listeners = this._eventListeners[event]
    if (listeners?.length) {
      listeners.push(listener)
      return
    }

    this._eventListeners[event] = [listener]
    this.command(SdkCommand.AddEventListener, event)
  }

  removeEventListener(event: string, listener: MxEventListener) {
    const listeners = this._eventListeners[event]
    if (!listeners) return
    const idx = listeners.indexOf(listener)
    if (idx !== -1) {
      listeners.splice(idx, 1)
      if (!listeners.length) {
        delete this._eventListeners[event]
        this.command(SdkCommand.RemoveEventListener, event)
      }
    }
  }

  postEvent(event: string, ...args: any[]) {
    this.command(SdkCommand.PostEvent, event, ...args)
  }

  log(name: string, ...args: any[]) {
    this.command(SdkCommand.Log, name, ...args)
  }

  setExtender(name: string, fn?: MxContextExtender) {
    name
    fn
    console.error("[MxExContext]: don't realize setExecutor")
  }

  async invokeEx(name: string, ...args: any[]) {
    const fn = (this as any)[name]
    if (typeof fn === 'function') {
      return await fn.call(this, ...args)
    }

    return await this.invoke0(SdkCommand.InvokeEx, name, ...args)
  }

  onExEvent(event: string, listener: MxEventListener) {
    const listeners = this._exeventListeners[event]
    if (listeners?.length) {
      listeners.push(listener)
      return
    }

    this._exeventListeners[event] = [listener]
    this.command(SdkCommand.OnExEvent, event)
  }

  offExEvent(event: string, listener: MxEventListener) {
    const listeners = this._exeventListeners[event]
    if (!listeners) return
    const idx = listeners.indexOf(listener)
    if (idx !== -1) {
      listeners.splice(idx, 1)
      if (!listeners.length) {
        delete this._exeventListeners[event]
        this.command(SdkCommand.OffExEvent, event)
      }
    }
  }

  emitExEvent(event: string, ...args: any[]) {
    this.command(SdkCommand.EmitExEvent, event, ...args)
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
        this.handleEvent(...args)
        break
      case FrameworkCommand.ExEvent:
        this.handleExEvent(...args)
        break
      default:
        break
    }
  }

  private command(cmd: string, ...args: any[]) {
    if (this._fwReady) {
      this.postMessage(cmd, ...args)
      return
    }
  }

  private onFwReady() {
    if (this._fwReady) return
    this._fwReady = true

    this.log('MxSDK', 'MxExContext.onFwReady is runned')

    // handle ensures
    this._ensureFns?.forEach(el => el())
    this._ensureFns = undefined
  }

  private onLinkStatus(on: boolean, clazz: string) {
    const links = this._clazzLinks?.[clazz]
    links?.forEach(el => el(on, clazz))
  }

  private onInvokeResult(id: string, result: any) {
    this._invokePool.resolve(id, result)
  }

  private onSignal(...args: any[]) {
    const [clazz, signal] = args.slice(-2)
    const slots = this._clazzSlots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    slots?.forEach(el => el(...args))
  }

  private handleEvent(...args: any[]) {
    const [event] = args.slice(-1)
    const listeners = this._eventListeners[event]
    listeners?.forEach(el => el(...args))
  }

  private handleExEvent(...args: any[]) {
    const [event] = args.slice(-1)
    const listeners = this._exeventListeners[event]
    listeners?.forEach(el => el(...args))
  }

  private async invoke0(cmd: string, ...args: any[]) {
    const {id, result} = this._invokePool.invoke(...args)
    this.command(cmd, id, ...args)

    return result
  }
}
