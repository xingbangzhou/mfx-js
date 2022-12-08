import Service from '../Service'
import {McoEventListener, McoModuleContextFuncs, McoServiceLinker, McoServiceSlot} from '../types'

enum MdiCommand {
  Ready = 'mco-mdi:ready',
  Link = 'mco-mdi:link',
  Unlink = 'mco-mdi:unlink',
  ConnectSignal = 'mco-mdi:connect_signal',
  DisconnectSignal = 'mco-mdi:disconnect_signal',
  Invoke = 'mco-mdi:invoke',
  Method = 'mco-mdi:method',
  PostEvent = 'mco-mdi:post_event',
  AddEventListener = 'mco-mdi:add_event_listener',
  RemoveEventListener = 'mco-mdi:remove_event_listener',
}

enum FrameworkCommand {
  Ready = 'mco-framework:ready',
  LinkStatus = 'mco-framework:link_status',
  CallResult = 'mco-framework:call_result',
  Signal = 'mco-framework:signal',
  Event = 'mco-framework:event',
}

const CALLINTERVALMS = 5000
let callTime = new Date().getTime()
let callIndex = 0

function callId() {
  const curTime = new Date().getTime()
  if (curTime !== callTime) {
    callTime = curTime
    callIndex = 0
  } else {
    callIndex++
  }
  return `${callTime}_${callIndex}`
}

interface CallResolve {
  (result: any): void
}

interface CallReject {
  (error: any): void
}

export default abstract class ExtContext implements McoModuleContextFuncs {
  constructor() {}

  private fwReady = false
  private blockCmds?: [string, any[]][]
  private linkers?: Record<string, McoServiceLinker[]>
  private slots: [string, string, McoServiceSlot[]][] = []
  private calls?: Record<string, [number, CallResolve, CallReject]>
  private callTimerId?: number
  private listeners?: Record<string, McoEventListener[]>

  register(service: Service): void {
    service
    console.error("[ContextProxy]: don't realize registerService")
  }

  unregister(service: Service): void {
    service
    console.error("[ContextProxy]: don't realize unregisterService")
  }

  link(clazz: string, linker: McoServiceLinker) {
    if (!this.linkers) this.linkers = {}
    const l = this.linkers[clazz] || []
    if (!l.includes(linker)) {
      l.push(linker)
    }
    this.linkers[clazz] = l

    this.command(MdiCommand.Link, clazz)
  }

  unlink(clazz: string, linker: McoServiceLinker) {
    const l = this.linkers?.[clazz]
    if (!l) return
    const idx = l.indexOf(linker)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.linkers?.[clazz]
        this.command(MdiCommand.Unlink, clazz)
      }
    }
  }

  async invoke(clazz: string, name: string, ...args: any[]) {
    return this.callFunc(MdiCommand.Invoke, clazz, name, ...args)
  }

  connectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    const sl = this.slots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    if (!sl) {
      this.slots.push([clazz, signal, [slot]])
    } else if (!sl.includes(slot)) {
      sl.push(slot)
    }

    this.command(MdiCommand.ConnectSignal, clazz, signal)
  }

  disconnectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    const ss: [string, string, McoServiceSlot[]][] = []

    for (let i = 0, l = this.slots.length; i < l; i++) {
      const si = this.slots[i]
      if (si[0] === clazz && si[1] === signal) {
        const sl = si[2]
        const idx = sl.indexOf(slot)
        if (idx !== -1) {
          sl.splice(idx, 1)
          if (!sl.length) {
            this.command(MdiCommand.DisconnectSignal, clazz, signal)
            continue
          }
        }
      }
      ss.push(si)
    }

    this.slots = ss
  }

  postEvent(event: string, ...args: any[]) {
    this.command(MdiCommand.PostEvent, event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener) {
    if (!this.listeners) this.listeners = {}
    const l = this.listeners[event] || []
    if (!l.includes(listener)) {
      l.push(listener)
    }
    this.listeners[event] = l

    this.command(MdiCommand.AddEventListener, event)
  }

  removeEventListener(event: string, listener: McoEventListener) {
    const l = this.listeners?.[event]
    if (!l) return
    const idx = l.indexOf(listener)
    if (idx !== -1) {
      l.splice(idx, 1)
      if (!l.length) {
        delete this.listeners?.[event]
        this.command(MdiCommand.RemoveEventListener, event)
      }
    }
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  protected imReady() {
    this.postMessage(MdiCommand.Ready)
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
      case FrameworkCommand.CallResult:
        const [id, result] = args
        this.onCallResult(id, result)
        break
      case FrameworkCommand.Signal:
        {
          const [clazz, signal, ...params] = args
          this.onSignal(clazz, signal, ...params)
        }
        break
      case FrameworkCommand.Event:
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

  private onCallResult(id: string, result: any) {
    const inv = this.calls?.[id]
    if (inv) {
      inv[1](result)
      delete this.calls?.[id]
    }
  }

  private onSignal(clazz: string, signal: string, ...args: any[]) {
    const sl = this.slots.find(el => el[0] === clazz && el[1] === signal)?.[2]
    sl?.forEach(el => el(clazz, signal, ...args))
  }

  private onEvent(event: string, ...args: any[]) {
    const list = this.listeners?.[event]
    list?.forEach(el => el(event, ...args))
  }

  private async callFunc(cmd: string, ...args: any[]): Promise<any> {
    const result = await new Promise((resolve, reject) => {
      if (!this.calls) this.calls = {}
      const id = callId()
      this.calls[id] = [new Date().getTime(), resolve, reject]
      if (!this.callTimerId) {
        this.callTimerId = window.setInterval(this.onCallInterval, CALLINTERVALMS)
      }
      this.command(cmd, id, ...args)
    })

    return result
  }

  private onCallInterval = () => {
    const curTime = new Date().getTime()
    let count = 0
    for (const id in this.calls) {
      count++
      const inv = this.calls[id]
      if (curTime - inv[0] < CALLINTERVALMS) continue
      inv[2]('invoke timeout!')
      delete this.calls[id]
      count--
    }
    if (!count) {
      this.calls = undefined
      window.clearInterval(this.callTimerId)
      this.calls = undefined
    }
  }
}
