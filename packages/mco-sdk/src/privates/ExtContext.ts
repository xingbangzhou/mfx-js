import Service from '../Service'
import {
  McoEventListener,
  McoEventListenerHolder,
  McoModuleContextFuncs,
  McoServiceLinker,
  McoServiceLinkerHolder,
  McoServiceSlot,
  McoServiceSlotHolder,
} from '../types'

enum AskCommand {
  Ready = 'activator.ready',
  Link = 'activator.link',
  Unlink = 'activator.unlink',
  ConnectSignal = 'activator.connect_signal',
  DisconnectSignal = 'activator.disconnect_signal',
  Invoke = 'activator.invoke',
  Inoke0 = 'activator.invoke0',
  PostEvent = 'activator.post_event',
  AddEventListener = 'activator.add_event_listener',
  RemoveEventListener = 'activator.remove_event_listener',
}

enum RespCommand {
  Ready = 'module.ready',
  LinkStatus = 'module.linke_status',
  InvokeResult = 'module.invoke_result',
  Signal = 'module.signal',
  Event = 'module.event',
}

interface InvokeResolve {
  (result: any): void
}

interface InvokeReject {
  (error: any): void
}

const INVINTERVALMS = 5000
let invTime = new Date().getTime()
let invIndex = 0
function invokeId() {
  const curTime = new Date().getTime()
  if (curTime !== invTime) {
    invTime = curTime
    invIndex = 0
  } else {
    invIndex++
  }
  return `${invTime}_${invIndex}`
}

export default abstract class ExtContext implements McoModuleContextFuncs {
  constructor() {}

  private fwReady = false
  private blockCmds?: [string, any[]][]
  private lnks?: Record<string, McoServiceLinker[]>
  private slots?: Record<string, McoServiceSlot[]>
  private invs?: Record<string, [number, InvokeResolve, InvokeReject]>
  private invIntervalId?: number
  private listeners?: Record<string, McoEventListener[]>

  resize(width: number, height: number) {
    this.callInvoke(AskCommand.Inoke0, 'resize', width, height)
  }

  register(_service: Service): void {
    console.error("[ContextProxy]: don't realize registerService")
  }

  unregister(_service: Service): void {
    console.error("[ContextProxy]: don't realize unregisterService")
  }

  link(sId: string, connn: McoServiceLinker): McoServiceLinkerHolder {
    if (!this.lnks) this.lnks = {}
    const l = this.lnks[sId] || []
    if (!l.includes(connn)) {
      l.push(connn)
    }
    this.lnks[sId] = l

    this.command(AskCommand.Link, sId)

    return new McoServiceLinkerHolder(this, sId, connn)
  }

  unlink(sId: string, connn: McoServiceLinker) {
    const l = this.lnks?.[sId]
    if (!l) return
    const idx = l.indexOf(connn)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.lnks?.[sId]
        this.command(AskCommand.Unlink, sId)
      }
    }
  }

  async invoke(uri: string, ...args: any[]) {
    return this.callInvoke(AskCommand.Invoke, uri, ...args)
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder {
    if (!this.slots) this.slots = {}
    const l = this.slots[uri] || []
    if (!l.includes(slot)) {
      l.push(slot)
    }
    this.slots[uri] = l

    this.command(AskCommand.ConnectSignal, uri)

    return new McoServiceSlotHolder(this, uri, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const l = this.slots?.[uri]
    if (!l) return
    const idx = l.indexOf(slot)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.slots?.[uri]
        this.command(AskCommand.DisconnectSignal, uri)
      }
    }
  }

  postEvent(event: string, ...args: any[]) {
    this.command(AskCommand.PostEvent, event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener): McoEventListenerHolder | undefined {
    if (!this.listeners) this.listeners = {}
    const l = this.listeners[event] || []
    if (!l.includes(listener)) {
      l.push(listener)
    }
    this.listeners[event] = l

    this.command(AskCommand.AddEventListener, event)

    return new McoEventListenerHolder(this, event, listener)
  }

  removeEventListener(event: string, listener: McoEventListener) {
    const l = this.listeners?.[event]
    if (!l) return
    const idx = l.indexOf(listener)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.listeners?.[event]
        this.command(AskCommand.RemoveEventListener, event)
      }
    }
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  protected ready() {
    this.postMessage(AskCommand.Ready)
  }

  protected onHandle = (cmd: string, ...args: any[]) => {
    switch (cmd) {
      case RespCommand.Ready:
        this.onReady()
        break
      case RespCommand.LinkStatus:
        const [on, sId] = args
        this.onLinkStatus(on, sId)
        break
      case RespCommand.InvokeResult:
        const [id, result] = args
        this.onInvokeResult(id, result)
        break
      case RespCommand.Signal:
        {
          const [uri, ...params] = args
          this.onSignal(uri, ...params)
        }
        break
      case RespCommand.Event:
        {
          const [event, ...params] = args
          this.onEvent(event, ...params)
        }
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

  private onReady() {
    if (this.fwReady) return
    this.fwReady = true

    this.blockCmds?.forEach(([cmd, args]) => this.postMessage(cmd, ...args))
    this.blockCmds = undefined
  }

  private onLinkStatus(on: boolean, sId: string) {
    const list = this.lnks?.[sId]
    list?.forEach(el => el(on, sId))
  }

  private onInvokeResult(id: string, result: any) {
    const inv = this.invs?.[id]
    if (inv) {
      inv[1](result)
      delete this.invs?.[id]
    }
  }

  private onSignal(uri: string, ...args: any[]) {
    const list = this.slots?.[uri]
    list?.forEach(el => el(uri, ...args))
  }

  private onEvent(event: string, ...args: any[]) {
    const list = this.listeners?.[event]
    list?.forEach(el => el(event, ...args))
  }

  private async callInvoke(cmd: string, uri: string, ...args: any[]): Promise<any> {
    const result = await new Promise((resolve, reject) => {
      if (!this.invs) this.invs = {}
      const id = invokeId()
      this.invs[id] = [new Date().getTime(), resolve, reject]
      if (!this.invIntervalId) {
        this.invIntervalId = window.setInterval(this.onInvokeInterval, INVINTERVALMS)
      }
      this.command(cmd, id, uri, ...args)
    })

    return result
  }

  private onInvokeInterval = () => {
    const curTime = new Date().getTime()
    let count = 0
    for (const id in this.invs) {
      count++
      const inv = this.invs[id]
      if (curTime - inv[0] < INVINTERVALMS) continue
      inv[2]('invoke timeout!')
      delete this.invs[id]
      count--
    }
    if (!count) {
      this.invs = undefined
      window.clearInterval(this.invIntervalId)
      this.invIntervalId = undefined
    }
  }
}
