import Service from '../Service'
import {
  McoModuleContextFuncs,
  McoServiceConnn,
  McoServiceConnnHolder,
  McoServiceSlot,
  McoServiceSlotHolder,
} from '../types'

enum BCommand {
  Ready = 'rpc.ready',
  ConnectService = 'rpc.connnect_service',
  DisconnectService = 'rpc.disconnect_service',
  ConnectSignal = 'rpc.connect_signal',
  DisconnectSignal = 'rpc.disconnect_signal',
  InvokeMethod = 'rsp.invoke_method',
}

enum FCommand {
  FwReady = 'rpc.fwready',
  ServiceConnection = 'rpc.service_connection',
  InvokeResult = 'rpc.invoke_result',
  SignalSlot = 'rpc.signal_slot',
}

interface InvokeResolve {
  (result: any): void
}

interface InvokeReject {
  (error: any): void
}

let invokeTime = new Date().getTime()
let invokeIndex = 0
const INVOKETIMEMS = 5000
function invokeId() {
  const curTime = new Date().getTime()
  if (curTime !== invokeTime) {
    invokeTime = curTime
    invokeIndex = 0
  } else {
    invokeIndex++
  }
  return `${invokeTime}_${invokeIndex}`
}

export default abstract class ContextProxy implements McoModuleContextFuncs {
  constructor() {}
  invokeFunc(uri: string, ...args: any[]): Promise<any> {
    throw new Error('Method not implemented.')
  }

  private fwReady = false
  private blockCmds?: [string, any[]][]
  private connns?: Record<string, McoServiceConnn[]>
  private slots?: Record<string, McoServiceSlot[]>
  private invs?: Record<string, [number, InvokeResolve, InvokeReject]>
  private invIntervalId?: number

  registerService(_service: Service): void {
    console.error("[ContextProxy]: don't realize registerService")
  }
  unregisterService(_service: Service): void {
    console.error("[ContextProxy]: don't realize unregisterService")
  }

  connectService(sId: string, connn: McoServiceConnn): McoServiceConnnHolder {
    if (!this.connns) this.connns = {}
    const list = this.connns[sId] || []
    if (!list.includes(connn)) {
      list.push(connn)
    }
    this.connns[sId] = list

    this.command(BCommand.ConnectService, sId)

    return new McoServiceConnnHolder(this, sId, connn)
  }

  disconnectService(sId: string, connn: McoServiceConnn) {
    const list = this.connns?.[sId]
    if (!list) return
    const idx = list.indexOf(connn)
    if (idx && idx !== -1) {
      list.splice(idx, 1)
      if (!list.length) {
        delete this.connns?.[sId]
        this.command(BCommand.DisconnectService, sId)
      }
    }
  }

  async invokeService(uri: string, ...args: any[]) {
    return this.invoke('service', uri, ...args)
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder {
    if (!this.slots) this.slots = {}
    const list = this.slots[uri] || []
    if (!list.includes(slot)) {
      list.push(slot)
    }
    this.slots[uri] = list

    this.command(BCommand.ConnectSignal, uri)

    return new McoServiceSlotHolder(this, uri, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const list = this.slots?.[uri]
    if (!list) return
    const idx = list?.indexOf(slot)
    if (idx && idx !== -1) {
      list.splice(idx, 1)
      if (!list.length) {
        delete this.slots?.[uri]
        this.command(BCommand.DisconnectSignal, uri)
      }
    }
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  resize(width: number, height: number) {
    this.invoke('member', 'resize', width, height)
  }

  protected imReady() {
    this.postMessage(BCommand.Ready)
  }

  protected onHandle = (cmd: string, ...args: any[]) => {
    switch (cmd) {
      case FCommand.FwReady:
        this.onFwReady()
        break
      case FCommand.ServiceConnection:
        const [on, sId] = args
        this.onServiceConnection(on, sId)
        break
      case FCommand.InvokeResult:
        const [id, result] = args
        this.onInvokeResult(id, result)
        break
      case FCommand.SignalSlot:
        const [uri, ...params] = args
        this.onSignalSlot(uri, ...params)
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

  private onInvokeInterval = () => {
    const curTime = new Date().getTime()
    let count = 0
    for (const id in this.invs) {
      count++
      const inv = this.invs[id]
      if (curTime - inv[0] < INVOKETIMEMS) continue
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

  private onFwReady() {
    if (this.fwReady) return
    this.fwReady = true

    this.blockCmds?.forEach(([cmd, args]) => this.postMessage(cmd, ...args))
    this.blockCmds = undefined
  }

  private onServiceConnection(on: boolean, sId: string) {
    const list = this.connns?.[sId]
    list?.forEach(el => el(on, sId))
  }

  private onInvokeResult(id: string, result: any) {
    const inv = this.invs?.[id]
    if (inv) {
      inv[1](result)
      delete this.invs?.[id]
    }
  }

  private onSignalSlot(uri: string, ...args: any[]) {
    const list = this.slots?.[uri]
    list?.forEach(el => el(uri, ...args))
  }

  private async invoke(mode: 'service' | 'member', uri: string, ...args: any[]) {
    const result = await new Promise((resolve, reject) => {
      if (!this.invs) this.invs = {}
      const id = invokeId()
      this.invs[id] = [new Date().getTime(), resolve, reject]
      if (!this.invIntervalId) {
        this.invIntervalId = window.setInterval(this.onInvokeInterval, INVOKETIMEMS)
      }
      this.command(BCommand.InvokeMethod, mode, id, uri, ...args)
    })

    return result
  }
}
