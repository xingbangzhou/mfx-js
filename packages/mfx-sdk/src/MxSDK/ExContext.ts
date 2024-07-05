import {
  MfxEventListener,
  MfxLinkHandler,
  MfxSlotHandler,
  MfxContextHandler,
  MfxService,
  MfxModuleContextFuncs,
} from '@mfx-js/core/types'
import InvokePool from './InvokePool'

enum SdkCommand {
  Ready = 'mfx-sdk:ready',
  Link = 'mfx-sdk:link',
  Unlink = 'mfx-sdk:unlink',
  ConnectSignal = 'mfx-sdk:connect_signal',
  DisconnectSignal = 'mfx-sdk:disconnect_signal',
  Invoke = 'mfx-sdk:invoke',
  AddEventListener = 'mfx-sdk:add_event_listener',
  RemoveEventListener = 'mfx-sdk:remove_event_listener',
  PostEvent = 'mfx-sdk:post_event',
  Log = 'mfx-sdk:log',
  CtxInvoke = 'mfx-sdk:ctx_invoke',
  CtxOnEvent = 'mfx-sdk:ctx_on_event',
  CtxOffEvent = 'mfx-sdk:ctx_off_event',
  CtxEmitEvent = 'mfx-sdk:ctx_emit_event',
}

enum FrameworkCommand {
  Ready = 'mfx-framework:ready',
  LinkStatus = 'mfx-framework:link_status',
  InvokeResult = 'mfx-framework:invole_result',
  Signal = 'mfx-framework:signal',
  Event = 'mfx-framework:event',
  CtxEvent = 'mfx-framework:ctx_event',
}

export default abstract class MfxExContext implements MfxModuleContextFuncs {
  constructor() {}

  private _fwReady = false
  private _ensureFns?: Array<() => void>

  private _clazzLinks: Record<string, MfxLinkHandler[]> = {}
  private _clazzSlots: [string, string, MfxSlotHandler[]][] = []
  private _eventListeners: Record<string, MfxEventListener[]> = {}
  private _ctxEventListeners: Record<string, MfxEventListener[]> = {}
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

  register(service: MfxService): void {
    service
    console.error("[MfxExContext]: don't realize registerService")
  }

  unregister(service: MfxService): void {
    service
    console.error("[MfxExContext]: don't realize unregisterService")
  }

  link(clazz: string, linker: MfxLinkHandler) {
    const links = this._clazzLinks[clazz]
    if (links?.length) {
      links.includes(linker) || links.push(linker)
      return
    }

    this._clazzLinks[clazz] = [linker]
    this.command(SdkCommand.Link, clazz)
  }

  unlink(clazz: string, linker: MfxLinkHandler) {
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

  connectSignal(clazz: string, signal: string, slot: MfxSlotHandler) {
    const slots = this._clazzSlots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    if (slots?.length) {
      slots.push(slot)
      return
    }

    this._clazzSlots.push([clazz, signal, [slot]])
    this.command(SdkCommand.ConnectSignal, clazz, signal)
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSlotHandler) {
    const clazzSlots: [string, string, MfxSlotHandler[]][] = []

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

  addEventListener(event: string, listener: MfxEventListener) {
    const listeners = this._eventListeners[event]
    if (listeners?.length) {
      listeners.push(listener)
      return
    }

    this._eventListeners[event] = [listener]
    this.command(SdkCommand.AddEventListener, event)
  }

  removeEventListener(event: string, listener: MfxEventListener) {
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

  ctxSetHandler(name: string, fn?: MfxContextHandler) {
    name
    fn
    console.error("[MfxExContext]: don't realize ctxSetHandler")
  }

  async ctxInvoke(name: string, ...args: any[]) {
    const fn = (this as any)[name]
    if (typeof fn === 'function') {
      return await fn.call(this, ...args)
    }

    return await this.invoke0(SdkCommand.CtxInvoke, name, ...args)
  }

  ctxOnEvent(event: string, listener: MfxEventListener) {
    const listeners = this._ctxEventListeners[event]
    if (listeners?.length) {
      listeners.push(listener)
      return
    }

    this._ctxEventListeners[event] = [listener]
    this.command(SdkCommand.CtxOnEvent, event)
  }

  ctxOffEvent(event: string, listener: MfxEventListener) {
    const listeners = this._ctxEventListeners[event]
    if (!listeners) return
    const idx = listeners.indexOf(listener)
    if (idx !== -1) {
      listeners.splice(idx, 1)
      if (!listeners.length) {
        delete this._ctxEventListeners[event]
        this.command(SdkCommand.CtxOffEvent, event)
      }
    }
  }

  ctxEmitEvent(event: string, ...args: any[]) {
    this.command(SdkCommand.CtxEmitEvent, event, ...args)
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
      case FrameworkCommand.CtxEvent:
        this.handleCtxEvent(...args)
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

    this.log('MfxSDK', 'MfxExContext.onFwReady is runned')

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

  private handleCtxEvent(...args: any[]) {
    const [event] = args.slice(-1)
    const listeners = this._ctxEventListeners[event]
    listeners?.forEach(el => el(...args))
  }

  private async invoke0(cmd: string, ...args: any[]) {
    const {id, result} = this._invokePool.invoke(...args)
    this.command(cmd, id, ...args)

    return result
  }
}
